import React,{useEffect,useState} from 'react';
type Kind='news'|'event'|'announcement';
type Item={id:string;kind:Kind;title:string;summary:string;eventDate:string;location:string;verified:boolean;status:'draft'|'published';updatedAt:string};
const blank={kind:'news' as Kind,title:'',summary:'',eventDate:'',location:'',verified:false};
const parse=async(response:Response)=>{const data=await response.json().catch(()=>({error:'Unexpected server response'}));if(!response.ok)throw new Error(data.error||'Request failed');return data;};
const request=async(url:string,method:string,body:object)=>parse(await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
export const WebsiteNewsEventsConsole:React.FC<{currentUser:{role:string}}>=({currentUser})=>{
 const [items,setItems]=useState<Item[]>([]),[activeId,setActiveId]=useState(''),[draft,setDraft]=useState(blank);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const refresh=async()=>{const result=await parse(await fetch('/api/admin/news-events',{credentials:'same-origin',cache:'no-store'}));setItems(result.items||[]);};
 useEffect(()=>{void refresh().catch(e=>setError(e.message));},[]);
 const active=items.find(x=>x.id===activeId);
 const act=async(kind:'save'|'publish'|'unpublish'|'delete')=>{
  if(busy||currentUser.role!=='super_admin')return;
  if(kind==='delete'&&!window.confirm('Permanently delete this news or event item?'))return;
  setBusy(true);setError('');setMessage('');
  try{
    let result:{item:Item}|null=null;
    if(kind==='save')result=await request(active?'/api/admin/news-events/'+active.id:'/api/admin/news-events',active?'PUT':'POST',draft);
    else if(active)result=await request('/api/admin/news-events/'+active.id+(kind==='delete'?'':'/publish'),kind==='delete'?'DELETE':'POST',kind==='delete'?{confirmation:'DELETE_NEWS_EVENT'}:{published:kind==='publish'});
    if(kind==='delete'){setActiveId('');setDraft(blank);}
    else if(result){setActiveId(result.item.id);setDraft({kind:result.item.kind,title:result.item.title,summary:result.item.summary,eventDate:result.item.eventDate,location:result.item.location,verified:result.item.verified});}
    await refresh();setMessage(kind==='save'?'Saved to drafts. Verify before publishing.':kind==='delete'?'Item deleted.':kind==='publish'?'Published on the public site.':'Unpublished.');
  }catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}
 };
 if(currentUser.role!=='super_admin')return <p role="alert">Only the website super administrator can manage news and events.</p>;
 return <section className="rounded-xl border bg-white p-5">
  <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold text-[#4A1249]">Website News & Events</h2><p className="mt-1 text-sm text-slate-600">Draft, verify and publish announcements without changing academic calendar records.</p></div>
  <button type="button" onClick={()=>{setActiveId('');setDraft(blank);setMessage('');setError('');}} className="rounded bg-[#4A1249] px-4 py-2 font-bold text-white">+ New announcement</button></div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{message&&<p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,1fr)_minmax(0,1.7fr)]">
   <div className="space-y-2">{items.map(item=><button key={item.id} type="button" onClick={()=>{setActiveId(item.id);setDraft({kind:item.kind,title:item.title,summary:item.summary,eventDate:item.eventDate,location:item.location,verified:item.verified});}} className="block w-full rounded border p-3 text-left text-sm hover:bg-purple-50">
     <strong className="block">{item.title}</strong><span className="text-xs capitalize text-slate-500">{item.kind} · {item.status}</span></button>)}{!items.length&&<p className="text-sm text-slate-500">No announcements yet.</p>}</div>
   <div className="space-y-3">
    <label className="block text-sm font-semibold">Content category<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value as Kind,verified:false})} className="mt-1 w-full rounded border p-2"><option value="news">News</option><option value="event">Event</option><option value="announcement">Announcement</option></select></label>
    <label className="block text-sm font-semibold">Title<input value={draft.title} maxLength={130} onChange={e=>setDraft({...draft,title:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <label className="block text-sm font-semibold">Article or event summary<textarea value={draft.summary} rows={5} maxLength={1800} onChange={e=>setDraft({...draft,summary:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="block text-sm font-semibold">Event date {draft.kind==='event'?'(required)':'(optional)'}<input type="date" value={draft.eventDate} onChange={e=>setDraft({...draft,eventDate:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
     <label className="block text-sm font-semibold">Location (optional)<input value={draft.location} maxLength={140} onChange={e=>setDraft({...draft,location:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    </div>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.verified} onChange={e=>setDraft({...draft,verified:e.target.checked})}/> I have verified the event date and details and obtained publication approval.</label>
    <div className="flex flex-wrap gap-2">
     <button disabled={busy} onClick={()=>void act('save')} className="rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white">Save draft</button>
     {active&&<><button disabled={busy||!active.verified} onClick={()=>void act('publish')} className="rounded border px-4 py-2 text-sm">Publish</button><button disabled={busy} onClick={()=>void act('unpublish')} className="rounded border px-4 py-2 text-sm">Unpublish</button><button disabled={busy} onClick={()=>void act('delete')} className="rounded border border-red-300 px-4 py-2 text-sm text-red-700">Delete</button></>}
    </div>
   </div>
  </div>
 </section>;
};
