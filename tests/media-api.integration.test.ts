import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';

// These tests call the actual university Express API routes, not mock handlers.
const root = mkdtempSync(join(tmpdir(), 'hiau-media-test-'));
const password = 'Strong-media-testing-password-2026!';
const salt = randomBytes(16).toString('hex');
process.env.HIAU_DATA_DIR = root;
process.env.HIAU_DISABLE_AUTOSTART = '1';
process.env.NODE_ENV = 'test';
process.env.HIAU_MEDIA_ADMIN_EMAIL = 'video-admin@example.test';
process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH = salt + ':' +
  scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex');

let server: Server;
let origin = '';
let cookie = '';
let csrf = '';
const api = (path: string, init: RequestInit = {}) => fetch(origin + path, init);
function write(method: string, url: string, body?: object, csrfOverride?: string) {
  return api(url, {
    method,
    headers: {
      Origin: origin,
      Cookie: cookie,
      'Content-Type': 'application/json',
      ...(csrfOverride === undefined ? { 'X-HIAU-CSRF': csrf } : csrfOverride ?
        { 'X-HIAU-CSRF': csrfOverride } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
before(async () => {
  const { app } = await import('../server');
  server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const bound = server.address();
  if (!bound || typeof bound === 'string') throw Error('Missing test port');
  origin = 'http://127.0.0.1:' + bound.port;
});
after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  rmSync(root, { recursive: true, force: true });
});
test('public library shows two default videos; unrelated ERP is still locked', async () => {
  const publicResponse = await api('/api/public-media/videos');
  assert.equal(publicResponse.status, 200);
  const publicList = await publicResponse.json();
  assert.deepEqual(publicList.videos.map((v: { id: string }) => v.id), ['campus', 'classroom']);
  assert.equal((await api('/api/students/u-student')).status, 503);
});
test('anonymous cannot list, create, upload or delete media', async () => {
  for (const [method,url] of [
    ['GET','/api/admin/public-media/videos'],
    ['POST','/api/admin/public-media/videos'],
    ['POST','/api/admin/public-media/videos/campus/upload'],
    ['DELETE','/api/admin/public-media/videos/campus'],
  ]) assert.equal((await api(url,{method})).status, 401);
});
test('login and CSRF denial on the actual server routes', async () => {
  const response = await api('/api/auth/login', {
    method:'POST',
    headers:{ Origin: origin, 'Content-Type': 'application/json' },
    body:JSON.stringify({email:'video-admin@example.test', password}),
  });
  assert.equal(response.status,200);
  const payload = await response.json();
  csrf = payload.csrf;
  cookie = (response.headers.get('set-cookie') || '').split(';')[0];
  assert.ok(cookie.startsWith('hiau_media_session='));
  assert.equal((await write('POST','/api/admin/public-media/videos',{title:'Unauthorized'},'')).status,403);
});
let newId = '';
test('create a draft and do not expose it in public listing', async () => {
  const response = await write('POST','/api/admin/public-media/videos',
    {title:'Graduation Highlights',category:'events',subtitle:'Annual university ceremony'});
  assert.equal(response.status,201);
  const data = await response.json();
  newId = data.video.id;
  assert.equal(data.video.status,'draft');
  assert.equal(data.video.featured,false);
  assert.equal((await (await api('/api/public-media/videos')).json()).videos.length,2);
});
test('cannot publish a draft without a video file', async () => {
  const response = await write('PATCH','/api/admin/public-media/videos/'+newId,
    {status:'published',featured:true});
  assert.equal(response.status,400);
});
test('reject malformed MP4 and accept uploaded video only for authorized session', async () => {
  const location = '/api/admin/public-media/videos/'+newId+'/upload';
  const bad = await api(location,{method:'POST',headers:{
    Origin:origin,Cookie:cookie,'X-HIAU-CSRF':csrf,'Content-Type':'video/mp4'
  },body:Buffer.from('not a valid mp4')});
  assert.equal(bad.status,415);
  const box = (type: string, payload: Buffer) => {
    const result = Buffer.alloc(8 + payload.length);
    result.writeUInt32BE(result.length, 0);
    result.write(type, 4, 'ascii');
    payload.copy(result, 8);
    return result;
  };
  const bytes = Buffer.concat([
    box('ftyp', Buffer.concat([Buffer.from('isom'), Buffer.alloc(4), Buffer.from('isom')])),
    box('moov', Buffer.from([1, 2, 3, 4])),
    box('mdat', Buffer.from([5, 6, 7, 8])),
  ]);
  const success = await api(location,{method:'POST',headers:{
    Origin:origin,Cookie:cookie,'X-HIAU-CSRF':csrf,'Content-Type':'video/mp4'
  },body:bytes});
  assert.equal(success.status,200);
  const uploaded = await success.json();
  const record = uploaded.videos.find((v:{id:string}) => v.id === newId);
  assert.ok(record.src.startsWith('/uploads/public-videos/'));
  assert.equal((await api(record.src)).status,200);
});
test('publish an added video; public list contains three records', async () => {
  const response = await write('PATCH','/api/admin/public-media/videos/'+newId,
    {status:'published',featured:true,order:0,poster:'/assets/aistudio/image_29eb5504.png'});
  assert.equal(response.status,200);
  const list = (await (await api('/api/public-media/videos')).json()).videos;
  assert.equal(list.length,3);
  assert.equal(list.some((v:{id:string}) => v.id === newId),true);
});
test('reorder three videos with full-ID validation', async () => {
  const invalid = await write('POST','/api/admin/public-media/videos/reorder',{ids:['campus']});
  assert.equal(invalid.status,400);
  const valid = await write('POST','/api/admin/public-media/videos/reorder',
    {ids:[newId,'classroom','campus']});
  assert.equal(valid.status,200);
  const list = (await (await api('/api/public-media/videos')).json()).videos;
  assert.deepEqual(list.map((v:{id:string})=>v.id),[newId,'classroom','campus']);
});
test('unpublish, then remove media while keeping the underlying uploaded file', async () => {
  const list = (await (await api('/api/admin/public-media/videos',
    {headers:{Cookie:cookie}})).json()).videos;
  const uploaded = list.find((v:{id:string})=>v.id===newId).src;
  assert.equal((await write('PATCH','/api/admin/public-media/videos/'+newId,
    {status:'draft'})).status,200);
  assert.equal((await (await api('/api/public-media/videos')).json()).videos.length,2);
  assert.equal((await write('DELETE','/api/admin/public-media/videos/'+newId)).status,200);
  assert.equal((await (await api('/api/admin/public-media/videos',
    {headers:{Cookie:cookie}})).json()).videos.length,2);
  assert.equal((await api(uploaded)).status,200);
  assert.equal(JSON.parse(readFileSync(join(root,'public-videos.json'),'utf8')).length,2);
  assert.equal(existsSync(join(root,'public-media-uploads')),true);
});
