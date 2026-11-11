import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, {type Express, type Response} from 'express';
import {actorOf} from './identity';
import type {Operations} from './operations';

type Category='campus'|'facilities'|'community';
type Kind='photo'|'video'|'information';
type Entry={id:string;category:Category;kind:Kind;title:string;description:string;
 mediaUrl:string;photoVersion:number;verified:boolean;status:'draft'|'published';updatedAt:string};
const PREFIX='campus-public:';
const validId=(id:string)=>/^campus-[a-f0-9-]{36}$/.test(id);
const allowedCategory=(x:unknown):x is Category=>['campus','facilities','community'].includes(String(x));
const allowedKind=(x:unknown):x is Kind=>['photo','video','information'].includes(String(x));
const admin=(res:Response)=>actorOf(res)?.role==='super_admin';
const clean=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
const safeVideo=(v:string)=>v===''||/^\/api\/public\/video\/(?:hero-campus|hero-classroom|hero-extra-[a-f0-9-]{36})$/.test(v);
const list=(store:Operations):Entry[]=>store.all(
 "SELECT value FROM settings WHERE key LIKE 'campus-public:%'"
).flatMap(row=>{try{const entry=JSON.parse(row.value) as Entry;return validId(entry.id)?[entry]:[];}catch{return [];}})
 .sort((a,b)=>a.title.localeCompare(b.title));
const get=(store:Operations,id:string)=>list(store).find(x=>x.id===id);
const put=(store:Operations,x:Entry)=>store.run(
 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
 PREFIX+x.id,JSON.stringify(x));
const fileFor=(dir:string,id:string)=>path.join(dir,'campus-public-media',id+'.img');
const view=(x:Entry)=>({...x,mediaUrl:x.kind==='photo'?'/api/public/campus-content/'+x.id+'/photo?v='+x.photoVersion:x.mediaUrl});
const parseInput=(body:any)=>{
 const category=body?.category,kind=body?.kind,title=clean(body?.title,120),
  description=clean(body?.description,1800),mediaUrl=clean(body?.mediaUrl,250);
 if(!allowedCategory(category)||!allowedKind(kind)||title.length<3||description.length<20)
   return null;
 if(kind==='video'&&!safeVideo(mediaUrl))return null;
 return {category,kind,title,description,mediaUrl:kind==='video'?mediaUrl:'',verified:body?.verified===true};
};
export const installCampusContent=(app:Express,store:Operations,dir:string)=>{
 const folder=path.join(dir,'campus-public-media');
 fs.mkdirSync(folder,{recursive:true,mode:0o700});
 app.get('/api/public/campus-content',(_req,res)=>{
   res.set('Cache-Control','no-store');
   res.json({entries:list(store).filter(x=>x.status==='published'&&x.verified).map(view)});
 });
 app.get('/api/public/campus-content/:id/photo',(req,res)=>{
   const entry=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!entry||entry.kind!=='photo'||entry.status!=='published'||!entry.verified)return res.sendStatus(404);
   const filename=fileFor(dir,entry.id);if(!fs.existsSync(filename))return res.sendStatus(404);
   res.set('Cache-Control','public, max-age=60');
   return res.type(fs.readFileSync(filename).subarray(0,4).equals(Buffer.from([137,80,78,71]))?'png':'jpeg').sendFile(filename);
 });
 app.get('/api/admin/campus-content',(_req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   res.set('Cache-Control','no-store');return res.json({entries:list(store).map(view)});
 });
 app.post('/api/admin/campus-content',express.json({limit:'12kb'}),(req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   const input=parseInput(req.body);if(!input)return res.status(400).json({error:'Supply a category, content type, title and description. Video URLs must reference the approved video library.'});
   const entry:Entry={id:'campus-'+crypto.randomUUID(),...input,photoVersion:0,status:'draft',updatedAt:new Date().toISOString()};
   put(store,entry);store.audit(actorOf(res)!.id,'CAMPUS_CONTENT_CREATE',entry.id,null,{title:entry.title});
   return res.status(201).json({entry:view(entry)});
 });
 app.put('/api/admin/campus-content/:id',express.json({limit:'12kb'}),(req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   const old=validId(req.params.id)?get(store,req.params.id):undefined;if(!old)return res.sendStatus(404);
   const input=parseInput(req.body);if(!input)return res.status(400).json({error:'Invalid campus content fields.'});
   const next={...old,...input,status:'draft' as const,updatedAt:new Date().toISOString()};
   put(store,next);store.audit(actorOf(res)!.id,'CAMPUS_CONTENT_EDIT',old.id,null,{title:next.title});
   return res.json({entry:view(next)});
 });
 app.post('/api/admin/campus-content/:id/photo',express.json({limit:'3mb'}),(req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   const entry=validId(req.params.id)?get(store,req.params.id):undefined;if(!entry||entry.kind!=='photo')return res.sendStatus(404);
   const encoded=req.body?.imageBase64;
   if(typeof encoded!=='string'||encoded.length>2_800_000)return res.status(400).json({error:'JPEG/PNG up to 2 MB required.'});
   const data=Buffer.from(encoded,'base64');
   const png=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
   const jpg=data[0]===255&&data[1]===216&&data[2]===255;
   if(data.length<128||data.length>2_000_000||(!png&&!jpg))return res.status(400).json({error:'Unsupported photo or size.'});
   const target=fileFor(dir,entry.id),tmp=target+'.'+crypto.randomUUID()+'.tmp';
   fs.writeFileSync(tmp,data,{mode:0o600});fs.renameSync(tmp,target);
   entry.photoVersion++;entry.status='draft';entry.updatedAt=new Date().toISOString();put(store,entry);
   store.audit(actorOf(res)!.id,'CAMPUS_PHOTO_REPLACE',entry.id,null,{bytes:data.length});
   return res.json({entry:view(entry)});
 });
 app.post('/api/admin/campus-content/:id/publish',express.json({limit:'4kb'}),(req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   const entry=validId(req.params.id)?get(store,req.params.id):undefined;if(!entry)return res.sendStatus(404);
   const publish=req.body?.published===true;
   if(publish&&!entry.verified)return res.status(409).json({error:'Verify authenticity and rights before publication.'});
   if(publish&&entry.kind==='photo'&&!fs.existsSync(fileFor(dir,entry.id)))return res.status(409).json({error:'Upload an approved photograph first.'});
   if(publish&&entry.kind==='video'&&!entry.mediaUrl)return res.status(409).json({error:'Choose a published video from Website Video Library first.'});
   entry.status=publish?'published':'draft';entry.updatedAt=new Date().toISOString();put(store,entry);
   store.audit(actorOf(res)!.id,publish?'CAMPUS_CONTENT_PUBLISH':'CAMPUS_CONTENT_UNPUBLISH',entry.id,null,{});
   return res.json({entry:view(entry)});
 });
 app.delete('/api/admin/campus-content/:id',express.json({limit:'4kb'}),(req,res)=>{
   if(!admin(res))return res.sendStatus(403);
   const entry=validId(req.params.id)?get(store,req.params.id):undefined;if(!entry)return res.sendStatus(404);
   if(req.body?.confirmation!=='DELETE_CAMPUS_CONTENT')return res.status(400).json({error:'Confirm deletion.'});
   store.run('DELETE FROM settings WHERE key=?',PREFIX+entry.id);
   const filename=fileFor(dir,entry.id);if(fs.existsSync(filename))fs.unlinkSync(filename);
   store.audit(actorOf(res)!.id,'CAMPUS_CONTENT_DELETE',entry.id,null,{title:entry.title});
   return res.json({success:true});
 });
};
