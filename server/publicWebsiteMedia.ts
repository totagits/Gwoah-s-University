import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import express, {type Express,type Request,type Response} from 'express';
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
const EXTRA_KEY='public-media:hero-extras';
type ExtraHero={slot:string;label:string;defaultSrc:string;order:number};
const extraHeroes=(store:Operations):ExtraHero[]=>{
  const raw=store.one('SELECT value FROM settings WHERE key=?',EXTRA_KEY);
  if(!raw)return [];
  try{
    const value=JSON.parse(raw.value);
    return Array.isArray(value)?value.filter((v:ExtraHero)=>
      typeof v.slot==='string'&&/^hero-extra-[a-f0-9-]{36}$/.test(v.slot)&&
      typeof v.label==='string'&&v.label.length>0&&v.label.length<=100&&
      v.defaultSrc===''&&Number.isSafeInteger(v.order)&&v.order>=0
    ).slice(0,10).sort((a,b)=>a.order-b.order):[];
  }catch{return [];}
};
const saveExtras=(store:Operations,videos:ExtraHero[])=>store.run(
  'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
  EXTRA_KEY,JSON.stringify(videos)
);
const allSlots=(store:Operations)=>[...DEFAULTS,...extraHeroes(store)];
const resolveSlot=(store:Operations,raw:string)=>allSlots(store).find(v=>v.slot===raw);

const KEY='public-media:';
const MAX_BYTES=50*1024*1024;
const CHUNK_BYTES=256*1024;
const UPLOAD_TTL=30*60*1000;
type UploadSession={id:string;slot:string;owner:string;size:number;received:number;created:number};
const pendingUploads=new Map<string,UploadSession>();
type State={draft?:string;published?:string;version:number;updatedAt?:string};
const isAdmin=(res:Response)=>actorOf(res)?.role==='super_admin';
const parse=(store:Operations,slot:string):State=>{
  const item=store.one('SELECT value FROM settings WHERE key=?',KEY+slot);
  return item?JSON.parse(item.value):{version:0};
};
const save=(store:Operations,slot:string,state:State)=>{
  store.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',KEY+slot,JSON.stringify(state));
};
const mediaPath=(directory:string,name:string)=>path.join(directory,'public-media',name);
const playableMp4=(file:string)=>{
  try{
    const stat=fs.statSync(file);
    if(!stat.isFile()||stat.size<12)return false;
    const fd=fs.openSync(file,'r');
    try{
      const header=Buffer.alloc(12);
      return fs.readSync(fd,header,0,12,0)===12 &&
        header.toString('ascii',4,8)==='ftyp';
    }finally{fs.closeSync(fd);}
  }catch{return false;}
};

const bundledCandidate=(src:string)=>{
  if(!src||!src.startsWith('/assets/'))return null;
  const rel=src.slice(1);
  const candidates=[path.join(process.cwd(),'dist',rel),path.join(process.cwd(),'public',rel)];
  return candidates.find(file=>fs.existsSync(file))||null;
};
const bundledPath=(src:string)=>{
  const file=bundledCandidate(src);
  return file&&playableMp4(file)?file:null;
};
const publishedCandidate=(store:Operations,directory:string,slot:string)=>{
  const published=parse(store,slot).published;
  if(!published||!/^[a-f0-9-]{36}\.mp4$/.test(published))return null;
  const file=mediaPath(directory,published);
  return fs.existsSync(file)?file:null;
};
const publishedPath=(store:Operations,directory:string,slot:string)=>{
  const file=publishedCandidate(store,directory,slot);
  return file&&playableMp4(file)?file:null;
};
export const getPublicVideoAvailability=(store:Operations,directory:string,slot:string)=>{
  const item=resolveSlot(store,slot);
  if(!item)return {available:false,source:'unknown' as const,file:null};
  const published=publishedPath(store,directory,slot);
  const bundled=bundledPath(item.defaultSrc);
  const corrupted=Boolean((publishedCandidate(store,directory,slot)&&!published)||
    (bundledCandidate(item.defaultSrc)&&!bundled));
  return {available:Boolean(published||bundled),
    source:published?'published' as const:bundled?'bundled' as const:
      corrupted?'invalid' as const:'missing' as const,
    file:published||bundled};
};
const sendMedia=(req:Request,res:Response,file:string,publiclyPublished=false)=>{
  try{
    const stat=fs.statSync(file);
    const range=req.headers.range;
    res.set('Content-Type','video/mp4');
    res.set('Accept-Ranges','bytes');
    res.set('Cache-Control',publiclyPublished?'public, max-age=60':'private, no-store');
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
  // The existing two original clips always remain available; new slots are public only after publishing.
  app.get('/api/public/hero-videos',(_req,res)=>{
    const builtIns=DEFAULTS.filter(v=>v.slot==='hero-campus'||v.slot==='hero-classroom');
    const added=extraHeroes(store).filter(v=>{
      const published=parse(store,v.slot).published;
      return Boolean(published&&fs.existsSync(mediaPath(directory,published)));
    });
    res.set('Cache-Control','no-store');
    return res.json({videos:[...builtIns,...added].map((v,index)=>({
      id:v.slot, title:v.label, subtitle:'',
      src:'/api/public/video/'+v.slot,
      badge:'HIAU Video '+(index+1),
      label:String(index+1).padStart(2,'0')+' '+(v.slot==='hero-campus'?'Campus':v.slot==='hero-classroom'?'Classroom':v.label),
    }))});
  });
  app.get('/api/public/video-status/:slot',(req,res)=>{
    const item=resolveSlot(store,req.params.slot);
    if(!item)return res.status(404).json({available:false});
    const status=getPublicVideoAvailability(store,directory,item.slot);
    res.set('Cache-Control','no-store');
    return res.json({available:status.available,source:status.source});
  });
  // Do not redirect to a nonexistent fallback asset; absent videos should
  // render as clearly unavailable, never as a misleading campus poster.
  for(const method of ['get','head'] as const){
    app[method]('/api/public/video/:slot',(req,res)=>{
      const item=resolveSlot(store,req.params.slot);
      if(!item)return res.status(404).end();
      const file=getPublicVideoAvailability(store,directory,item.slot).file;
      return file?sendMedia(req,res,file,true):res.status(404).end();
    });
  }
  app.post('/api/admin/website-videos',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const label=typeof req.body?.title==='string'?req.body.title.trim():'';
    if(!label||label.length>100)return res.status(400).json({error:'Enter a title of 1–100 characters.'});
    const extras=extraHeroes(store);
    if(extras.length>=10)return res.status(409).json({error:'Maximum of ten extra homepage videos.'});
    const item:ExtraHero={slot:'hero-extra-'+crypto.randomUUID(),label,defaultSrc:'',order:extras.length};
    const actor=actorOf(res)!;
    store.transaction(()=>{
      saveExtras(store,[...extras,item]);
      store.audit(actor.id,'WEBSITE_HERO_VIDEO_CREATE',item.slot,null,{label});
    });
    return res.status(201).json({success:true,slot:item.slot});
  });
  app.post('/api/admin/website-videos/reorder',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const extras=extraHeroes(store);
    const ids:unknown=req.body?.ids;
    if(!Array.isArray(ids)||ids.length!==extras.length||
      new Set(ids).size!==extras.length||
      ids.some(v=>typeof v!=='string'||!extras.some(e=>e.slot===v)))
      return res.status(400).json({error:'Include every additional homepage video exactly once.'});
    const ordered=ids.map((slot,order)=>({...extras.find(e=>e.slot===slot)!,order}));
    const actor=actorOf(res)!;
    store.transaction(()=>{
      saveExtras(store,ordered);
      store.audit(actor.id,'WEBSITE_HERO_VIDEO_REORDER','hero-extras',null,{ids});
    });
    return res.json({success:true});
  });
  app.delete('/api/admin/website-video/:slot/extra',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    if(req.body?.confirmation!=='REMOVE_ADDITIONAL_HOME_VIDEO')
      return res.status(400).json({error:'Explicit confirmation required.'});
    const extras=extraHeroes(store);
    if(!extras.some(e=>e.slot===req.params.slot))return res.sendStatus(404);
    const next=extras.filter(e=>e.slot!==req.params.slot).map((e,order)=>({...e,order}));
    const actor=actorOf(res)!;
    store.transaction(()=>{
      saveExtras(store,next);
      store.audit(actor.id,'WEBSITE_HERO_VIDEO_REMOVE',req.params.slot,null,{});
    });
    // File bytes are kept for backup/recovery rather than deleted during publication edits.
    return res.json({success:true});
  });
  app.get('/api/admin/website-videos',(_req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    return res.json({videos:allSlots(store).map(v=>({
      ...v,...parse(store,v.slot),
      defaultAvailable:Boolean(bundledPath(v.defaultSrc)),
      publicAvailable:Boolean(getPublicVideoAvailability(store,directory,v.slot).available),
      mediaSource:getPublicVideoAvailability(store,directory,v.slot).source,
      previewSrc:'/api/admin/website-video/'+v.slot+'/preview',
      publicSrc:'/api/public/video/'+v.slot,
    }))});
  });
  app.get('/api/admin/website-video/:slot/preview',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(store,req.params.slot);
    if(!item)return res.sendStatus(404);
    const state=parse(store,item.slot);
    if(state.draft)return sendMedia(req,res,mediaPath(directory,state.draft));
    const file=publishedPath(store,directory,item.slot)||bundledPath(item.defaultSrc);
    return file?sendMedia(req,res,file):res.status(404).end();
  });
  // Small authenticated chunks avoid a reverse-proxy limit on one large PUT.
  // Upload sessions are process-local; partial transfers must restart after app restart.
  const cleanupUploads=()=>{
    const now=Date.now();
    for(const [id,session] of pendingUploads){
      if(now-session.created>UPLOAD_TTL){
        pendingUploads.delete(id);
        fs.rmSync(path.join(storage,'.pending-'+id+'.part'),{force:true});
      }
    }
  };
  app.post('/api/admin/website-video/:slot/uploads',(req,res)=>{
    if(!isAdmin(res))return res.status(403).json({error:'Super Administrator required.'});
    const item=resolveSlot(store,req.params.slot);
    if(!item)return res.status(404).json({error:'Unknown video slot.'});
    const size=req.body?.size;
    if(!Number.isSafeInteger(size)||size<24||size>MAX_BYTES)
      return res.status(400).json({error:'MP4 size must be between 24 bytes and 50 MB.'});
    cleanupUploads();
    const actor=actorOf(res)!;
    if([...pendingUploads.values()].filter(v=>v.owner===actor.id).length>=3)
      return res.status(429).json({error:'Three uploads already in progress. Please retry later.'});
    const id=crypto.randomUUID();
    try{
      fs.writeFileSync(path.join(storage,'.pending-'+id+'.part'),Buffer.alloc(0),{flag:'wx',mode:0o600});
      pendingUploads.set(id,{id,slot:item.slot,owner:actor.id,size,received:0,created:Date.now()});
      return res.status(201).json({uploadId:id,chunkSize:CHUNK_BYTES});
    }catch{
      return res.status(500).json({error:'Unable to initialize private upload.'});
    }
  });
  app.post('/api/admin/website-video/:slot/uploads/:uploadId/chunk',
    express.raw({type:'application/octet-stream',limit:'270kb'}),
    (req,res)=>{
      if(!isAdmin(res))return res.status(403).json({error:'Super Administrator required.'});
      const session=pendingUploads.get(req.params.uploadId);
      const actor=actorOf(res)!;
      if(!session||session.slot!==req.params.slot||session.owner!==actor.id||
        Date.now()-session.created>UPLOAD_TTL)
        return res.status(404).json({error:'Upload session expired or unavailable. Start again.'});
      const bytes=req.body;
      const index=Number(req.get('x-hiau-chunk-index'));
      if(!Buffer.isBuffer(bytes)||bytes.length===0||bytes.length>CHUNK_BYTES||
        !Number.isSafeInteger(index)||index!==Math.floor(session.received/CHUNK_BYTES)||
        session.received+bytes.length>session.size||
        (session.received+bytes.length<session.size&&bytes.length!==CHUNK_BYTES))
        return res.status(400).json({error:'Invalid or out-of-order video chunk.'});
      try{
        fs.appendFileSync(path.join(storage,'.pending-'+session.id+'.part'),bytes);
        session.received+=bytes.length;
        return res.json({success:true,received:session.received,total:session.size});
      }catch{
        pendingUploads.delete(session.id);
        fs.rmSync(path.join(storage,'.pending-'+session.id+'.part'),{force:true});
        return res.status(500).json({error:'Unable to write video chunk.'});
      }
    }
  );
  app.post('/api/admin/website-video/:slot/uploads/:uploadId/complete',(req,res)=>{
    if(!isAdmin(res))return res.status(403).json({error:'Super Administrator required.'});
    const session=pendingUploads.get(req.params.uploadId);
    const actor=actorOf(res)!;
    if(!session||session.slot!==req.params.slot||session.owner!==actor.id||
      Date.now()-session.created>UPLOAD_TTL)
      return res.status(404).json({error:'Upload session expired or unavailable.'});
    if(session.received!==session.size)
      return res.status(409).json({error:'Video upload is not complete.'});
    const item=resolveSlot(store,session.slot);
    if(!item)return res.status(404).json({error:'Video slot no longer exists.'});
    const temp=path.join(storage,'.pending-'+session.id+'.part');
    const filename=crypto.randomUUID()+'.mp4';
    const destination=mediaPath(directory,filename);
    try{
      if(!checkMp4(temp))return res.status(415).json({error:'Invalid MP4 file header.'});
      fs.renameSync(temp,destination);
      const previous=parse(store,session.slot);
      store.transaction(()=>{
        save(store,session.slot,{...previous,draft:filename,updatedAt:new Date().toISOString()});
        store.audit(actor.id,'WEBSITE_VIDEO_DRAFT_UPLOAD',session.slot,null,{bytes:session.size,filename,mode:'chunked'});
      });
      pendingUploads.delete(session.id);
      if(previous.draft&&previous.draft!==previous.published)
        fs.rmSync(mediaPath(directory,previous.draft),{force:true});
      return res.status(201).json({success:true,bytes:session.size,pendingPublication:true});
    }catch{
      pendingUploads.delete(session.id);
      fs.rmSync(temp,{force:true});
      fs.rmSync(destination,{force:true});
      return res.status(500).json({error:'Unable to finalize private video upload.'});
    }
  });
  app.delete('/api/admin/website-video/:slot/uploads/:uploadId',(req,res)=>{
    if(!isAdmin(res))return res.status(403).json({error:'Super Administrator required.'});
    const session=pendingUploads.get(req.params.uploadId);
    if(!session||session.slot!==req.params.slot||session.owner!==actorOf(res)!.id)
      return res.status(404).json({error:'Upload session not found.'});
    pendingUploads.delete(session.id);
    fs.rmSync(path.join(storage,'.pending-'+session.id+'.part'),{force:true});
    return res.json({success:true});
  });
  app.put('/api/admin/website-video/:slot',async(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(store,req.params.slot);
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
  // Discard an unpublished replacement without changing the currently public clip.
  app.delete('/api/admin/website-video/:slot/draft',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(store,req.params.slot);
    if(!item)return res.sendStatus(404);
    if(req.body?.confirmation!=='DISCARD_WEBSITE_VIDEO_DRAFT')
      return res.status(400).json({error:'Confirm discarding this private draft explicitly.'});
    const state=parse(store,item.slot);
    if(!state.draft)return res.status(409).json({error:'No unpublished draft exists for this video.'});
    const actor=actorOf(res)!;
    store.transaction(()=>{
      save(store,item.slot,{...state,draft:undefined,updatedAt:new Date().toISOString()});
      store.audit(actor.id,'WEBSITE_VIDEO_DRAFT_DISCARD',item.slot,null,{hadDraft:true});
    });
    if(state.draft!==state.published)
      fs.rmSync(mediaPath(directory,state.draft),{force:true});
    return res.json({success:true});
  });
  app.post('/api/admin/website-video/:slot/publish',(req,res)=>{
    if(!isAdmin(res))return res.sendStatus(403);
    const item=resolveSlot(store,req.params.slot);
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
    const item=resolveSlot(store,req.params.slot);
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
