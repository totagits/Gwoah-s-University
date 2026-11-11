import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {Express,Response} from 'express';
import {actorOf} from './identity';
import type {Operations} from './operations';

type StaffCategory='executive'|'trustee'|'faculty';
type StaffProfile={
 id:string;name:string;title:string;category:StaffCategory;
 biography:string;imageVersion:number;status:'draft'|'published';updatedAt:string;
};
const PREFIX='public-staff:';
const idOk=(id:string)=>/^staff-[a-f0-9-]{36}$/.test(id);
const categoryOk=(v:string):v is StaffCategory=>['executive','trustee','faculty'].includes(v);
const editor=(res:Response)=>actorOf(res)?.role==='super_admin';
const list=(store:Operations):StaffProfile[]=>store.all(
 "SELECT key,value FROM settings WHERE key LIKE 'public-staff:%'"
).map(row=>{try{return JSON.parse(row.value) as StaffProfile;}catch{return null;}})
 .filter((p):p is StaffProfile=>Boolean(p&&idOk(p.id)))
 .sort((a,b)=>a.name.localeCompare(b.name));
const read=(store:Operations,id:string)=>list(store).find(p=>p.id===id);
const write=(store:Operations,p:StaffProfile)=>store.run(
 'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
 PREFIX+p.id,JSON.stringify(p));
const safeText=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const publicShape=(p:StaffProfile)=>({
 id:p.id,name:p.name,title:p.title,category:p.category,biography:p.biography,
 image:'/api/public/staff/'+p.id+'/photo?v='+p.imageVersion
});
const photoFile=(dir:string,id:string)=>path.join(dir,'public-staff-media',id+'.img');
const canReadImage=(store:Operations,id:string,admin:boolean)=>Boolean(
 read(store,id)?.status==='published'||admin);

export const installPublicStaffProfiles=(app:Express,store:Operations,dir:string)=>{
 const folder=path.join(dir,'public-staff-media');
 fs.mkdirSync(folder,{recursive:true,mode:0o700});
 app.get('/api/public/staff',(_req,res)=>{
   res.set('Cache-Control','no-store');
   return res.json({profiles:list(store).filter(p=>p.status==='published').map(publicShape)});
 });
 app.get('/api/public/staff/:id/photo',(req,res)=>{
   if(!idOk(req.params.id)||!canReadImage(store,req.params.id,false))return res.sendStatus(404);
   const file=photoFile(dir,req.params.id);
   if(!fs.existsSync(file))return res.sendStatus(404);
   const header=Buffer.alloc(8);const fd=fs.openSync(file,'r');
   try{fs.readSync(fd,header,0,8,0);}finally{fs.closeSync(fd);}
   const png=header.equals(Buffer.from([137,80,78,71,13,10,26,10]));
   res.set('Cache-Control','public, max-age=60');
   return res.type(png?'png':'jpeg').sendFile(file);
 });
 app.get('/api/admin/public-staff',(_req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   return res.json({profiles:list(store).map(p=>({...publicShape(p),status:p.status,updatedAt:p.updatedAt}))});
 });
 app.post('/api/admin/public-staff',(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const name=safeText(req.body?.name,120),title=safeText(req.body?.title,140),
     biography=safeText(req.body?.biography,3000),category=req.body?.category;
   if(name.length<2||title.length<2||biography.length<20||!categoryOk(category))
     return res.status(400).json({error:'Name, title, category and at least 20 characters of biography are required.'});
   const p:StaffProfile={id:'staff-'+crypto.randomUUID(),name,title,category,biography,
    status:'draft',imageVersion:0,updatedAt:new Date().toISOString()};
   write(store,p);store.audit(actorOf(res)!.id,'PUBLIC_STAFF_DRAFT_CREATE',p.id,null,{name,title});
   return res.status(201).json({profile:{...publicShape(p),status:p.status}});
 });
 app.put('/api/admin/public-staff/:id',(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const p=idOk(req.params.id)?read(store,req.params.id):undefined;
   if(!p)return res.sendStatus(404);
   const name=safeText(req.body?.name,120),title=safeText(req.body?.title,140),
    biography=safeText(req.body?.biography,3000),category=req.body?.category;
   if(name.length<2||title.length<2||biography.length<20||!categoryOk(category))
     return res.status(400).json({error:'Complete all required staff profile fields.'});
   const updated={...p,name,title,biography,category,updatedAt:new Date().toISOString()};
   write(store,updated);
   store.audit(actorOf(res)!.id,'PUBLIC_STAFF_EDIT',p.id,null,{name,title});
   return res.json({profile:{...publicShape(updated),status:updated.status}});
 });
 app.post('/api/admin/public-staff/:id/photo',(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const p=idOk(req.params.id)?read(store,req.params.id):undefined;
   if(!p)return res.sendStatus(404);
   const input=req.body?.imageBase64;
   if(typeof input!=='string'||input.length>3_000_000||input.length<100)
     return res.status(400).json({error:'Choose a JPEG or PNG photo smaller than 2 MB.'});
   const binary=Buffer.from(input,'base64');
   const png=binary.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
   const jpeg=binary[0]===0xff&&binary[1]===0xd8&&binary[2]===0xff;
   if(binary.length<128||binary.length>2_000_000||(!png&&!jpeg))
     return res.status(400).json({error:'A genuine PNG or JPEG under 2 MB is required.'});
   const file=photoFile(dir,p.id),temp=file+'.'+crypto.randomUUID()+'.tmp';
   fs.writeFileSync(temp,binary,{mode:0o600});fs.renameSync(temp,file);
   p.imageVersion++;p.updatedAt=new Date().toISOString();write(store,p);
   store.audit(actorOf(res)!.id,'PUBLIC_STAFF_PHOTO',p.id,null,{bytes:binary.length});
   return res.json({success:true});
 });
 app.get('/api/admin/public-staff/:id/photo',(req,res)=>{
   if(!editor(res)||!idOk(req.params.id)||!read(store,req.params.id))return res.sendStatus(404);
   const file=photoFile(dir,req.params.id);if(!fs.existsSync(file))return res.sendStatus(404);
   const header=Buffer.alloc(8);const fd=fs.openSync(file,'r');
   try{fs.readSync(fd,header,0,8,0);}finally{fs.closeSync(fd);}
   return res.type(header[0]===137?'png':'jpeg').sendFile(file);
 });
 app.post('/api/admin/public-staff/:id/publish',(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const p=idOk(req.params.id)?read(store,req.params.id):undefined;
   if(!p)return res.sendStatus(404);
   const published=req.body?.published===true;
   if(published&&!fs.existsSync(photoFile(dir,p.id)))
     return res.status(409).json({error:'Upload an authorized portrait before publishing.'});
   p.status=published?'published':'draft';p.updatedAt=new Date().toISOString();write(store,p);
   store.audit(actorOf(res)!.id,published?'PUBLIC_STAFF_PUBLISH':'PUBLIC_STAFF_UNPUBLISH',p.id,null,{});
   return res.json({success:true,status:p.status});
 });
 app.delete('/api/admin/public-staff/:id',(req,res)=>{
   if(!editor(res))return res.sendStatus(403);
   const p=idOk(req.params.id)?read(store,req.params.id):undefined;
   if(!p)return res.sendStatus(404);
   if(req.body?.confirmation!=='DELETE_PUBLIC_PROFILE')return res.status(400).json({error:'Deletion confirmation required.'});
   store.run('DELETE FROM settings WHERE key=?',PREFIX+p.id);
   store.audit(actorOf(res)!.id,'PUBLIC_STAFF_DELETE',p.id,null,{name:p.name});
   return res.json({success:true});
 });
};
