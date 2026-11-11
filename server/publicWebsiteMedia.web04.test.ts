import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installPublicWebsiteMedia} from './publicWebsiteMedia';

const videoFile=(size:number)=>{
  const bytes=Buffer.alloc(size);
  bytes.writeUInt32BE(size,0);bytes.write('ftyp',4,'ascii');bytes.write('isom',8,'ascii');
  return bytes;
};

test('WEB-04: additional homepage video stays private, survives restart, preserves order and supports unpublish by removal',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-web04-'));
  let store:Operations | null=null;
  let listener:ReturnType<ReturnType<typeof express>['listen']> | null=null;
  let base='';
  const start=async()=>{
    store=new Operations(directory);
    const app=express();
    app.use((req,res,next)=>{
      const role=req.get('x-test-role')||'visitor';
      if(role!=='visitor')res.locals.actor={id:'test-'+role,name:'Test',role};
      next();
    });
    app.use(express.json({limit:'2mb'}));
    installPublicWebsiteMedia(app,store,directory);
    listener=app.listen(0,'127.0.0.1');
    if(!listener.listening)await new Promise<void>(resolve=>listener!.once('listening',resolve));
    const address=listener.address();
    if(!address||typeof address==='string')throw Error('HTTP listener missing');
    base='http://127.0.0.1:'+address.port;
  };
  const stop=async()=>{
    if(listener){
      listener.closeAllConnections();
      await new Promise<void>(resolve=>listener!.close(()=>resolve()));
      listener=null;
    }
    store?.close();store=null;
  };
  const request=(url:string,role='visitor',method='GET',body?:object|Buffer,headers:Record<string,string>={})=>{
    const binary=Buffer.isBuffer(body);
    return fetch(base+url,{method,redirect:'manual',
      headers:{'x-test-role':role,...(body?{'content-type':binary?'application/octet-stream':'application/json'}:{}),...headers},
      ...(body?{body:binary?new Uint8Array(body):JSON.stringify(body)}:{})});
  };
  const json=async(r:Response)=>(await r.json()) as any;
  try{
    await start();
    const feed=async()=>json(await request('/api/public/hero-videos'));
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom']);
    assert.equal((await request('/api/admin/website-videos')).status,403);
    assert.equal((await request('/api/admin/website-videos','registrar','POST',{title:'Denied'})).status,403);
    const first=await json(await request('/api/admin/website-videos','super_admin','POST',{title:'First test video'}));
    const second=await json(await request('/api/admin/website-videos','super_admin','POST',{title:'Second test video'}));
    assert.match(first.slot,/^hero-extra-[a-f0-9-]{36}$/);
    assert.notEqual(first.slot,second.slot);
    assert.equal((await feed()).videos.length,2,'New slots must stay private before publication');
    assert.equal((await request('/api/admin/website-videos/reorder','registrar','POST',{ids:[second.slot,first.slot]})).status,403);
    assert.equal((await request('/api/admin/website-videos/reorder','super_admin','POST',{ids:[first.slot,first.slot]})).status,400);

    // Exercise actual chunked uploads rather than only the legacy single PUT.
    const payload=videoFile(270000);
    const videoPath='/api/admin/website-video/'+first.slot;
    const session=await json(await request(videoPath+'/uploads','super_admin','POST',{size:payload.length}));
    assert.equal(session.chunkSize,256*1024);
    assert.equal((await request(videoPath+'/uploads/'+session.uploadId+'/chunk','registrar','POST',payload.subarray(0,session.chunkSize),
      {'x-hiau-chunk-index':'0'})).status,403);
    const firstChunk=await request(videoPath+'/uploads/'+session.uploadId+'/chunk','super_admin','POST',payload.subarray(0,session.chunkSize),
      {'x-hiau-chunk-index':'0'});
    assert.equal(firstChunk.status,200);
    assert.equal((await request(videoPath+'/uploads/'+session.uploadId+'/chunk','super_admin','POST',payload.subarray(session.chunkSize),
      {'x-hiau-chunk-index':'2'})).status,400,'Out-of-order chunks must be denied');
    assert.equal((await request(videoPath+'/uploads/'+session.uploadId+'/chunk','super_admin','POST',payload.subarray(session.chunkSize),
      {'x-hiau-chunk-index':'1'})).status,200);
    assert.equal((await request(videoPath+'/uploads/'+session.uploadId+'/complete','super_admin','POST',{})).status,201);
    assert.equal((await feed()).videos.length,2,'Uploaded but unpublished video must stay private');
    assert.equal((await request(videoPath+'/publish','registrar','POST',{confirmation:'PUBLISH_WEBSITE_VIDEO'})).status,403);
    assert.equal((await request(videoPath+'/publish','super_admin','POST',{confirmation:'PUBLISH_WEBSITE_VIDEO'})).status,200);
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom',first.slot]);

    // Publish another clip to verify ordering and ensure unpublished extras do not leak.
    const secondPath='/api/admin/website-video/'+second.slot;
    assert.equal((await request(secondPath,'super_admin','PUT',videoFile(64),{'content-type':'video/mp4'})).status,201);
    assert.equal((await request(secondPath+'/publish','super_admin','POST',{confirmation:'PUBLISH_WEBSITE_VIDEO'})).status,200);
    assert.equal((await request('/api/admin/website-videos/reorder','super_admin','POST',{ids:[second.slot,first.slot]})).status,200);
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom',second.slot,first.slot]);
    const range=await request('/api/public/video/'+first.slot,'visitor','GET',undefined,{range:'bytes=4-7'});
    assert.equal(range.status,206);
    assert.equal(await range.text(),'ftyp');

    // DATABASE and files must survive process restart when DATA_DIR persists.
    await stop();
    await start();
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom',second.slot,first.slot]);
    const persisted=await request('/api/public/video/'+first.slot);
    assert.equal(persisted.status,200);
    assert.equal((await persisted.arrayBuffer()).byteLength,payload.length);

    assert.equal((await request('/api/admin/website-video/'+second.slot+'/extra','super_admin','DELETE',
      {confirmation:'REMOVE_ADDITIONAL_HOME_VIDEO'})).status,200);
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom',first.slot]);
    assert.equal((await request('/api/admin/website-video/'+first.slot,'super_admin','DELETE',
      {confirmation:'RESTORE_DEFAULT_WEBSITE_VIDEO'})).status,200);
    assert.deepEqual((await feed()).videos.map((v:any)=>v.id),['hero-campus','hero-classroom']);
    assert.ok(store!.all("SELECT action FROM audit WHERE action='WEBSITE_VIDEO_PUBLISH'").length>=2);
  }finally{
    await stop();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
