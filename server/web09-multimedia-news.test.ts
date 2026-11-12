import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import express from 'express';
import {Operations} from './operations';
import {installPublicNewsEvents} from './publicNewsEvents';

test('WEB-09 private media, reviewed publication, YouTube, snapshot integrity and persistence',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-web09-'));
 const db=new Operations(directory);
 const app=express();
 app.use((req,res,next)=>{
   const role=req.header('x-test-role')||'visitor';
   res.locals.actor={id:role,email:role+'@example.invalid',name:role,title:role,role};next();
 });
 installPublicNewsEvents(app,db,directory);
 const server=await new Promise<ReturnType<typeof app.listen>>(resolve=>{
   const listener=app.listen(0,'127.0.0.1',()=>resolve(listener));
 });
 t.after(async()=>{
   await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
   db.close();fs.rmSync(directory,{recursive:true,force:true});
 });
 const address=server.address();
 if(!address||typeof address==='string')throw new Error('No port');
 const base='http://127.0.0.1:'+address.port;
 const call=async(method:string,url:string,role='visitor',body?:unknown)=>{
   const response=await fetch(base+url,{method,headers:{'content-type':'application/json','x-test-role':role},
     body:body===undefined?undefined:JSON.stringify(body)});
   return {status:response.status,contentType:response.headers.get('content-type'),
     body:await response.text().then(value=>{try{return JSON.parse(value);}catch{return value;}})};
 };
 const editor='website_editor',reviewer='website_reviewer';
 const created=await call('POST','/api/admin/news-events',editor,{
   kind:'news',audience:'students',title:'HIAU staging multimedia test',
   summary:'Temporary unpublished university media verification test.',eventDate:'',location:'',verified:true
 });
 assert.equal(created.status,201);
 const id=created.body.item.id as string;
 assert.equal(created.body.item.verified,false);
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(180,1)]).toString('base64');
 const first=await call('POST',`/api/admin/news-events/${id}/media`,editor,{kind:'image',base64:png,
  caption:'Actual photo pending university verification',alt:'Classroom with projected lecture'});
 assert.equal(first.status,201);
 const mediaId=first.body.media.id;
 assert.equal((await call('GET',`/api/public/news-events/${id}/media/${mediaId}`)).status,404);
 assert.equal((await call('GET',`/api/admin/news-events/${id}/media/${mediaId}`,reviewer)).status,200);
 assert.equal((await call('POST',`/api/admin/news-events/${id}/publish`,editor,{published:true})).status,403);
 const badYouTube=await call('POST',`/api/admin/news-events/${id}/youtube`,editor,{
   url:'https://example.com/embed/nmlg7uHvJy4',caption:'Untrusted',alt:'Untrusted'});
 assert.equal(badYouTube.status,400);
 const youtube=await call('POST',`/api/admin/news-events/${id}/youtube`,editor,{
  url:'https://www.youtube.com/embed/nmlg7uHvJy4',caption:'Official university video awaiting review',alt:'Video about the university'});
 assert.equal(youtube.status,201);
 assert.equal(youtube.body.media.youtubeId,'nmlg7uHvJy4');
 await call('POST',`/api/admin/news-events/${id}/approve`,reviewer,{});
 assert.equal((await call('POST',`/api/admin/news-events/${id}/publish`,reviewer,{published:true})).status,200);
 const published=await call('GET','/api/public/news-events');
 assert.equal(published.status,200);
 assert.equal(published.body.items[0].media.length,2);
 assert.equal(published.body.items[0].media[1].url,'https://www.youtube-nocookie.com/embed/nmlg7uHvJy4');
 assert.equal((await call('GET',`/api/public/news-events/${id}/media/${mediaId}`)).status,200);
 const second=await call('POST',`/api/admin/news-events/${id}/media`,editor,{kind:'image',base64:png,
  caption:'New private replacement',alt:'Another classroom view'});
 assert.equal(second.status,201);
 assert.equal((await call('GET',`/api/public/news-events/${id}/media/${second.body.media.id}`)).status,404);
 assert.equal((await call('GET','/api/public/news-events')).body.items[0].media.length,2);
 assert.equal((await call('GET','/api/admin/news-events',reviewer)).body.items[0].media.length,3);
 assert.ok(fs.existsSync(path.join(directory,'news-event-media',mediaId+'.bin')));
 db.one('SELECT value FROM settings WHERE key=?','site-news:'+id);
});
