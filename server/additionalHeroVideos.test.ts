import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installPublicWebsiteMedia} from './publicWebsiteMedia';

test('added homepage videos require administrator creation, upload, and publication',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-extra-hero-'));
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
  const json=(method:string,route:string,role:string,body:object)=>request(route,role,{
    method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
  });
  const listing=()=>request('/api/public/hero-videos').then(r=>r.json());
  try{
    const defaults=await listing();
    assert.equal(defaults.videos.length,2);
    assert.equal(defaults.videos[0].id,'hero-campus');
    assert.equal(defaults.videos[1].id,'hero-classroom');
    assert.equal((await json('POST','/api/admin/website-videos','visitor',{title:'Extra campus film'})).status,403);
    assert.equal((await json('POST','/api/admin/website-videos','registrar',{title:'Extra campus film'})).status,403);
    const added=await json('POST','/api/admin/website-videos','super_admin',{title:'Extra campus film'});
    assert.equal(added.status,201);
    const {slot}=await added.json();
    assert.match(slot,/^hero-extra-[a-f0-9-]{36}$/);
    assert.equal((await listing()).videos.length,2,'an empty video must stay private');
    assert.equal((await request('/api/public/video/'+slot)).status,404);

    const invalidPublish=await json('POST','/api/admin/website-video/'+slot+'/publish',
      'super_admin',{confirmation:'PUBLISH_WEBSITE_VIDEO'});
    assert.equal(invalidPublish.status,409);
    const payload=Buffer.alloc(32);
    payload.writeUInt32BE(32,0);
    payload.write('ftyp',4,'ascii');
    payload.write('isom',8,'ascii');
    const upload=await request('/api/admin/website-video/'+slot,'super_admin',{
      method:'PUT',headers:{'Content-Type':'video/mp4'},body:payload,
    });
    assert.equal(upload.status,201);
    assert.equal((await listing()).videos.length,2,'draft upload must remain private');
    const publish=await json('POST','/api/admin/website-video/'+slot+'/publish',
      'super_admin',{confirmation:'PUBLISH_WEBSITE_VIDEO'});
    assert.equal(publish.status,200);
    const published=await listing();
    assert.equal(published.videos.length,3);
    assert.equal(published.videos[2].id,slot);
    assert.equal((await request('/api/public/video/'+slot)).status,200);

    const second=await json('POST','/api/admin/website-videos','super_admin',{title:'Student life'});
    const slot2=(await second.json()).slot;
    assert.equal((await json('POST','/api/admin/website-videos/reorder','super_admin',
      {ids:[slot2]})).status,400);
    assert.equal((await json('POST','/api/admin/website-videos/reorder','super_admin',
      {ids:[slot2,slot]})).status,200);
    const library=await request('/api/admin/website-videos','super_admin');
    assert.equal(library.status,200);
    const libraryData=await library.json();
    assert.equal(libraryData.videos.filter((v:any)=>v.slot.startsWith('hero-extra-')).length,2);
    assert.equal(libraryData.videos.find((v:any)=>v.slot===slot2).order,0);
    assert.equal((await json('DELETE','/api/admin/website-video/'+slot+'/extra',
      'registrar',{confirmation:'REMOVE_ADDITIONAL_HOME_VIDEO'})).status,403);
    assert.equal((await json('DELETE','/api/admin/website-video/'+slot+'/extra',
      'super_admin',{})).status,400);
    assert.equal((await json('DELETE','/api/admin/website-video/'+slot+'/extra',
      'super_admin',{confirmation:'REMOVE_ADDITIONAL_HOME_VIDEO'})).status,200);
    assert.equal((await listing()).videos.length,2);
    assert.equal((await request('/api/public/video/'+slot)).status,404);
    assert.equal(store.all('SELECT * FROM students').length,0,'ERP student data is untouched');
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
