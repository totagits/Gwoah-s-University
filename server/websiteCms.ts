import crypto from 'node:crypto';
import express,{type Express,type Response} from 'express';
import {actorOf} from './identity';
import type {Operations} from './operations';
import degreeExplainers from '../scripts/hiau-degree-video-content.json';

// Plain-text CMS content only. No arbitrary HTML, scripts, URLs or application settings.
const degreeSlug=(name:string)=>name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const degreeRoutes=degreeExplainers.degrees.map(d=>d.college+'--'+degreeSlug(d.name));
const degreeFields=['overview','relevance','careers','focus','duration','credential'] as const;
export const degreeContentSlots=degreeRoutes.flatMap(route=>degreeFields.map(field=>'degree.'+route+'.'+field));
const navigationLabels=['hero','about','tour','colleges','admissions','calendar','dei'] as const;
const footerContactSlots=['campus-address','admin-address','liaison-address','phone-1','phone-2','phone-3','phone-4','email-1','email-2'] as const;
const sections=['home','about','academics','admissions','events','student-life','footer','navigation'] as const;
type Section=(typeof sections)[number];
export const managedSlots={
 home:['hero-heading','hero-description'],
 about:['page-heading','page-description','vision','mission','motto','institutional-history'],
 academics:['page-heading','page-description',...degreeContentSlots],
 admissions:['page-heading','page-description'],
 events:[],
 'student-life':[],
 footer:[...footerContactSlots],
 navigation:navigationLabels.map(id=>'label-'+id)
} as const;
type Content={section:Section;title:string;body:string;verified:boolean;slot?:string};
type Revision={revision:number;at:string;actor:string;action:string;content:Content|null};
type RecordItem={id:string;draft:Content|null;published:Content|null;revision:number;history:Revision[];archived:boolean;updatedAt:string};
const PREFIX='website-cms:';
const validId=(id:string)=>/^cms-[a-f0-9-]{36}$/.test(id);
const editor=(res:Response)=>actorOf(res)?.role==='super_admin';
const safe=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const parseContent=(v:any):Content|null=>{
 const section=v?.section;
 const title=safe(v?.title,150),body=safe(v?.body,4000);
 if(!sections.includes(section)||title.length<3||body.length<15)return null;
 const slot=safe(v?.slot,60);
 if(slot&&!((managedSlots as Record<string,readonly string[]>)[section]||[]).includes(slot))return null;
 if(slot.startsWith('label-')&&(body.length>32||/[\r\n]/.test(body)))return null;
 if(slot.startsWith('phone-')&&!/^\+?[0-9() .-]{7,25}$/.test(body))return null;
 if(slot.startsWith('email-')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body))return null;
 if(slot.endsWith('.duration')&&body.length>55)return null;
 if(slot.endsWith('.credential')&&body.length>70)return null;
 if(slot.endsWith('.focus')&&body.length>650)return null;
 return {section,title,body,verified:v?.verified===true,...(slot?{slot}:{})};
};
const entries=(store:Operations):RecordItem[]=>
 store.all("SELECT value FROM settings WHERE key LIKE 'website-cms:%'").flatMap(row=>{
   try{const entry=JSON.parse(row.value) as RecordItem;return validId(entry.id)?[entry]:[];}catch{return [];}
 }).sort((a,b)=>a.id.localeCompare(b.id));
const get=(store:Operations,id:string)=>entries(store).find(v=>v.id===id);
const save=(store:Operations,v:RecordItem)=>store.run(
 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
 PREFIX+v.id,JSON.stringify(v));
const history=(v:RecordItem,actor:string,action:string,content:Content|null)=>{
 v.revision++;
 v.updatedAt=new Date().toISOString();
 v.history.push({revision:v.revision,at:v.updatedAt,actor,action,content});
 // Limit saved revisions without affecting current draft or live published content.
 v.history=v.history.slice(-60);
};
const summary=(v:RecordItem)=>({
 id:v.id,draft:v.draft,published:v.published,revision:v.revision,
 archived:v.archived,updatedAt:v.updatedAt,history:v.history
});
const expected=(body:any,v:RecordItem)=>Number.isSafeInteger(body?.expectedRevision)&&body.expectedRevision===v.revision;
export function installWebsiteCms(app:Express,store:Operations){
 app.get('/api/public/site-content',(_req,res)=>{
   res.set('Cache-Control','no-store');
   res.json({items:entries(store).filter(v=>!v.archived&&v.published).map(v=>({id:v.id,...v.published}))});
 });
 app.get('/api/admin/site-content',(_req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   res.set('Cache-Control','no-store');
   return res.json({items:entries(store).map(summary),sections,managedSlots});
 });
 app.post('/api/admin/site-content',express.json({limit:'16kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const content=parseContent(req.body);if(!content)return res.status(400).json({error:'Select a section and provide valid title and body.'});
   const item:RecordItem={id:'cms-'+crypto.randomUUID(),draft:content,published:null,revision:0,history:[],archived:false,updatedAt:''};
   history(item,actorOf(res)!.id,'CREATE_DRAFT',content);
   save(store,item);store.audit(actorOf(res)!.id,'SITE_CMS_CREATE',item.id,null,{section:content.section});
   return res.status(201).json({item:summary(item)});
 });
 app.put('/api/admin/site-content/:id',express.json({limit:'16kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const item=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!item||item.archived)return res.sendStatus(404);
   if(!expected(req.body,item))return res.status(409).json({error:'Content changed since it was loaded. Refresh before editing.'});
   const content=parseContent(req.body);if(!content)return res.status(400).json({error:'Invalid content fields.'});
   // Editing always updates a private draft; the previous published revision stays live.
   item.draft=content;history(item,actorOf(res)!.id,'EDIT_DRAFT',content);save(store,item);
   store.audit(actorOf(res)!.id,'SITE_CMS_EDIT',item.id,null,{revision:item.revision});
   return res.json({item:summary(item)});
 });
 app.post('/api/admin/site-content/:id/publish',express.json({limit:'4kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const item=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!item||item.archived)return res.sendStatus(404);
   if(!expected(req.body,item))return res.status(409).json({error:'Content changed. Refresh and retry.'});
   if(!item.draft?.verified)return res.status(409).json({error:'Review and verify the draft before publication.'});
   if(item.draft.slot&&entries(store).some(other=>other.id!==item.id&&!other.archived&&
     other.published?.section===item.draft?.section&&other.published?.slot===item.draft?.slot))
     return res.status(409).json({error:'Another published item already controls this page field. Unpublish that item first.'});
   item.published={...item.draft};item.draft=null;
   history(item,actorOf(res)!.id,'PUBLISH',item.published);save(store,item);
   store.audit(actorOf(res)!.id,'SITE_CMS_PUBLISH',item.id,null,{revision:item.revision});
   return res.json({item:summary(item)});
 });
 app.post('/api/admin/site-content/:id/unpublish',express.json({limit:'4kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const item=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!item||item.archived)return res.sendStatus(404);
   if(!expected(req.body,item))return res.status(409).json({error:'Content changed. Refresh and retry.'});
   item.published=null;history(item,actorOf(res)!.id,'UNPUBLISH',null);save(store,item);
   store.audit(actorOf(res)!.id,'SITE_CMS_UNPUBLISH',item.id,null,{revision:item.revision});
   return res.json({item:summary(item)});
 });
 app.post('/api/admin/site-content/:id/restore',express.json({limit:'4kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const item=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!item||item.archived)return res.sendStatus(404);
   if(!expected(req.body,item))return res.status(409).json({error:'Content changed. Refresh and retry.'});
   const source=item.history.find(v=>v.revision===req.body?.revision);
   if(!source?.content)return res.status(404).json({error:'Revision not available.'});
   item.draft={...source.content,verified:false};
   history(item,actorOf(res)!.id,'RESTORE_TO_DRAFT',item.draft);save(store,item);
   store.audit(actorOf(res)!.id,'SITE_CMS_RESTORE',item.id,null,{revision:source.revision});
   return res.json({item:summary(item)});
 });
 app.delete('/api/admin/site-content/:id',express.json({limit:'4kb'}),(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const item=validId(req.params.id)?get(store,req.params.id):undefined;
   if(!item||item.archived)return res.sendStatus(404);
   if(!expected(req.body,item)||req.body?.confirmation!=='ARCHIVE_SITE_CONTENT')
     return res.status(400).json({error:'Current revision and archive confirmation are required.'});
   item.archived=true;item.published=null;item.draft=null;
   history(item,actorOf(res)!.id,'ARCHIVE',null);save(store,item);
   store.audit(actorOf(res)!.id,'SITE_CMS_ARCHIVE',item.id,null,{revision:item.revision});
   return res.json({item:summary(item)});
 });
}
