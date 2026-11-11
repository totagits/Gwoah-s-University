import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import content from '../scripts/hiau-degree-video-content.json';
import {Operations} from './operations';
import {installPublicWebsiteMedia} from './publicWebsiteMedia';

const slug=(value:string)=>value.toLowerCase().normalize('NFKD')
 .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const expectedSlots=content.degrees.map(d=>d.college+'--'+slug(d.name));

test('WEB-05: exactly 19 unique explanatory video slots across five colleges',()=>{
 assert.equal(expectedSlots.length,19);
 assert.equal(new Set(expectedSlots).size,19);
 assert.deepEqual([...new Set(content.degrees.map(d=>d.college))].sort(),
 ['business','education','liberal_arts','science_tech','theology']);
});

test('WEB-05: admin can privately draft, publish, stream and restore an individual degree video',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-web05-'));
 const store=new Operations(directory);
 const app=express();
 app.use((req,res,next)=>{
  const role=req.get('x-test-role')||'visitor';
  if(role!=='visitor')res.locals.actor={id:'user-'+role,name:'Test user',role};
  next();
 });
 app.use(express.json({limit:'2mb'}));
 installPublicWebsiteMedia(app,store,directory);
 const server=app.listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+(server.address() as any).port;
 const request=(url:string,role='visitor',method='GET',body?:object|Buffer,headers:Record<string,string>={})=>{
  const binary=Buffer.isBuffer(body);
  return fetch(base+url,{method,redirect:'manual',headers:{
    'x-test-role':role,...(body?{'content-type':binary?'video/mp4':'application/json'}:{}),...headers
  },...(body?{body:binary?new Uint8Array(body):JSON.stringify(body)}:{})});
 };
 try{
  assert.equal((await request('/api/admin/website-videos')).status,403);
  const listing=await request('/api/admin/website-videos','super_admin');
  assert.equal(listing.status,200);
  const slots=(await listing.json() as any).videos;
  assert.equal(slots.filter((v:any)=>!v.slot.startsWith('hero-')).length,19);
  assert.deepEqual(new Set(slots.filter((v:any)=>!v.slot.startsWith('hero-')).map((v:any)=>v.slot)),new Set(expectedSlots));
  for(const entry of slots.filter((v:any)=>!v.slot.startsWith('hero-'))){
   assert.equal(typeof entry.defaultAvailable,'boolean');
   assert.equal(entry.publicSrc,'/api/public/video/'+entry.slot);
   assert.equal(entry.previewSrc,'/api/admin/website-video/'+entry.slot+'/preview');
  }
  const slot=expectedSlots[0],url='/api/admin/website-video/'+encodeURIComponent(slot);
  const original=Buffer.alloc(128);original.writeUInt32BE(128,0);original.write('ftyp',4,'ascii');original.write('isom',8,'ascii');
  assert.equal((await request(url,'registrar','PUT',original)).status,403);
  assert.equal((await request(url,'super_admin','PUT',original)).status,201);
  const draft=(await (await request('/api/admin/website-videos','super_admin')).json() as any).videos.find((v:any)=>v.slot===slot);
  assert.ok(draft.draft);
  assert.equal(draft.published,undefined,'Draft must not be publicly published automatically');
  assert.equal((await request(url+'/preview')).status,403);
  const privateVideo=await request(url+'/preview','super_admin');
  assert.equal(privateVideo.status,200);
  assert.equal((await privateVideo.arrayBuffer()).byteLength,128);
  assert.equal((await request(url+'/publish','registrar','POST',{confirmation:'PUBLISH_WEBSITE_VIDEO'})).status,403);
  assert.equal((await request(url+'/publish','super_admin','POST',{confirmation:'PUBLISH_WEBSITE_VIDEO'})).status,200);
  const publicVideo=await request('/api/public/video/'+encodeURIComponent(slot),'visitor','GET',undefined,{range:'bytes=4-7'});
  assert.equal(publicVideo.status,206);
  assert.equal(await publicVideo.text(),'ftyp');
  // Replacing a video creates a draft without disrupting the published version.
  const replacement=Buffer.from(original);
  replacement.write('NEW!',16,'ascii');
  assert.equal((await request(url,'super_admin','PUT',replacement)).status,201);
  assert.equal((await request(url+'/draft','registrar','DELETE',{confirmation:'DISCARD_WEBSITE_VIDEO_DRAFT'})).status,403);
  assert.equal((await request(url+'/draft','super_admin','DELETE',{confirmation:'WRONG'})).status,400);
  const stillLive=await request('/api/public/video/'+encodeURIComponent(slot),'visitor','GET',undefined,{range:'bytes=16-19'});
  assert.equal(stillLive.status,206);
  assert.notEqual(await stillLive.text(),'NEW!');
  assert.equal((await request(url+'/draft','super_admin','DELETE',{confirmation:'DISCARD_WEBSITE_VIDEO_DRAFT'})).status,200);
  const afterDiscard=(await (await request('/api/admin/website-videos','super_admin')).json() as any).videos.find((v:any)=>v.slot===slot);
  assert.ok(!afterDiscard.draft&&afterDiscard.published,'Discard keeps published original replacement');
  assert.equal((await request(url+'/draft','super_admin','DELETE',{confirmation:'DISCARD_WEBSITE_VIDEO_DRAFT'})).status,409);
  const secondSlot=expectedSlots[1],other=(await (await request('/api/admin/website-videos','super_admin')).json() as any).videos.find((v:any)=>v.slot===secondSlot);
  assert.ok(!other.draft&&!other.published,'Other degree remains unchanged');
  assert.equal((await request(url,'super_admin','DELETE',{confirmation:'RESTORE_DEFAULT_WEBSITE_VIDEO'})).status,200);
  const restored=(await (await request('/api/admin/website-videos','super_admin')).json() as any).videos.find((v:any)=>v.slot===slot);
  assert.ok(!restored.published&&!restored.draft);
  assert.ok(store.all("SELECT action FROM audit WHERE action='WEBSITE_VIDEO_PUBLISH'").length>0);
 }finally{
  server.closeAllConnections();
  await new Promise<void>(resolve=>server.close(()=>resolve()));
  store.close();fs.rmSync(directory,{recursive:true,force:true});
 }
});
