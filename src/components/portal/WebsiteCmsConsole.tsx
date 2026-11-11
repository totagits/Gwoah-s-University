import React,{useCallback,useEffect,useState} from 'react';
type Section='home'|'about'|'academics'|'admissions'|'events'|'student-life'|'footer';
type Content={section:Section;title:string;body:string;verified:boolean;slot?:string};
type Revision={revision:number;at:string;actor:string;action:string;content:Content|null};
type Item={id:string;draft:Content|null;published:Content|null;revision:number;history:Revision[];archived:boolean;updatedAt:string};
const blank:Content={section:'home',title:'',body:'',verified:false,slot:''};
const sections:Section[]=['home','about','academics','admissions','events','student-life','footer'];
const slots:Record<Section,Array<{id:string;label:string}>>={
 home:[{id:'hero-heading',label:'Homepage hero heading'},{id:'hero-description',label:'Homepage introduction'}],
 about:[{id:'page-heading',label:'About page heading'},{id:'page-description',label:'About introduction'}],
 academics:[{id:'page-heading',label:'Academics page heading'},{id:'page-description',label:'Academics introduction'}],
 admissions:[{id:'page-heading',label:'Admissions page heading'},{id:'page-description',label:'Admissions introduction'}],
 events:[],'student-life':[],footer:[]
};
const parse=async(res:Response)=>{const data=await res.json().catch(()=>({error:'Unexpected response'}));if(!res.ok)throw new Error(data.error||'Request failed');return data;};
const post=async(url:string,method:string,body:object)=>parse(await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
export const WebsiteCmsConsole:React.FC<{currentUser:{role:string};openModule:(id:string)=>void}>=({currentUser,openModule})=>{
 const [items,setItems]=useState<Item[]>([]),[selected,setSelected]=useState(''),[draft,setDraft]=useState<Content>(blank);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const reload=useCallback(async()=>{const data=await parse(await fetch('/api/admin/site-content',{credentials:'same-origin',cache:'no-store'}));setItems(data.items||[]);},[]);
 useEffect(()=>{void reload().catch(e=>setError(e.message));},[reload]);
 const current=items.find(x=>x.id===selected);
 const choose=(item:Item)=>{setSelected(item.id);setDraft(item.draft||item.published||blank);setError('');setMessage('');};
 const execute=async(kind:'save'|'publish'|'unpublish'|'archive'|'restore',revision?:number)=>{
   if(busy||currentUser.role!=='super_admin')return;
   if(kind==='archive'&&!window.confirm('Archive this content and remove it from the public site?'))return;
   setBusy(true);setError('');setMessage('');
   try{
     const id=current?.id;
     let data:{item:Item};
     if(kind==='save')data=await post(id?'/api/admin/site-content/'+id:'/api/admin/site-content',id?'PUT':'POST',id?{...draft,expectedRevision:current!.revision}:draft);
     else if(!id)throw new Error('Select an existing content item.');
     else if(kind==='restore')data=await post('/api/admin/site-content/'+id+'/restore','POST',{revision,expectedRevision:current!.revision});
     else if(kind==='archive')data=await post('/api/admin/site-content/'+id,'DELETE',{confirmation:'ARCHIVE_SITE_CONTENT',expectedRevision:current!.revision});
     else data=await post('/api/admin/site-content/'+id+'/'+kind,'POST',{expectedRevision:current!.revision});
     await reload();
     if(kind==='archive'){setSelected('');setDraft(blank);}
     else{setSelected(data.item.id);setDraft(data.item.draft||data.item.published||blank);}
     setMessage(kind==='save'?'Private draft saved. Published text is unchanged until approved.':kind==='restore'?'Historical revision restored as an unverified draft.':kind==='publish'?'Verified content published.':kind==='unpublish'?'Content unpublished.':'Content archived.');
   }catch(e){setError(e instanceof Error?e.message:'Could not complete action');}
   finally{setBusy(false);}
 };
 if(currentUser.role!=='super_admin')return <p role="alert">Website CMS requires super administrator authorization.</p>;
 return <section className="space-y-6 text-slate-800">
  <div className="rounded-xl border border-[#e5dce8] bg-white p-5">
   <h2 className="text-2xl font-bold text-[#4A1249]">Enterprise Website Content Management</h2>
   <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create and update public content without GitHub edits. Draft changes remain private until verified and published. Existing institutional text and design are preserved unless explicitly migrated.</p>
   <div className="mt-5 grid gap-3 sm:grid-cols-3">
    {[{id:'website_media',name:'Photos & Videos',detail:'Managed video library'},{id:'website_staff',name:'Leadership & Staff',detail:'Profile publishing'},{id:'campus_content',name:'Campus & Facilities',detail:'Photos, details and stories'}].map(link=>
      <button key={link.id} type="button" onClick={()=>openModule(link.id)} className="rounded-lg border border-purple-200 p-4 text-left hover:bg-purple-50 focus-visible:outline-2">
       <strong className="block text-[#4A1249]">{link.name}</strong><span className="text-xs text-slate-600">{link.detail}</span>
      </button>)}
   </div>
  </div>
  <div className="grid gap-5 lg:grid-cols-[minmax(235px,0.85fr)_minmax(0,1.6fr)]">
   <aside className="rounded-xl border bg-white p-4">
    <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-[#4A1249]">Public Content</h3>
     <button type="button" className="rounded bg-[#4A1249] px-3 py-2 text-xs font-bold text-white" onClick={()=>{setSelected('');setDraft(blank);setError('');setMessage('');}}>+ New</button></div>
    <div className="mt-3 max-h-[500px] space-y-2 overflow-y-auto">
     {items.filter(x=>!x.archived).map(item=><button key={item.id} type="button" onClick={()=>choose(item)} className={`block w-full rounded border p-3 text-left text-sm ${item.id===selected?'border-[#4A1249] bg-purple-50':'border-slate-200'}`}>
       <strong className="block">{item.draft?.title||item.published?.title||'Untitled'}</strong>
       <span className="text-xs capitalize text-slate-500">{item.draft?.section||item.published?.section} · {item.published?'Published':'Unpublished'}{item.draft?' · Draft':''}</span>
     </button>)}
     {!items.some(x=>!x.archived)&&<p className="py-6 text-sm text-slate-600">No managed content yet. Create a new draft.</p>}
    </div>
   </aside>
   <div className="space-y-4 rounded-xl border bg-white p-5">
    {error&&<p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {message&&<p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    <label className="block text-sm font-semibold">Website section
      <select value={draft.section} onChange={e=>setDraft({...draft,section:e.target.value as Section,slot:'',verified:false})} className="mt-1 w-full rounded border p-2">
       {sections.map(s=><option key={s} value={s}>{s.replace('-', ' ')}</option>)}
      </select></label>
    <label className="block text-sm font-semibold">Placement on existing page (optional)
      <select value={draft.slot||''} onChange={e=>setDraft({...draft,slot:e.target.value,verified:false})}
        className="mt-1 w-full rounded border p-2">
        <option value="">Additional content block (does not replace existing text)</option>
        {slots[draft.section].map(slot=><option key={slot.id} value={slot.id}>{slot.label}</option>)}
      </select>
      <span className="mt-1 block text-xs font-normal text-slate-600">Selecting a page field lets approved content replace the existing wording in that location. Only one published item can occupy a field.</span>
    </label>
    <label className="block text-sm font-semibold">Headline
      <input maxLength={150} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <label className="block text-sm font-semibold">Public body text
      <textarea rows={9} maxLength={4000} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <div className="rounded-lg bg-[#FAF8FB] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#927139]">Preview — plain text only</p>
      <h3 className="mt-2 text-xl font-bold text-[#4A1249]">{draft.title||'Your heading appears here'}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{draft.body||'Your verified institutional text appears here.'}</p>
    </div>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.verified} onChange={e=>setDraft({...draft,verified:e.target.checked})}/>
     <span>I confirm this text is accurate, approved for public use, and does not disclose confidential information.</span></label>
    <div className="flex flex-wrap gap-2">
     <button type="button" disabled={busy} onClick={()=>void execute('save')} className="rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save private draft</button>
     {current&&<><button type="button" disabled={busy||!current.draft?.verified} onClick={()=>void execute('publish')} className="rounded border border-[#4A1249] px-4 py-2 text-sm font-bold">Publish verified draft</button>
      <button type="button" disabled={busy||!current.published} onClick={()=>void execute('unpublish')} className="rounded border px-4 py-2 text-sm">Unpublish</button>
      <button type="button" disabled={busy} onClick={()=>void execute('archive')} className="rounded border border-red-200 px-4 py-2 text-sm text-red-700">Archive</button></>}
    </div>
    {current?.published&&<p className="text-xs text-slate-600">The currently published revision stays live while a new draft is being edited.</p>}
    {!!current?.history.length&&<div className="border-t pt-4">
      <h3 className="font-bold">Revision history</h3>
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">{current.history.slice().reverse().map(row=>
       <div key={row.revision} className="flex items-center justify-between gap-2 text-xs">
        <span>#{row.revision} · {row.action} · {new Date(row.at).toLocaleString()}</span>
        {row.content&&<button type="button" disabled={busy} onClick={()=>void execute('restore',row.revision)} className="font-semibold text-[#4A1249] underline">Restore as draft</button>}
       </div>)}</div>
    </div>}
   </div>
  </div>
 </section>;
};
