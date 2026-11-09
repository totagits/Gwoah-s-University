import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installPublicWebsiteMedia} from './publicWebsiteMedia';

test('website media stays private until Super Administrator publishes and can revert without ERP changes',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-public-media-'));
  const store=new Operations(directory);
  const app=express();
  app.use((req,res,next)=>{
    const role=req.header('x-test-role')||'visitor';
    if(role!=='visitor')res.locals.actor={id:'test-'+role,name:'Test',role};
    next();
  });
  app.use(express.json());
  installPublicWebsiteMedia(app,store,directory);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+(server.address() as any).port;
  const request=(route:string,role='visitor',options:RequestInit={})=>fetch(base+route,{
    redirect:'manual',...options,headers:{'x-test-role':role,...options.headers},
  });
  const media='/api/public/video/hero-campus';
  const admin='/api/admin/website-video/hero-campus';
  try{
    assert.equal((await request('/api/admin/website-videos')).status,403);
    assert.equal((await request(admin,'registrar',{method:'PUT',headers:{'Content-Type':'video/mp4'},body:Buffer.alloc(30)})).status,403);
    const original=await request(media);
    assert.equal(original.status,302);
    assert.match(original.headers.get('location')||'',/image_20261105_121706_f720baa0\.mp4$/);
    const invalid=await request(admin,'super_admin',{method:'PUT',headers:{'Content-Type':'video/mp4'},body:Buffer.alloc(30)});
    assert.equal(invalid.status,400);
    const payload=Buffer.alloc(32);
    payload.writeUInt32BE(32,0);
    payload.write('ftyp',4,'ascii');
    payload.write('isom',8,'ascii');
    const uploaded=await request(admin,'super_admin',{method:'PUT',headers:{'Content-Type':'video/mp4'},body:payload});
    assert.equal(uploaded.status,201);
    assert.equal((await request(media)).status,302,'uploaded draft must not go public');
    const library=await request('/api/admin/website-videos','super_admin');
    assert.equal(library.status,200);
    const data=await library.json();
    assert.equal(data.videos.length,21);
    assert.ok(data.videos.find((v:any)=>v.slot==='hero-campus').draft);
    assert.equal((await request(admin+'/publish','registrar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'PUBLISH_WEBSITE_VIDEO'})})).status,403);
    assert.equal((await request(admin+'/publish','super_admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})})).status,400);
    const published=await request(admin+'/publish','super_admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'PUBLISH_WEBSITE_VIDEO'})});
    assert.equal(published.status,200);
    const served=await request(media);
    assert.equal(served.status,200);
    assert.equal((await served.arrayBuffer()).byteLength,payload.length);
    const partial=await request(media,'visitor',{headers:{Range:'bytes=4-7'}});
    assert.equal(partial.status,206);
    assert.equal(await partial.text(),'ftyp');
    assert.equal((await request(media,'visitor',{headers:{Range:'bytes=999-1000'}})).status,416);
    // If an operator accidentally loses an uploaded media file, visitors see
    // the original site video rather than an unusable player.
    const saved=JSON.parse(store.one('SELECT value FROM settings WHERE key=?','public-media:hero-campus').value);
    fs.rmSync(path.join(directory,'public-media',saved.published),{force:true});
    assert.equal((await request(media)).status,302);
    assert.equal((await request(admin,'super_admin',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'RESTORE_DEFAULT_WEBSITE_VIDEO'})})).status,200);
    assert.equal((await request(media)).status,302);
    assert.equal(store.all('SELECT * FROM programs').length,0);
    assert.equal(store.all('SELECT * FROM students').length,0);
    assert.ok(store.all("SELECT action FROM audit WHERE action='WEBSITE_VIDEO_PUBLISH'").length===1);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
