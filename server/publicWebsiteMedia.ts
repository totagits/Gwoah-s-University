import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import type {Express,Request,Response} from 'express';
import {actorOf} from './identity';
import {Operations} from './operations';
import degreeContent from '../scripts/hiau-degree-video-content.json';

const slug=(value:string)=>value.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const DEFAULTS=[
  {slot:'hero-campus',label:'Homepage · Campus video',defaultSrc:'/assets/aistudio/image_20261105_121706_f720baa0.mp4'},
  {slot:'hero-classroom',label:'Homepage · Classroom video',defaultSrc:'/assets/aistudio/image_20261105_102657_b174d32f.mp4'},
  ...degreeContent.degrees.map(d=>({
    slot:d.college+'--'+slug(d.name),label:d.name,defaultSrc:'/assets/degree-clips/'+d.college+'--'+slug(d.name)+'.mp4',
  })),
].map(item=>({
  ...item,
  defaultSrc:item.slot==='business--bachelor-of-business-administration-in-accounting'
    ? '/assets/degree-clips/image_20261108_223153.mp4'
    : item.slot==='business--bachelor-of-business-administration-in-entrepreneurship'
    ? '/assets/degree-clips/image_20261108_232357_1.mp4'
    : item.slot==='liberal_arts--bachelor-of-arts-in-liberal-arts-humanities'
    ? '/assets/degree-clips/image_20261108_233524.mp4'
    : item.slot==='liberal_arts--bachelor-of-arts-in-strategic-communications-media'
    ? '/assets/degree-clips/image_20261109_002629_2.mp4'
    : item.defaultSrc,
}));
const bySlot=new Map(DEFAULTS.map(x=>[x.slot,x]));
const KEY='public-media:';
const MAX_BYTES=50*1024*1024;
type State={draft?:string;published?:string;version:number;updatedAt?:string};
const isAdmin=(res:Response)=>actorOf(res)?.role==='super_admin';
const parse=(store:Operations,slot:string):State=>{
  const item=store.one('SELECT value FROM settings WHERE key=?',KEY+slot);
  return item?JSON.parse(item.value):{version:0};
};
const save=(store:Operations,slot:string,state:State)=>{
  store.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',KEY+slot,JSON.stringify(state));
};
const resolveSlot=(raw:string)=>bySlot.get(raw);
const mediaPath=(directory:string,name:string)=>path.join(directory,'public-media',name);
const sendMedia=(req:Request,res:Response,file:string)=>{
  try{
    const stat=fs.statSync(file);
    const range=req.headers.range;
    res.set('Content-Type','video/mp4');
    res.set('Accept-Ranges','bytes');
    res.set('Cache-Control','private, no-store');
    if(range){
      const m=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!m||(!m[1]&&!m[2]))return res.status(416).set('Content-Range',`bytes */${stat.size}`).end();
      let start=m[1]?Number(m[1]):Math.max(0,stat.size-Number(m[2]));
      const end=m[2]&&m[1]?Math.min(Number(m[2]),stat.size-1):stat.size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=stat.size)
        return res.status(416).set('Content-Range',`bytes */${stat.size}`).end();
      res.status(206).set('Content-Range',`bytes ${start}-${end}/${stat.size}`);
      res.set('Content-Length',String(end-start+1));
      if(req.method==='HEAD')return res.end();
      return fs.createReadStream(file,{start,end}).pipe(res);
    }
    res.set('Content-Length',String(stat.size));
    if(req.method==='HEAD')return res.end();
    return fs.createReadStream(file).pipe(res);
  }catch{return res.status(404).end();}
};
const checkMp4=(name:string)=>{
  const fd=fs.openSync(name,'r');
  try{
    const head=Buffer.alloc(12);const read=fs.readSync(fd,head,0,12,0);
    return read===12&&head.toString('ascii',4,8)==='ftyp';
  }finally{fs.closeSync(fd);}
};

export function installPublicWebsiteMedia(app:Express,store:Operations,directory:string){
  const storage=path.join(directory,'public-media');
  fs.mkdirSync(storage,{recursive:true,mode:0o700});
  app.get('/api/public/video/:slot',(req,res)=>{
    const item=resolveSlot(req.params.slot);
    if(!item)return res.status(404).end();
    const published=parse(store,item.slot).published;
    if(published)return sendMedia(req,res,mediaPath(directory,published));
    return res.redirect(302,item.defaultSrc);
  });
  app.head('/api/public/video/:slot',(req,res)=>{
    const item=resolveSlot(req.params.slot);
    if(!item)return res.status(404).end();
    const published=parse(store,item.slot).published;
    if(published)return sendMedia(req,res,mediaPath(directory,published));
    return res.redirect(302,item.defaultSrc);
  });
  app.get('/api/admin/website-videos',(_req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    return res.json({videos:DEFAULTS.map(v=>({
      ...v,...parse(store,v.slot),
      previewSrc:'/api/admin/website-video/'+v.slot+'/preview',
      publicSrc:'/api/public/video/'+v.slot,
    }))});
  });
  app.get('/api/admin/website-video/:slot/preview',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(req.params.slot);
    if(!item)return res.sendStatus(404);
    const state=parse(store,item.slot);
    if(state.draft)return sendMedia(req,res,mediaPath(directory,state.draft));
    return res.redirect(302,state.published?'/api/public/video/'+item.slot:item.defaultSrc);
  });
  app.put('/api/admin/website-video/:slot',async(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(req.params.slot);
    if(!item)return res.sendStatus(404);
    if(!req.is('video/mp4'))return res.status(415).json({error:'Upload an MP4 video.'});
    if(Number(req.headers['content-length']||0)>MAX_BYTES)
      return res.status(413).json({error:'Video is larger than 50 MB.'});
    const filename=crypto.randomUUID()+'.mp4';
    const file=mediaPath(directory,filename);
    let bytes=0;
    try{
      const limiter=new Transform({transform(chunk:Buffer,_encoding,callback){
        bytes+=chunk.length;
        if(bytes>MAX_BYTES)callback(new Error('Video is larger than 50 MB.'));
        else callback(null,chunk);
      }});
      await pipeline(req,limiter,fs.createWriteStream(file,{flags:'wx',mode:0o600}));
      if(bytes<24||!checkMp4(file))throw new Error('Invalid MP4 file header.');
      const actor=actorOf(res)!;
      const previous=parse(store,item.slot);
      const next={...previous,draft:filename,updatedAt:new Date().toISOString()};
      store.transaction(()=>{
        save(store,item.slot,next);
        store.audit(actor.id,'WEBSITE_VIDEO_DRAFT_UPLOAD',item.slot,null,{bytes,filename});
      });
      if(previous.draft&&previous.draft!==previous.published)fs.rmSync(mediaPath(directory,previous.draft),{force:true});
      return res.status(201).json({success:true,bytes,pendingPublication:true});
    }catch(e){
      fs.rmSync(file,{force:true});
      return res.status(bytes>MAX_BYTES?413:400).json({error:e instanceof Error?e.message:'Unable to upload MP4.'});
    }
  });
  app.post('/api/admin/website-video/:slot/publish',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(req.params.slot);
    if(!item)return res.sendStatus(404);
    if(req.body?.confirmation!=='PUBLISH_WEBSITE_VIDEO')
      return res.status(400).json({error:'Confirm publication explicitly.'});
    const state=parse(store,item.slot);
    if(!state.draft||!fs.existsSync(mediaPath(directory,state.draft)))
      return res.status(409).json({error:'Upload a valid video draft before publishing.'});
    const actor=actorOf(res)!;
    const next={...state,version:state.version+1,published:state.draft,draft:undefined,updatedAt:new Date().toISOString()};
    store.transaction(()=>{
      save(store,item.slot,next);
      store.audit(actor.id,'WEBSITE_VIDEO_PUBLISH',item.slot,{version:state.version},{version:next.version});
    });
    return res.json({success:true,version:next.version});
  });
  app.delete('/api/admin/website-video/:slot',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(req.params.slot);
    if(!item)return res.sendStatus(404);
    if(req.body?.confirmation!=='RESTORE_DEFAULT_WEBSITE_VIDEO')
      return res.status(400).json({error:'Confirm restoration explicitly.'});
    const state=parse(store,item.slot);
    const actor=actorOf(res)!;
    store.transaction(()=>{
      save(store,item.slot,{version:state.version+1,updatedAt:new Date().toISOString()});
      store.audit(actor.id,'WEBSITE_VIDEO_RESTORE_DEFAULT',item.slot,state,{defaultSrc:item.defaultSrc});
    });
    if(state.draft&&state.draft!==state.published)fs.rmSync(mediaPath(directory,state.draft),{force:true});
    return res.json({success:true});
  });
}
