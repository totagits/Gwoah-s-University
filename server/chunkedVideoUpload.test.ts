import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installPublicWebsiteMedia} from './publicWebsiteMedia';

test('4.4 MB private video is uploaded as bounded ordered chunks and published only by administrator',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-chunk-test-'));
  const store=new Operations(directory);
  const app=express();
  app.use((req,res,next)=>{
    const role=req.get('x-test-role')||'visitor';
    if(role!=='visitor')res.locals.actor={id:'test-'+role,name:'Test',role};
    next();
  });
  app.use(express.json());
  installPublicWebsiteMedia(app,store,directory);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(r=>server.once('listening',r));
  const base='http://127.0.0.1:'+(server.address() as any).port;
  const send=async(p:string,role='visitor',options:RequestInit={})=>{
    // Node fetch uses keep-alive connections. Fully drain the response before
    // a status-only assertion so close() cannot wait on unconsumed bodies.
    const response=await fetch(base+p,{
      redirect:'manual',signal:AbortSignal.timeout(15000),
      ...options,headers:{'x-test-role':role,...options.headers},
    });
    await response.clone().arrayBuffer();
    return response;
  };
  const post=(p:string,role:string,body:object)=>send(p,role,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
  });
  try {
    const endpoint='/api/admin/website-video/hero-campus';
    const video=Buffer.alloc(4_400_000);
    video.writeUInt32BE(video.length,0);
    video.write('ftyp',4,'ascii');
    video.write('isom',8,'ascii');
    assert.equal((await post(endpoint+'/uploads','visitor',{size:video.length})).status,403);
    assert.equal((await post(endpoint+'/uploads','registrar',{size:video.length})).status,403);
    const created=await post(endpoint+'/uploads','super_admin',{size:video.length});
    assert.equal(created.status,201);
    const {uploadId,chunkSize}=await created.json();
    assert.equal(chunkSize,256*1024);
    assert.equal((await send(endpoint+'/uploads/'+uploadId+'/chunk','registrar',{
      method:'POST',headers:{'Content-Type':'application/octet-stream','X-HIAU-Chunk-Index':'0'},
      body:video.subarray(0,chunkSize)
    })).status,403);
    assert.equal((await post(endpoint+'/uploads/'+uploadId+'/complete','super_admin',{})).status,409);
    let offset=0;
    for(let i=0;offset<video.length;i++){
      const piece=video.subarray(offset,Math.min(offset+chunkSize,video.length));
      if(i===0) assert.equal((await send(endpoint+'/uploads/'+uploadId+'/chunk','super_admin',{
        method:'POST',headers:{'Content-Type':'application/octet-stream','X-HIAU-Chunk-Index':'1'},
        body:piece
      })).status,400);
      const response=await send(endpoint+'/uploads/'+uploadId+'/chunk','super_admin',{
        method:'POST',headers:{'Content-Type':'application/octet-stream','X-HIAU-Chunk-Index':String(i)},
        body:piece
      });
      assert.equal(response.status,200,'chunk '+i);
      offset+=piece.length;
    }
    const before=await send('/api/public/video/hero-campus');
    assert.equal(before.status,200,'bundled campus footage remains publicly available');
    assert.equal((await (await send('/api/public/video-status/hero-campus')).json()).source,'bundled');
    const complete=await post(endpoint+'/uploads/'+uploadId+'/complete','super_admin',{});
    assert.equal(complete.status,201);
    const admin=await send('/api/admin/website-videos','super_admin');
    const {videos}=await admin.json();
    assert.ok(videos.find((v:any)=>v.slot==='hero-campus').draft);
    assert.equal((await send('/api/public/video/hero-campus')).status,200);
    assert.equal((await (await send('/api/public/video-status/hero-campus')).json()).source,'bundled');
    const publish=await post(endpoint+'/publish','super_admin',{confirmation:'PUBLISH_WEBSITE_VIDEO'});
    assert.equal(publish.status,200);
    assert.equal((await (await send('/api/public/video-status/hero-campus')).json()).source,'published');
    const served=await send('/api/public/video/hero-campus','visitor',{
      headers:{Range:'bytes=0-11'},
    });
    assert.equal(served.status,206);
    assert.deepEqual(Buffer.from(await served.arrayBuffer()),video.subarray(0,12));
    const rows=store.all("SELECT action FROM audit WHERE action='WEBSITE_VIDEO_DRAFT_UPLOAD'");
    assert.equal(rows.length,1);
  }finally{
    server.closeAllConnections();
    await new Promise<void>((resolve,reject)=>server.close(error=>error&&
      (error as NodeJS.ErrnoException).code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
