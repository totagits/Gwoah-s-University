import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { randomBytes, scryptSync } from 'node:crypto';
import { mediaAuthRouter, requireMediaAdministrator } from '../src/server/mediaAuth';

const originalEmail = process.env.HIAU_MEDIA_ADMIN_EMAIL;
const originalHash = process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH;
const originalNodeEnv = process.env.NODE_ENV;
const password = 'Long-test-only-password-not-for-production-2026!';
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex');
let server: Server;
let base = '';
let cookie = '';
let csrf = '';
function jsonRequest(path: string, method: string, body?: unknown, headers: Record<string,string> = {}) {
  return fetch(base + path, {
    method,
    headers: { Origin: base, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.HIAU_MEDIA_ADMIN_EMAIL = 'administrator@example.test';
  process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH = salt + ':' + hash;
  const app = express();
  app.use(express.json());
  app.use('/api/auth', mediaAuthRouter);
  app.use('/api/admin/public-media', requireMediaAdministrator);
  app.get('/api/admin/public-media/videos', (_req,res) => res.json({ success: true }));
  app.post('/api/admin/public-media/test-write', (_req,res) => res.json({ success: true }));
  server = createServer(app);
  await new Promise<void>(resolve => server.listen(0,'127.0.0.1',resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw Error('Unable to obtain test port');
  base = 'http://127.0.0.1:' + address.port;
});
after(async () => {
  await new Promise<void>((resolve,reject) => server.close(error => error ? reject(error) : resolve()));
  if (originalEmail === undefined) delete process.env.HIAU_MEDIA_ADMIN_EMAIL;
  else process.env.HIAU_MEDIA_ADMIN_EMAIL = originalEmail;
  if (originalHash === undefined) delete process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH;
  else process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH = originalHash;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

test('anonymous media management request is rejected', async () => {
  assert.equal((await fetch(base + '/api/admin/public-media/videos')).status,401);
});
test('role-only login is never accepted', async () => {
  const res = await jsonRequest('/api/auth/login','POST',{role:'super_admin'});
  assert.equal(res.status,401);
});
test('missing or invalid password is never accepted', async () => {
  const res = await jsonRequest('/api/auth/login','POST',{email:'administrator@example.test',password:'wrongpassword123'});
  assert.equal(res.status,401);
});
test('invalid origin fails before credentials are checked', async () => {
  const res = await jsonRequest('/api/auth/login','POST',
    {email:'administrator@example.test',password},{Origin:'https://attacker.example'});
  assert.equal(res.status,403);
});
test('valid login returns HttpOnly cookie and a CSRF token', async () => {
  const res = await jsonRequest('/api/auth/login','POST',{email:'administrator@example.test',password});
  assert.equal(res.status,200);
  const body = await res.json();
  assert.equal(body.user.role,'super_admin');
  assert.match(body.csrf,/^[a-f0-9]{64}$/);
  csrf = body.csrf;
  const setCookie = res.headers.get('set-cookie') || '';
  assert.match(setCookie,/HttpOnly/i);
  assert.match(setCookie,/SameSite=Strict/i);
  cookie = setCookie.split(';')[0];
  assert.ok(cookie.startsWith('hiau_media_session='));
});
test('media write denies missing CSRF even with session cookie', async () => {
  const res = await jsonRequest('/api/admin/public-media/test-write','POST',{},
    {Cookie:cookie});
  assert.equal(res.status,403);
});
test('media write denies invalid CSRF', async () => {
  const res = await jsonRequest('/api/admin/public-media/test-write','POST',{},
    {Cookie:cookie,'X-HIAU-CSRF':'0'.repeat(64)});
  assert.equal(res.status,403);
});
test('media administration works with session and CSRF', async () => {
  const read = await fetch(base + '/api/admin/public-media/videos',{headers:{Cookie:cookie}});
  assert.equal(read.status,200);
  const res = await jsonRequest('/api/admin/public-media/test-write','POST',{},
    {Cookie:cookie,'X-HIAU-CSRF':csrf});
  assert.equal(res.status,200);
});
test('logout invalidates server session', async () => {
  const res = await jsonRequest('/api/auth/logout','POST',undefined,
    {Cookie:cookie,'X-HIAU-CSRF':csrf});
  assert.equal(res.status,200);
  const next = await fetch(base + '/api/admin/public-media/videos',{headers:{Cookie:cookie}});
  assert.equal(next.status,401);
});
