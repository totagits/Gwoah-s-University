import React,{useCallback,useEffect,useState} from 'react';
import {Upload,CheckCircle2,RotateCcw,PlayCircle,AlertTriangle} from 'lucide-react';

type VideoSlot={
  slot:string;label:string;defaultSrc:string;previewSrc:string;publicSrc:string;
  version:number;draft?:string;published?:string;updatedAt?:string;order?:number;
};
type RoleProps={currentUser:{role:string}};
const parseApiResponse=async(response:Response)=>{
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.includes('application/json')){
    const kind=response.status===413?'Upload was rejected as too large by the hosting proxy.':
      response.status===401||response.status===403?'Session expired or proxy access was denied. Please sign in again.':
      'Hosting server returned an HTML/non-JSON response during the request.';
    throw new Error(kind+' (HTTP '+response.status+').');
  }
  const data=await response.json();
  if(!response.ok)throw new Error((data.error||'Request failed')+' (HTTP '+response.status+').');
  return data;
};

export const WebsiteVideoLibrary:React.FC<RoleProps>=({currentUser})=>{
  const [slots,setSlots]=useState<VideoSlot[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [selected,setSelected]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [newHeroTitle,setNewHeroTitle]=useState('');
  const [previewVersion,setPreviewVersion]=useState(0);
  const [uploadProgress,setUploadProgress]=useState<number|null>(null);
  const load=useCallback(async()=>{
    const r=await fetch('/api/admin/website-videos',{cache:'no-store'});
    if(!r.ok)throw new Error('Video library is unavailable to this account.');
    const data=await r.json();
    setSlots(data.videos||[]);
    setSelected(previous=>data.videos?.some((v:VideoSlot)=>v.slot===previous)?previous:data.videos?.[0]?.slot||'');
  },[]);
  useEffect(()=>{
    void load().catch(e=>setError(e instanceof Error?e.message:'Could not load website video library.'));
  },[load]);
  const active=slots.find(s=>s.slot===selected);
  const extras=slots.filter(s=>s.slot.startsWith('hero-extra-')).sort((a,b)=>(a.order??0)-(b.order??0));
  const createHero=async()=>{
    const title=newHeroTitle.trim();
    if(!title||busy)return;
    setBusy('create');setError('');setMessage('');
    try{
      const r=await fetch('/api/admin/website-videos',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title}),
      });
      const result=await parseApiResponse(r);
      setNewHeroTitle('');await load();
      setSelected(result.slot);
      setMessage('Homepage video created as a private slot. Upload and publish an MP4 to show it to visitors.');
    }catch(e){setError(e instanceof Error?e.message:'Unable to create homepage video.');}
    finally{setBusy(null);}
  };
  const removeHero=async()=>{
    if(!active?.slot.startsWith('hero-extra-')||busy)return;
    if(!window.confirm('Remove this additional homepage video from the carousel? The media file will be retained for recovery.'))return;
    setBusy('remove');setError('');setMessage('');
    try{
      const r=await fetch('/api/admin/website-video/'+encodeURIComponent(active.slot)+'/extra',{
        method:'DELETE',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({confirmation:'REMOVE_ADDITIONAL_HOME_VIDEO'}),
      });
      const result=await r.json();
      if(!r.ok)throw new Error(result.error||'Unable to remove video.');
      setMessage('Additional homepage video removed from the carousel.');
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Unable to remove homepage video.');}
    finally{setBusy(null);}
  };
  const moveHero=async(step:number)=>{
    if(!active?.slot.startsWith('hero-extra-')||busy)return;
    const index=extras.findIndex(v=>v.slot===active.slot), next=index+step;
    if(next<0||next>=extras.length)return;
    const ids=extras.map(v=>v.slot);
    [ids[index],ids[next]]=[ids[next],ids[index]];
    setBusy('order');setError('');setMessage('');
    try{
      const r=await fetch('/api/admin/website-videos/reorder',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids}),
      });
      const result=await r.json();
      if(!r.ok)throw new Error(result.error||'Could not reorder homepage videos.');
      setMessage('Additional homepage video order updated.');
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Could not reorder videos.');}
    finally{setBusy(null);}
  };
  const run=async(kind:'upload'|'publish'|'restore')=>{
    if(!active||busy)return;
    const id=active.slot;
    if(kind==='upload'){
      if(!file)return setError('Choose an MP4 video to upload.');
      if(file.type!=='video/mp4'&&!file.name.toLowerCase().endsWith('.mp4'))
        return setError('Please choose an MP4 video.');
      if(file.size>50*1024*1024)return setError('MP4 must not exceed 50 MB.');
    }
    if(kind==='publish'&&!window.confirm('Publish this replacement video to the public website for '+active.label+'?'))return;
    if(kind==='restore'&&!window.confirm('Restore the original HIAU video for '+active.label+'?'))return;
    setBusy(id);setError('');setMessage('');
    try{
      const url='/api/admin/website-video/'+encodeURIComponent(id);
      if(kind==='upload'){
        const bytes=file!;
        // The original single 4.4MB PUT received an HTML proxy response in staging.
        // Use sequential 256KB POST requests to stay below typical proxy body limits.
        const begin=await fetch(url+'/uploads',{
          method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({size:bytes.size}),
        });
        const {uploadId,chunkSize}=await parseApiResponse(begin);
        if(typeof uploadId!=='string'||!Number.isSafeInteger(chunkSize)||chunkSize<1||chunkSize>256*1024)
          throw new Error('Invalid upload session response.');
        setUploadProgress(0);
        try{
          let uploaded=0;
          for(let index=0;uploaded<bytes.size;index++){
            const piece=bytes.slice(uploaded,Math.min(uploaded+chunkSize,bytes.size));
            const response=await fetch(url+'/uploads/'+encodeURIComponent(uploadId)+'/chunk',{
              method:'POST',
              headers:{'Content-Type':'application/octet-stream','X-HIAU-Chunk-Index':String(index)},
              body:piece,
            });
            await parseApiResponse(response);
            uploaded+=piece.size;
            setUploadProgress(Math.round(uploaded*100/bytes.size));
          }
          const final=await fetch(url+'/uploads/'+encodeURIComponent(uploadId)+'/complete',{
            method:'POST',headers:{'Content-Type':'application/json'},body:'{}',
          });
          await parseApiResponse(final);
        }catch(error){
          void fetch(url+'/uploads/'+encodeURIComponent(uploadId),{method:'DELETE'}).catch(()=>{});
          throw error;
        }
      }else{
        const response=await fetch(kind==='publish'?url+'/publish':url,{
          method:kind==='publish'?'POST':'DELETE',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            confirmation:kind==='publish'?'PUBLISH_WEBSITE_VIDEO':'RESTORE_DEFAULT_WEBSITE_VIDEO',
          }),
        });
        await parseApiResponse(response);
      }
      setMessage(kind==='upload'?'Video uploaded as a private draft. Preview it before publishing.':
        kind==='publish'?'Replacement video published successfully.':'Original video restored.');
      setFile(null);
      setPreviewVersion(n=>n+1);
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Video update failed.');}
    finally{setBusy(null);setUploadProgress(null);}
  };
  if(currentUser.role!=='super_admin')return <section role="alert" className="rounded-xl bg-white p-6">
    Website video management is restricted to the Super Administrator.
  </section>;
  return <section className="space-y-5">
    <div className="rounded-xl border border-[#e3d5e6] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#956a32]">Protected public website administration</p>
      <h2 className="mt-2 text-2xl font-bold text-[#35103b]">HIAU Website Video Library</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-700">
        Manage videos on public degree pages and the homepage carousel. Add more homepage videos, upload an MP4, preview it privately,
        and publish it only when you approve. You can restore the original video at any time.
        Student records and ERP academic operations are not affected.
      </p>
    </div>
    <div className="rounded-xl border border-purple-200 bg-white p-5 space-y-3">
      <h3 className="font-bold text-[#35103b]">Add another homepage video</h3>
      <p className="text-sm text-slate-600">Keep the campus and classroom videos, and add up to ten more clips. New videos stay unpublished until you approve them.</p>
      <div className="flex flex-wrap gap-3">
        <input aria-label="Additional homepage video title" maxLength={100} value={newHeroTitle}
          onChange={e=>setNewHeroTitle(e.target.value)} placeholder="Video title"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 p-2 text-sm"/>
        <button type="button" disabled={!newHeroTitle.trim()||!!busy||extras.length>=10}
          onClick={()=>void createHero()} className="rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
          Add as draft
        </button>
      </div>
      {extras.length>=10&&<p className="text-xs text-amber-800">Maximum of ten additional homepage videos reached.</p>}
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="rounded-xl border border-[#e3d5e6] bg-white p-4">
        <h3 className="mb-3 font-semibold text-[#35103b]">Select a public video</h3>
        <div className="max-h-[520px] space-y-2 overflow-y-auto">
          {slots.map(item=><button type="button" key={item.slot}
            onClick={()=>{setSelected(item.slot);setFile(null);setError('');setMessage('');}}
            aria-current={selected===item.slot?'true':undefined}
            className={`block w-full rounded-lg border p-3 text-left text-sm ${selected===item.slot?'border-[#4a1249] bg-[#faf2fb]':'border-slate-200 hover:bg-slate-50'}`}>
            <span className="block font-semibold text-[#35103b]">{item.label}</span>
            <span className="mt-1 block text-xs text-slate-600">{item.published?'Custom published video':'Original video'}{item.draft?' · Unpublished draft':''}</span>
          </button>)}
        </div>
      </div>
      <div className="space-y-4 rounded-xl border border-[#e3d5e6] bg-white p-5">
        {!active?<p className="text-sm text-slate-600">Choose a video to manage.</p>:<>
          <h3 className="text-lg font-bold text-[#35103b]">{active.label}</h3>
          <p className="text-sm text-slate-600">
            {active.published?'Custom version '+active.version+' is publicly visible.':'Currently using the original HIAU video.'}
          </p>
          <div className="overflow-hidden rounded-xl bg-[#2a082c]">
            <video key={active.slot+'-'+previewVersion} controls preload="metadata" playsInline className="aspect-video w-full object-contain"
              aria-label={'Preview for '+active.label} src={active.draft?active.previewSrc+'?v='+previewVersion:active.publicSrc+'?v='+previewVersion}/>
          </div>
          {active.draft&&<p className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-4 w-4"/>Private draft ready to review — not yet visible to visitors.
          </p>}
          <label className="block text-sm font-semibold text-[#35103b]" htmlFor="hiau-admin-video-file">Replacement MP4 (maximum 50 MB)</label>
          <input id="hiau-admin-video-file" type="file" accept="video/mp4,.mp4"
            onChange={e=>setFile(e.target.files?.[0]||null)}
            className="block w-full rounded-lg border border-slate-300 p-2 text-sm"/>
          {file&&<p className="text-xs text-slate-600">Selected: {file.name} ({(file.size/1024/1024).toFixed(1)} MB)</p>}
          {active.slot.startsWith('hero-extra-')&&<div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy||extras.findIndex(v=>v.slot===active.slot)===0}
              onClick={()=>void moveHero(-1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Move up</button>
            <button type="button" disabled={!!busy||extras.findIndex(v=>v.slot===active.slot)===extras.length-1}
              onClick={()=>void moveHero(1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Move down</button>
            <button type="button" disabled={!!busy} onClick={()=>void removeHero()}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-800 disabled:opacity-40">Remove extra video</button>
          </div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!file||!!busy} onClick={()=>void run('upload')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Upload className="h-4 w-4"/>Upload private draft
            </button>
            <button type="button" disabled={!active.draft||!!busy} onClick={()=>void run('publish')}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-900 disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4"/>Publish replacement
            </button>
            <button type="button" disabled={(!active.draft&&!active.published)||!!busy} onClick={()=>void run('restore')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#35103b] disabled:opacity-50">
              <RotateCcw className="h-4 w-4"/>Restore original
            </button>
          </div>
          {uploadProgress!==null&&<div role="status" className="text-sm text-[#4a1249] font-semibold">
            Uploading securely in small parts: {uploadProgress}%
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-purple-100">
              <div className="h-full bg-[#4a1249]" style={{width:uploadProgress+'%'}}/>
            </div>
          </div>}
          {message&&<p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
          {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <p className="flex items-start gap-2 text-xs text-slate-600">
            <PlayCircle className="mt-0.5 h-4 w-4 shrink-0"/>
            Preview first and confirm picture and narration. Uploading alone never publishes a video.
          </p>
        </>}
      </div>
    </div>
  </section>;
};
