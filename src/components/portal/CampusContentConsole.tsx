import React,{useCallback,useEffect,useState} from 'react';
type Category='campus'|'facilities'|'community';
type Kind='photo'|'video'|'information';
type Entry={id:string;category:Category;kind:Kind;title:string;description:string;mediaUrl:string;verified:boolean;status:'draft'|'published';updatedAt:string};
const initial={category:'campus' as Category,kind:'information' as Kind,title:'',description:'',mediaUrl:'',verified:false};
type Form=typeof initial;
const parse=async(r:Response)=>{const data=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(data.error||'Request failed');return data;};
const send=async(url:string,method:string,body:object)=>parse(await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
export const CampusContentConsole:React.FC<{currentUser:{role:string};openVideoLibrary?:()=>void}>=({currentUser,openVideoLibrary})=>{
 const [items,setItems]=useState<Entry[]>([]),[selected,setSelected]=useState(''),[form,setForm]=useState<Form>(initial);
 const [message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{const data=await parse(await fetch('/api/admin/campus-content',{credentials:'same-origin',cache:'no-store'}));setItems(data.entries||[]);},[]);
 useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
 const active=items.find(x=>x.id===selected);
 const edit=(x:Entry)=>{setSelected(x.id);setForm({category:x.category,kind:x.kind,title:x.title,description:x.description,mediaUrl:x.kind==='photo'?'':x.mediaUrl,verified:x.verified});setMessage('');setError('');};
 const act=async(action:'save'|'publish'|'unpublish'|'delete')=>{
   if(busy||currentUser.role!=='super_admin')return;
   if(action==='delete'&&!window.confirm('Permanently delete this campus item and its uploaded photograph?'))return;
   setBusy(true);setMessage('');setError('');
   try{
     if(action==='save'){
       const data=await send(active?'/api/admin/campus-content/'+active.id:'/api/admin/campus-content',active?'PUT':'POST',form);
       setSelected(data.entry.id);await load();setMessage('Saved as a private draft. Publish only after verifying the details and media rights.');
     }else if(active){
       if(action==='delete'){await send('/api/admin/campus-content/'+active.id,'DELETE',{confirmation:'DELETE_CAMPUS_CONTENT'});setSelected('');setForm(initial);}
       else await send('/api/admin/campus-content/'+active.id+'/publish','POST',{published:action==='publish'});
       await load();setMessage(action==='delete'?'Campus item deleted.':action==='publish'?'Approved item published.':'Item unpublished.');
     }
   }catch(e){setError(e instanceof Error?e.message:'Action failed');}finally{setBusy(false);}
 };
 const photo=async(file:File)=>{
   if(!active||active.kind!=='photo'||busy)return;
   if(!['image/jpeg','image/png'].includes(file.type)||file.size>2_000_000){setError('Use JPEG or PNG under 2 MB.');return;}
   setBusy(true);setError('');try{
     const encoded=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Could not read image'));reader.readAsDataURL(file);});
     await send('/api/admin/campus-content/'+active.id+'/photo','POST',{imageBase64:encoded});
     await load();setMessage('Photograph uploaded. Recheck and publish the draft when approved.');
   }catch(e){setError(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}
 };
 if(currentUser.role!=='super_admin')return <p role="alert">Only the authorized website administrator can manage campus content.</p>;
 return <section className="space-y-5 rounded-xl bg-white p-5 text-slate-800">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div><h2 className="text-xl font-bold text-[#4A1249]">Campus & Community Content Manager</h2>
   <p className="mt-1 text-sm text-slate-600">Manage approved photos, campus details and video references. New items start as private drafts.</p></div>
   <button type="button" onClick={()=>{setSelected('');setForm(initial);setMessage('');setError('');}} className="rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white">+ New item</button>
  </div>
  {message&&<p role="status" className="rounded bg-green-50 p-3 text-sm text-green-900">{message}</p>}
  {error&&<p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-900">{error}</p>}
  <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.4fr)]">
   <div className="max-h-[650px] space-y-2 overflow-y-auto">
     {items.length===0&&<p className="text-sm text-slate-500">No items yet. Create a draft to begin.</p>}
     {items.map(item=><button key={item.id} type="button" onClick={()=>edit(item)}
       className={`w-full rounded-lg border p-3 text-left text-sm ${item.id===selected?'border-[#4A1249] bg-purple-50':'border-slate-200'}`}>
       <strong className="block">{item.title}</strong><span className="text-xs capitalize text-slate-600">{item.category} • {item.kind} • {item.status}</span>
     </button>)}
   </div>
   <div className="space-y-4 rounded-lg border border-slate-200 p-4">
     <div className="grid gap-3 sm:grid-cols-2">
       <label className="text-sm font-semibold">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})} className="mt-1 w-full rounded border p-2">
         <option value="campus">Campus Overview</option><option value="facilities">Facilities & Infrastructure</option><option value="community">Campus Life & Community</option></select></label>
       <label className="text-sm font-semibold">Content type<select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value as Kind,mediaUrl:''})} className="mt-1 w-full rounded border p-2">
         <option value="information">Information</option><option value="photo">Photograph</option><option value="video">Video</option></select></label>
     </div>
     <label className="block text-sm font-semibold">Title<input maxLength={120} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded border p-2"/></label>
     <label className="block text-sm font-semibold">Verified information / caption<textarea rows={5} maxLength={1800} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1 w-full rounded border p-2"/></label>
     {form.kind==='video'&&<div className="space-y-2">
       <label className="block text-sm font-semibold">Published video from Website Video Library
         <input placeholder="/api/public/video/hero-campus" value={form.mediaUrl} onChange={e=>setForm({...form,mediaUrl:e.target.value})} className="mt-1 w-full rounded border p-2"/>
       </label>
       <p className="text-xs text-slate-600">Use an approved HIAU video slot, such as /api/public/video/hero-campus or /api/public/video/hero-classroom. Upload or replace actual MP4 files in Website Video Library first.</p>
       {openVideoLibrary&&<button type="button" onClick={openVideoLibrary} className="text-sm font-bold text-[#4A1249] underline">Open Website Video Library</button>}
     </div>}
     <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={e=>setForm({...form,verified:e.target.checked})}/>
       <span>I have verified these institutional details and have permission to publish the media.</span>
     </label>
     <div className="flex flex-wrap gap-2">
       <button type="button" disabled={busy} onClick={()=>void act('save')} className="rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save draft</button>
       {active&&<><button type="button" disabled={busy} onClick={()=>void act('publish')} className="rounded border border-[#4A1249] px-4 py-2 text-sm font-semibold">Publish</button>
         <button type="button" disabled={busy} onClick={()=>void act('unpublish')} className="rounded border px-4 py-2 text-sm">Unpublish</button>
         <button type="button" disabled={busy} onClick={()=>void act('delete')} className="rounded border border-red-300 px-4 py-2 text-sm text-red-700">Delete</button></>}
     </div>
     {active?.kind==='photo'&&<label className="block rounded-lg border-2 border-dashed p-4 text-sm font-semibold">Upload / replace official photograph (JPEG or PNG, max 2 MB)
       <input type="file" accept="image/png,image/jpeg" onChange={e=>{const file=e.target.files?.[0];if(file)void photo(file);}} className="mt-2 block w-full text-xs"/>
     </label>}
     {active?.kind==='photo'&&<img alt="Current content photograph" src={active.mediaUrl} className="max-h-48 w-auto rounded object-contain" onError={e=>{e.currentTarget.style.display='none';}}/>}
   </div>
  </div>
 </section>;
};
