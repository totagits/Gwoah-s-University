import React,{useCallback,useEffect,useState} from 'react';
import {ImagePlus,Save,Plus,RefreshCcw,Globe,EyeOff,Trash2} from 'lucide-react';

type Category='executive'|'trustee'|'faculty';
type RecordEntry={id:string;name:string;title:string;biography:string;category:Category;status:'draft'|'published';image:string;updatedAt:string};
const empty={name:'',title:'',biography:'',category:'faculty' as Category};
const parse=async(r:Response)=>{
  const data=await r.json().catch(()=>({error:'Unexpected server response'}));
  if(!r.ok)throw new Error(data.error||'Request failed');
  return data;
};
const csrf=()=>document.cookie.match(/(?:^|; )csrf=([^;]+)/)?.[1]||'';
const request=async(url:string,method:string,body:object)=>{
  // Use the CSRF value managed by the authenticated session, never an anonymous public request.
  const {getSessionCsrf}=await import('../../services/session');
  return parse(await fetch(url,{method,credentials:'same-origin',
    headers:{'Content-Type':'application/json','x-csrf-token':getSessionCsrf()},body:JSON.stringify(body)}));
};
export const WebsiteStaffProfiles:React.FC<{currentUser:{role:string}}>=({currentUser})=>{
  const [records,setRecords]=useState<RecordEntry[]>([]);
  const [selected,setSelected]=useState('');
  const [form,setForm]=useState(empty);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const load=useCallback(async()=>{
    const data=await parse(await fetch('/api/admin/public-staff',{credentials:'same-origin',cache:'no-store'}));
    setRecords(data.profiles||[]);
  },[]);
  useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
  const active=records.find(p=>p.id===selected);
  const edit=(entry:RecordEntry)=>{
    setSelected(entry.id);setForm({name:entry.name,title:entry.title,category:entry.category,biography:entry.biography});
    setMessage('');setError('');
  };
  const act=async(kind:'save'|'publish'|'unpublish'|'delete',file?:File)=>{
    if(busy||currentUser.role!=='super_admin')return;
    setBusy(true);setError('');setMessage('');
    try{
      if(kind==='save'){
        const url=active?'/api/admin/public-staff/'+active.id:'/api/admin/public-staff';
        const data=await request(url,active?'PUT':'POST',form);
        await load();setSelected(data.profile.id);
        setMessage('Profile draft saved. Only published records appear on the website.');
      }else if(kind==='delete'&&active){
        if(!window.confirm('Permanently remove this public profile?'))return;
        await request('/api/admin/public-staff/'+active.id,'DELETE',{confirmation:'DELETE_PUBLIC_PROFILE'});
        setSelected('');setForm(empty);await load();setMessage('Public profile removed.');
      }else if(active){
        await request('/api/admin/public-staff/'+active.id+'/publish','POST',{published:kind==='publish'});
        await load();setMessage(kind==='publish'?'Profile published to public directory.':'Profile unpublished.');
      }
    }catch(e){setError(e instanceof Error?e.message:'Unable to update profile');}
    finally{setBusy(false);}
  };
  const upload=async(file:File)=>{
    if(!active||busy)return;
    if(!['image/jpeg','image/png'].includes(file.type)||file.size>2_000_000){
      setError('Choose a JPEG or PNG photograph smaller than 2 MB.');return;
    }
    setBusy(true);setError('');setMessage('');
    try{
      const encoded=await new Promise<string>((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');
        reader.onerror=()=>reject(new Error('Could not read photograph'));
        reader.readAsDataURL(file);
      });
      await request('/api/admin/public-staff/'+active.id+'/photo','POST',{imageBase64:encoded});
      await load();setMessage('Photograph saved. Review the image and publish when approved.');
    }catch(e){setError(e instanceof Error?e.message:'Upload failed');}
    finally{setBusy(false);}
  };
  if(currentUser.role!=='super_admin')return <p role="alert">This page requires the website administrator role.</p>;
  return <section className="space-y-6">
    <div className="rounded-xl border border-[#E4D9E6] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#4A1249]">Public Leadership & Staff Profiles</h2>
          <p className="mt-1 text-sm text-slate-600">Add, edit, upload a portrait, and publish public staff biographies. Private HR records remain separate.</p>
        </div>
        <button type="button" onClick={()=>{setSelected('');setForm(empty);setMessage('');setError('');}}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 font-semibold text-white"><Plus className="h-4 w-4"/>New staff profile</button>
      </div>
      {error&&<p role="alert" className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {message&&<p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)]">
      <aside className="rounded-xl border border-[#E4D9E6] bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-[#4A1249]">Profiles ({records.length})</h3>
          <button type="button" onClick={()=>void load()} aria-label="Refresh staff profiles"><RefreshCcw className="h-4 w-4"/></button></div>
        <div className="space-y-2">
          {records.length===0&&<p className="text-sm text-slate-600">No administrator-created profiles yet. The existing published leadership remains unchanged.</p>}
          {records.map(p=><button key={p.id} type="button" onClick={()=>edit(p)}
            className={`block w-full rounded-md border p-3 text-left text-sm ${selected===p.id?'border-[#4A1249] bg-[#F7F0F7]':'border-[#E4D9E6] hover:bg-[#F7F0F7]'}`}>
            <span className="block font-semibold text-[#4A1249]">{p.name}</span>
            <span className="mt-1 block text-xs text-slate-600">{p.title} · {p.status}</span>
          </button>)}
        </div>
      </aside>
      <div className="space-y-4 rounded-xl border border-[#E4D9E6] bg-white p-5 sm:p-7">
        <h3 className="font-semibold text-[#4A1249]">{active?'Edit public profile':'New public profile draft'}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#4A1249]">Full professional name
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              maxLength={120} className="mt-1 w-full rounded-md border border-slate-300 p-2 text-slate-900"/></label>
          <label className="text-sm font-semibold text-[#4A1249]">Office or title
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              maxLength={140} className="mt-1 w-full rounded-md border border-slate-300 p-2 text-slate-900"/></label>
        </div>
        <label className="block text-sm font-semibold text-[#4A1249]">Public directory category
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as Category}))}
            className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-900">
            <option value="executive">Executive leadership</option><option value="trustee">Board of trustees</option><option value="faculty">Faculty & staff</option>
          </select></label>
        <label className="block text-sm font-semibold text-[#4A1249]">Approved public biography
          <textarea value={form.biography} onChange={e=>setForm(f=>({...f,biography:e.target.value}))}
            rows={5} maxLength={3000} className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-900"/>
        </label>
        <button type="button" disabled={busy} onClick={()=>void act('save')}
          className="inline-flex items-center gap-2 rounded-md bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Save className="h-4 w-4"/>Save {active?'changes':'draft'}</button>
        {active&&<div className="space-y-4 border-t border-slate-200 pt-5">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D9CADC] px-4 py-2 text-sm font-semibold text-[#4A1249]">
            <ImagePlus className="h-4 w-4"/>Upload approved portrait (JPEG/PNG, max 2 MB)
            <input type="file" accept="image/png,image/jpeg" className="sr-only" disabled={busy}
              onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value='';}}/>
          </label>
          <img src={'/api/admin/public-staff/'+active.id+'/photo?v='+encodeURIComponent(active.updatedAt)}
            alt={`Preview of ${active.name}`} className="h-44 w-36 rounded-md border object-cover object-top"
            onError={event=>{event.currentTarget.style.display='none';}}/>
          <p className="text-xs text-slate-600">Only publish with university approval of the appointment, biography and photograph rights.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={()=>void act(active.status==='published'?'unpublish':'publish')}
              className="inline-flex items-center gap-2 rounded-md bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {active.status==='published'?<EyeOff className="h-4 w-4"/>:<Globe className="h-4 w-4"/>}
              {active.status==='published'?'Unpublish':'Publish to website'}
            </button>
            <button type="button" disabled={busy} onClick={()=>void act('delete')}
              className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">
              <Trash2 className="h-4 w-4"/>Remove profile</button>
          </div>
        </div>}
      </div>
    </div>
  </section>;
};
