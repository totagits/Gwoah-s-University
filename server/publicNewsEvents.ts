import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express,{type Express,type Response} from 'express';
import {actorOf} from './identity';
import type {Operations} from './operations';

type Kind='news'|'event'|'announcement';
type Audience='general'|'faculty'|'students'|'press';
export type NewsMedia={id:string;kind:'image'|'video'|'youtube';caption:string;alt:string;mime:string;bytes:number;createdAt:string;youtubeId?:string};
type Entry={id:string;kind:Kind;audience?:Audience;title:string;summary:string;eventDate:string;location:string;media?:NewsMedia[];
 status:'draft'|'published';verified:boolean;createdAt:string;updatedAt:string;publishedAt:string|null;
 live?:{kind:Kind;audience?:Audience;title:string;summary:string;eventDate:string;location:string;verified:boolean;media?:NewsMedia[]};scheduledAt?:string};
const PREFIX='site-news:';
const idOk=(id:string)=>/^news-[a-f0-9-]{36}$/.test(id);
const admin=(res:Response)=>actorOf(res)?.role==='super_admin';
const author=(res:Response)=>admin(res)||actorOf(res)?.role==='website_editor';
const reviewer=(res:Response)=>admin(res)||actorOf(res)?.role==='website_reviewer';
const txt=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const dateOk=(v:string)=>v===''||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v);
const input=(v:any)=>{
 const kind=v?.kind,title=txt(v?.title,130),summary=txt(v?.summary,1800);
 const eventDate=txt(v?.eventDate,10),location=txt(v?.location,140);
 if(!['news','event','announcement'].includes(kind)||title.length<4||summary.length<20||
  !dateOk(eventDate)||(kind==='event'&&!eventDate))return null;
 const audience=['general','faculty','students','press'].includes(v?.audience)?v.audience as Audience:'general';
 return {kind:kind as Kind,audience,title,summary,eventDate,location,verified:v?.verified===true};
};
const all=(db:Operations):Entry[]=>
 db.all("SELECT value FROM settings WHERE key LIKE 'site-news:%'").flatMap(row=>{
  try{const e=JSON.parse(row.value) as Entry;return idOk(e.id)?[e]:[];}catch{return [];}
 }).sort((a,b)=>(b.eventDate||b.publishedAt||'').localeCompare(a.eventDate||a.publishedAt||''));
const read=(db:Operations,id:string)=>all(db).find(x=>x.id===id);
const save=(db:Operations,e:Entry)=>db.run(
 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
 PREFIX+e.id,JSON.stringify(e));
export function installPublicNewsEvents(app:Express,db:Operations,directory:string){
 const mediaDir=path.join(directory,'news-event-media');
 fs.mkdirSync(mediaDir,{recursive:true,mode:0o700});
 const mediaIdOk=(id:string)=>/^media-[a-f0-9-]{36}$/.test(id);
 const mediaFile=(id:string)=>path.join(mediaDir,id+'.bin');
 const mediaUrls=(e:Entry,media:NewsMedia[])=>media.map((m,index)=>({
   ...m, featured:index===0,
   url:m.kind==='youtube'?'https://www.youtube-nocookie.com/embed/'+m.youtubeId:'/api/public/news-events/'+e.id+'/media/'+m.id
 }));
 const contentLive=(e:Entry)=>{
   if(e.status==='published'&&e.verified)return e.live??e;
   return e.live?.verified?e.live:null;
 };
 // Preview files are restricted to authenticated editors/reviewers; only
 // media in a published snapshot can be fetched anonymously.
 app.get('/api/admin/news-events/:id/media/:mediaId',(req,res)=>{
   if(!author(res)&&!reviewer(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   const id=req.params.mediaId;
   if(!e||!mediaIdOk(id))return res.sendStatus(404);
   const media=[...(e.media||[]),...(e.live?.media||[])].find(m=>m.id===id);
   if(!media||media.kind==='youtube')return res.sendStatus(404);
   const file=mediaFile(id);if(!fs.existsSync(file))return res.sendStatus(404);
   res.set('Cache-Control','private, no-store');res.set('X-Content-Type-Options','nosniff');
   return res.type(media.mime).sendFile(file);
 });
 app.get('/api/public/news-events/:id/media/:mediaId',(req,res)=>{
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   const live=e?contentLive(e):null;
   const id=req.params.mediaId;
   const media=mediaIdOk(id)?live?.media?.find(m=>m.id===id):undefined;
   if(!media||media.kind==='youtube')return res.sendStatus(404);
   const file=mediaFile(id);if(!fs.existsSync(file))return res.sendStatus(404);
   res.set('Cache-Control','public, max-age=60');res.set('X-Content-Type-Options','nosniff');
   return res.type(media.mime).sendFile(file);
 });
 app.post('/api/admin/news-events/:id/youtube',express.json({limit:'8kb'}),(req,res)=>{
   if(!author(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   if(!e)return res.sendStatus(404);
   if((e.media||[]).length>=12)return res.status(409).json({error:'Maximum 12 media assets per article.'});
   const input=txt(req.body?.url,300),caption=txt(req.body?.caption,240),alt=txt(req.body?.alt,240);
   let videoId='';
   try{
     const u=new URL(input);
     if(u.protocol!=='https:')throw Error('Invalid protocol');
     if(u.hostname==='youtu.be')videoId=u.pathname.slice(1);
     else if(['www.youtube.com','youtube.com','www.youtube-nocookie.com','youtube-nocookie.com','m.youtube.com'].includes(u.hostname)){
       videoId=u.pathname.startsWith('/embed/')?u.pathname.split('/')[2]:u.pathname==='/watch'?u.searchParams.get('v')||'':'';
     }
   }catch{}
   if(!/^[A-Za-z0-9_-]{11}$/.test(videoId)||!caption||!alt)
     return res.status(400).json({error:'Supply a valid HTTPS YouTube URL, caption and accessible description.'});
   const media:NewsMedia={id:'media-'+crypto.randomUUID(),kind:'youtube',youtubeId:videoId,
     caption,alt,mime:'text/youtube',bytes:0,createdAt:new Date().toISOString()};
   if(e.status==='published'){
     e.live={kind:e.kind,audience:e.audience||'general',title:e.title,summary:e.summary,
       eventDate:e.eventDate,location:e.location,verified:e.verified,media:e.live?.media??e.media};
   }
   e.media=[...(e.media||[]),media];e.status='draft';e.verified=false;e.scheduledAt=undefined;
   e.updatedAt=new Date().toISOString();save(db,e);
   db.audit(actorOf(res)!.id,'NEWS_YOUTUBE_ADD',e.id,null,{videoId});
   return res.status(201).json({item:e,media});
 });
 app.post('/api/admin/news-events/:id/media',express.json({limit:'36mb'}),(req,res)=>{
   if(!author(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   if(!e)return res.sendStatus(404);
   const requestedKind=req.body?.kind;
   const input=req.body?.base64;
   const caption=txt(req.body?.caption,240);
   const alt=txt(req.body?.alt,240);
   if(!['image','video'].includes(requestedKind)||typeof input!=='string'||input.length>34_000_000||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(input)||!caption||!alt)
      return res.status(400).json({error:'Provide a supported image/video, caption and accessible description.'});
   const bytes=Buffer.from(input,'base64');
   const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
   const jpeg=bytes.subarray(0,3).equals(Buffer.from([255,216,255]));
   const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
   const mp4=bytes.subarray(4,8).toString()==='ftyp';
   const mime=requestedKind==='image'?(png?'image/png':jpeg?'image/jpeg':webp?'image/webp':'')
     :mp4?'video/mp4':'';
   const max=requestedKind==='image'?8_000_000:24_000_000;
   if(!mime||bytes.length<128||bytes.length>max)
     return res.status(400).json({error:requestedKind==='image'?'Upload PNG/JPEG/WebP below 8 MB.':'Upload MP4 below 24 MB.'});
   if((e.media||[]).length>=12)return res.status(409).json({error:'Maximum 12 attachments per story.'});
   const media:NewsMedia={id:'media-'+crypto.randomUUID(),kind:requestedKind,caption,alt,mime,bytes:bytes.length,createdAt:new Date().toISOString()};
   const filename=mediaFile(media.id);
   fs.writeFileSync(filename,bytes,{flag:'wx',mode:0o600});
   e.media=[...(e.media||[]),media];
   // Asset edits always return to a private editorial draft, retaining live snapshot.
   if(e.status==='published'){
     e.live={kind:e.kind,audience:e.audience||'general',title:e.title,summary:e.summary,eventDate:e.eventDate,
       location:e.location,verified:e.verified,media:e.live?.media??(e.media||[]).filter(m=>m.id!==media.id)};
   }
   e.status='draft';e.verified=false;e.scheduledAt=undefined;e.updatedAt=new Date().toISOString();
   save(db,e);db.audit(actorOf(res)!.id,'NEWS_MEDIA_UPLOAD',e.id,null,{mediaId:media.id,kind:media.kind,bytes:media.bytes});
   return res.status(201).json({item:e,media});
 });
 app.put('/api/admin/news-events/:id/media/:mediaId',express.json({limit:'8kb'}),(req,res)=>{
   if(!author(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   if(!e||!mediaIdOk(req.params.mediaId))return res.sendStatus(404);
   const original=e.media?.find(m=>m.id===req.params.mediaId);
   if(!original)return res.sendStatus(404);
   const caption=txt(req.body?.caption,240),alt=txt(req.body?.alt,240);
   if(!caption||!alt)return res.status(400).json({error:'A caption and alternative description are required.'});
   e.media=e.media!.map(m=>m.id===original.id?{...m,caption,alt}:m);
   if(e.status==='published'){
     e.live={kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,
       location:e.location,verified:e.verified,media:[...(e.live?.media||e.media||[])]};
   }
   e.status='draft';e.verified=false;e.scheduledAt=undefined;e.updatedAt=new Date().toISOString();
   save(db,e);db.audit(actorOf(res)!.id,'NEWS_MEDIA_EDIT',e.id,null,{mediaId:original.id});
   return res.json({item:e});
 });
 app.post('/api/admin/news-events/:id/media-order',express.json({limit:'4kb'}),(req,res)=>{
   if(!author(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   const ids=req.body?.ids;
   if(!e||!Array.isArray(ids)||ids.length!==(e.media||[]).length||
      !ids.every((id:unknown)=>typeof id==='string'&&(e.media||[]).some(m=>m.id===id))||
      new Set(ids).size!==ids.length)return res.status(400).json({error:'Supply the complete unique gallery order.'});
   if(e.status==='published'){
     e.live={kind:e.kind,audience:e.audience||'general',title:e.title,summary:e.summary,
       eventDate:e.eventDate,location:e.location,verified:e.verified,media:e.live?.media??e.media};
   }
   e.media=ids.map((id:string)=>e.media!.find(m=>m.id===id)!);
   e.status='draft';e.verified=false;e.scheduledAt=undefined;e.updatedAt=new Date().toISOString();
   save(db,e);db.audit(actorOf(res)!.id,'NEWS_MEDIA_REORDER',e.id,null,{ids});
   return res.json({item:e});
 });
 app.delete('/api/admin/news-events/:id/media/:mediaId',express.json({limit:'4kb'}),(req,res)=>{
   if(!author(res))return res.sendStatus(403);
   const e=idOk(req.params.id)?read(db,req.params.id):undefined;
   if(!e||!mediaIdOk(req.params.mediaId)||!e.media?.some(m=>m.id===req.params.mediaId))return res.sendStatus(404);
   if(req.body?.confirmation!=='REMOVE_MEDIA_FROM_DRAFT')return res.status(400).json({error:'Confirm media removal.'});
   if(e.status==='published'){
     e.live={kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,
       location:e.location,verified:e.verified,media:e.live?.media??e.media};
   }
   e.media=e.media.filter(m=>m.id!==req.params.mediaId);
   e.status='draft';e.verified=false;e.scheduledAt=undefined;e.updatedAt=new Date().toISOString();
   save(db,e);db.audit(actorOf(res)!.id,'NEWS_MEDIA_REMOVE',e.id,null,{mediaId:req.params.mediaId});
   // Keep the file if a currently published article still references it.
   if(!e.live?.media?.some(m=>m.id===req.params.mediaId))fs.rmSync(mediaFile(req.params.mediaId),{force:true});
   return res.json({item:e});
 });

 app.get('/api/public/news-events',(_req,res)=>{
  for(const pending of all(db).filter(x=>x.status==='draft'&&x.scheduledAt&&x.verified&&Date.parse(x.scheduledAt)<=Date.now())){
   pending.status='published';pending.live={kind:pending.kind,audience:pending.audience||'general',title:pending.title,summary:pending.summary,eventDate:pending.eventDate,location:pending.location,verified:true,media:[...(pending.media||[])]};
   pending.publishedAt=new Date().toISOString();pending.updatedAt=pending.publishedAt;pending.scheduledAt=undefined;
   save(db,pending);db.audit('system','NEWS_SCHEDULED_PUBLISH',pending.id,null,{});
  }
  res.set('Cache-Control','no-store');
  return res.json({items:all(db).flatMap(x=>{
   const live=contentLive(x);
   if(!live)return [];
   // Never expose draft metadata, the scheduled release time or private revisions.
   return [{id:x.id,kind:live.kind,audience:live.audience||'general',title:live.title,summary:live.summary,
     eventDate:live.eventDate,location:live.location,status:'published',verified:true,
     publishedAt:x.publishedAt,media:mediaUrls(x,live.media||[])}];
  })});
 });
 app.get('/api/admin/news-events',(_req,res)=>{
  if(!author(res)&&!reviewer(res))return res.sendStatus(403);
  res.set('Cache-Control','no-store');return res.json({items:all(db)});
 });
 app.post('/api/admin/news-events',express.json({limit:'12kb'}),(req,res)=>{
  if(!author(res))return res.sendStatus(403);
  const content=input(req.body);if(!content)return res.status(400).json({error:'Provide a valid title, description, kind and date for events.'});
  if(!admin(res))content.verified=false;
  const now=new Date().toISOString();
  const e:Entry={id:'news-'+crypto.randomUUID(),...content,status:'draft',createdAt:now,updatedAt:now,publishedAt:null};
  save(db,e);db.audit(actorOf(res)!.id,'NEWS_DRAFT_CREATE',e.id,null,{kind:e.kind});
  return res.status(201).json({item:e});
 });
 app.put('/api/admin/news-events/:id',express.json({limit:'12kb'}),(req,res)=>{
  if(!author(res))return res.sendStatus(403);
  const e=idOk(req.params.id)?read(db,req.params.id):undefined;
  if(!e)return res.sendStatus(404);
  const content=input(req.body);if(!content)return res.status(400).json({error:'Invalid news or event fields.'});
  if(!admin(res))content.verified=false;
  const live=e.live??(e.status==='published'?{
   kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,location:e.location,verified:e.verified,media:[...(e.media||[])]
  }:undefined);
  const updated={...e,...content,live,status:'draft' as const,scheduledAt:undefined,updatedAt:new Date().toISOString()};
  save(db,updated);db.audit(actorOf(res)!.id,'NEWS_DRAFT_EDIT',e.id,null,{});
  return res.json({item:updated});
 });
 app.post('/api/admin/news-events/:id/approve',express.json({limit:'4kb'}),(req,res)=>{
  if(!reviewer(res))return res.sendStatus(403);
  const e=idOk(req.params.id)?read(db,req.params.id):undefined;if(!e)return res.sendStatus(404);
  if(e.status!=='draft')return res.status(409).json({error:'Create a draft before review.'});
  e.verified=true;e.updatedAt=new Date().toISOString();e.scheduledAt=undefined;
  save(db,e);db.audit(actorOf(res)!.id,'NEWS_APPROVE',e.id,null,{});
  return res.json({item:e});
 });
 app.post('/api/admin/news-events/:id/schedule',express.json({limit:'4kb'}),(req,res)=>{
  if(!reviewer(res))return res.sendStatus(403);
  const e=idOk(req.params.id)?read(db,req.params.id):undefined;if(!e)return res.sendStatus(404);
  if(e.status!=='draft'||!e.verified)return res.status(409).json({error:'Approve the draft before scheduling.'});
  const at=req.body?.publishAt;
  if(typeof at!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.000Z$/.test(at)||
    !Number.isFinite(Date.parse(at))||Date.parse(at)<Date.now()+60_000||Date.parse(at)>Date.now()+365*86400000)
    return res.status(400).json({error:'Choose a future UTC date within one year.'});
  e.scheduledAt=at;e.updatedAt=new Date().toISOString();save(db,e);
  db.audit(actorOf(res)!.id,'NEWS_SCHEDULE',e.id,null,{at});
  return res.json({item:e});
 });
 app.post('/api/admin/news-events/:id/publish',express.json({limit:'4kb'}),(req,res)=>{
  if(!reviewer(res))return res.sendStatus(403);
  const e=idOk(req.params.id)?read(db,req.params.id):undefined;
  if(!e)return res.sendStatus(404);
  const publish=req.body?.published===true;
  if(publish&&!e.verified)return res.status(409).json({error:'Verify this announcement before publication.'});
  e.status=publish?'published':'draft';e.scheduledAt=undefined;
  e.live=publish?{kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,location:e.location,verified:e.verified,media:[...(e.media||[])]}:undefined;
  e.publishedAt=publish?new Date().toISOString():null;e.updatedAt=new Date().toISOString();
  save(db,e);db.audit(actorOf(res)!.id,publish?'NEWS_PUBLISH':'NEWS_UNPUBLISH',e.id,null,{});
  return res.json({item:e});
 });
 app.delete('/api/admin/news-events/:id',express.json({limit:'4kb'}),(req,res)=>{
  if(!reviewer(res))return res.sendStatus(403);
  const e=idOk(req.params.id)?read(db,req.params.id):undefined;
  if(!e)return res.sendStatus(404);
  if(req.body?.confirmation!=='DELETE_NEWS_EVENT')return res.status(400).json({error:'Confirmation required.'});
  db.run('DELETE FROM settings WHERE key=?',PREFIX+e.id);
  for(const media of [...(e.media||[]),...(e.live?.media||[])])fs.rmSync(mediaFile(media.id),{force:true});
  db.audit(actorOf(res)!.id,'NEWS_DELETE',e.id,null,{title:e.title});
  return res.json({success:true});
 });
}
