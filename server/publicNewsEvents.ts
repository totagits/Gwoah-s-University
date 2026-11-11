import crypto from 'node:crypto';
import express,{type Express,type Response} from 'express';
import {actorOf} from './identity';
import type {Operations} from './operations';

type Kind='news'|'event'|'announcement';
type Entry={id:string;kind:Kind;title:string;summary:string;eventDate:string;location:string;
 status:'draft'|'published';verified:boolean;createdAt:string;updatedAt:string;publishedAt:string|null;
 live?:{kind:Kind;title:string;summary:string;eventDate:string;location:string;verified:boolean};scheduledAt?:string};
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
 return {kind:kind as Kind,title,summary,eventDate,location,verified:v?.verified===true};
};
const all=(db:Operations):Entry[]=>
 db.all("SELECT value FROM settings WHERE key LIKE 'site-news:%'").flatMap(row=>{
  try{const e=JSON.parse(row.value) as Entry;return idOk(e.id)?[e]:[];}catch{return [];}
 }).sort((a,b)=>(b.eventDate||b.publishedAt||'').localeCompare(a.eventDate||a.publishedAt||''));
const read=(db:Operations,id:string)=>all(db).find(x=>x.id===id);
const save=(db:Operations,e:Entry)=>db.run(
 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
 PREFIX+e.id,JSON.stringify(e));
export function installPublicNewsEvents(app:Express,db:Operations){
 app.get('/api/public/news-events',(_req,res)=>{
  for(const pending of all(db).filter(x=>x.status==='draft'&&x.scheduledAt&&x.verified&&Date.parse(x.scheduledAt)<=Date.now())){
   pending.status='published';pending.live={kind:pending.kind,title:pending.title,summary:pending.summary,eventDate:pending.eventDate,location:pending.location,verified:true};
   pending.publishedAt=new Date().toISOString();pending.updatedAt=pending.publishedAt;pending.scheduledAt=undefined;
   save(db,pending);db.audit('system','NEWS_SCHEDULED_PUBLISH',pending.id,null,{});
  }
  res.set('Cache-Control','no-store');
  return res.json({items:all(db).flatMap(x=>{
   if(x.status==='published'&&x.verified)return [x];
   if(x.live?.verified)return [{...x,...x.live,status:'published'}];
   return [];
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
   kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,location:e.location,verified:e.verified
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
  e.live=publish?{kind:e.kind,title:e.title,summary:e.summary,eventDate:e.eventDate,location:e.location,verified:e.verified}:undefined;
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
  db.audit(actorOf(res)!.id,'NEWS_DELETE',e.id,null,{title:e.title});
  return res.json({success:true});
 });
}
