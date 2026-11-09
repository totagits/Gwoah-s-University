import React,{useCallback,useEffect,useState} from 'react';
import {Upload,CheckCircle2,RotateCcw,PlayCircle,AlertTriangle} from 'lucide-react';

type VideoSlot={
  slot:string;label:string;defaultSrc:string;previewSrc:string;publicSrc:string;
  version:number;draft?:string;published?:string;updatedAt?:string;
};
type RoleProps={currentUser:{role:string}};

export const WebsiteVideoLibrary:React.FC<RoleProps>=({currentUser})=>{
  const [slots,setSlots]=useState<VideoSlot[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [selected,setSelected]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [previewVersion,setPreviewVersion]=useState(0);
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
      const response=await fetch(kind==='upload'?url:kind==='publish'?url+'/publish':url,{
        method:kind==='upload'?'PUT':kind==='publish'?'POST':'DELETE',
        headers:kind==='upload'?{'Content-Type':'video/mp4'}:{'Content-Type':'application/json'},
        body:kind==='upload'?file!:JSON.stringify({
          confirmation:kind==='publish'?'PUBLISH_WEBSITE_VIDEO':'RESTORE_DEFAULT_WEBSITE_VIDEO',
        }),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'The video update was not saved.');
      setMessage(kind==='upload'?'Video uploaded as a private draft. Preview it before publishing.':
        kind==='publish'?'Replacement video published successfully.':'Original video restored.');
      setFile(null);
      setPreviewVersion(n=>n+1);
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Video update failed.');}
    finally{setBusy(null);}
  };
  if(currentUser.role!=='super_admin')return <section role="alert" className="rounded-xl bg-white p-6">
    Website video management is restricted to the Super Administrator.
  </section>;
  return <section className="space-y-5">
    <div className="rounded-xl border border-[#e3d5e6] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#956a32]">Protected public website administration</p>
      <h2 className="mt-2 text-2xl font-bold text-[#35103b]">HIAU Website Video Library</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-700">
        Manage videos on public degree pages and the two homepage carousel slots. Upload an MP4, preview it privately,
        and publish it only when you approve. You can restore the original video at any time.
        Student records and ERP academic operations are not affected.
      </p>
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
