import React,{useEffect,useState} from 'react';
type Kind='news'|'event'|'announcement';
type Audience='general'|'faculty'|'students'|'press';
type Media={id:string;kind:'image'|'video'|'youtube';caption:string;alt:string;mime:string;bytes:number;createdAt:string;youtubeId?:string};
type Item={id:string;kind:Kind;audience?:Audience;title:string;summary:string;eventDate:string;location:string;verified:boolean;
  status:'draft'|'published';updatedAt:string;scheduledAt?:string;media?:Media[];live?:{media?:Media[]}};
type Form={kind:Kind;audience:Audience;title:string;summary:string;eventDate:string;location:string;verified:boolean};
const blank:Form={kind:'news',audience:'general',title:'',summary:'',eventDate:'',location:'',verified:false};
const fill=(item:Item):Form=>({kind:item.kind,audience:item.audience||'general',title:item.title,summary:item.summary,eventDate:item.eventDate,location:item.location,verified:item.verified});
const parse=async(response:Response)=>{const data=await response.json().catch(()=>({error:'Unexpected server response'}));if(!response.ok)throw new Error(data.error||'Request failed');return data;};
const request=async(url:string,method:string,body:object)=>parse(await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
const mediaPreview=(id:string,mediaId:string)=>'/api/admin/news-events/'+id+'/media/'+mediaId;
const mediaTypes=['image/png','image/jpeg','image/webp','video/mp4'];
export const WebsiteNewsEventsConsole:React.FC<{currentUser:{role:string}}>=({currentUser})=>{
 const [items,setItems]=useState<Item[]>([]),[activeId,setActiveId]=useState(''),[draft,setDraft]=useState<Form>(blank);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [publishTime,setPublishTime]=useState(''),[caption,setCaption]=useState(''),[alt,setAlt]=useState(''),[youtubeUrl,setYoutubeUrl]=useState('');
 const isAuthor=['super_admin','website_editor'].includes(currentUser.role);
 const isReviewer=['super_admin','website_reviewer'].includes(currentUser.role);
 const refresh=async()=>{const result=await parse(await fetch('/api/admin/news-events',{credentials:'same-origin',cache:'no-store'}));setItems(result.items||[]);};
 useEffect(()=>{void refresh().catch(e=>setError(e.message));},[]);
 const active=items.find(x=>x.id===activeId);
 const select=(item:Item)=>{setActiveId(item.id);setDraft(fill(item));setError('');setMessage('');};
 const act=async(kind:'save'|'approve'|'schedule'|'publish'|'unpublish'|'delete')=>{
  if(busy||(kind==='save'?!isAuthor:!isReviewer))return;
  if(kind==='delete'&&!window.confirm('Permanently delete this item and all uploaded media? To remove it from the public site but keep it as a draft, choose Unpublish instead.'))return;
  setBusy(true);setError('');setMessage('');
  try{
    let result:{item:Item}|null=null;
    if(kind==='save')result=await request(active?'/api/admin/news-events/'+active.id:'/api/admin/news-events',active?'PUT':'POST',draft);
    else if(active){
      const suffix=kind==='delete'?'':kind==='publish'||kind==='unpublish'?'/publish':'/'+kind;
      const body=kind==='delete'?{confirmation:'DELETE_NEWS_EVENT'}:kind==='schedule'
        ? {publishAt:new Date(publishTime).toISOString()}:kind==='approve'?{}:{published:kind==='publish'};
      result=await request('/api/admin/news-events/'+active.id+suffix,kind==='delete'?'DELETE':'POST',body);
    }
    if(kind==='delete'){setActiveId('');setDraft(blank);}
    else if(result){setActiveId(result.item.id);setDraft(fill(result.item));}
    await refresh();setMessage(kind==='save'?'Saved as a private draft.':kind==='delete'?'Item deleted.':kind==='approve'?'Draft approved.':kind==='schedule'?'Approved draft scheduled.':kind==='publish'?'Published on the public site.':'Unpublished.');
  }catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}
 };
 const upload=async(file:File)=>{
   if(!active||!isAuthor||busy)return;
   if(!mediaTypes.includes(file.type)){setError('Use PNG, JPEG, WebP images or MP4 videos.');return;}
   const isVideo=file.type==='video/mp4',max=isVideo?24_000_000:8_000_000;
   if(file.size>max){setError(isVideo?'MP4 must be below 24 MB.':'Image must be below 8 MB.');return;}
   if(!caption.trim()||!alt.trim()){setError('Enter a factual caption and accessible alternative text before uploading.');return;}
   setBusy(true);setError('');setMessage('');
   try{
     const base64=await new Promise<string>((resolve,reject)=>{
       const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');
       reader.onerror=()=>reject(new Error('Could not read file'));reader.readAsDataURL(file);
     });
     const data=await request('/api/admin/news-events/'+active.id+'/media','POST',{
       kind:isVideo?'video':'image',base64,caption:caption.trim(),alt:alt.trim()
     });
     await refresh();setDraft(fill(data.item));setCaption('');setAlt('');
     setMessage('Media uploaded privately. A reviewer must approve the revised story before it is public.');
   }catch(e){setError(e instanceof Error?e.message:'Upload failed');}finally{setBusy(false);}
 };
 const addYoutube=async()=>{
   if(!active||!isAuthor||busy||!youtubeUrl.trim()||!caption.trim()||!alt.trim())return;
   setBusy(true);setError('');setMessage('');
   try{
     const data=await request('/api/admin/news-events/'+active.id+'/youtube','POST',{
       url:youtubeUrl,caption:caption.trim(),alt:alt.trim()
     });
     await refresh();setDraft(fill(data.item));setYoutubeUrl('');setCaption('');setAlt('');
     setMessage('YouTube video linked privately. Reviewer approval is required before publication.');
   }catch(e){setError(e instanceof Error?e.message:'Could not attach YouTube video');}finally{setBusy(false);}
 };
 const updateMedia=async(media:Media)=>{
   if(!active||!isAuthor||busy)return;
   const nextCaption=window.prompt('Photo/video caption:',media.caption);
   if(nextCaption===null)return;
   const nextAlt=window.prompt('Accessible media description:',media.alt);
   if(nextAlt===null)return;
   setBusy(true);setError('');try{
     await request('/api/admin/news-events/'+active.id+'/media/'+media.id,'PUT',{caption:nextCaption,alt:nextAlt});
     await refresh();setMessage('Media details saved as an unapproved draft.');
   }catch(e){setError(e instanceof Error?e.message:'Edit failed');}finally{setBusy(false);}
 };
 const removeMedia=async(media:Media)=>{
   if(!active||!isAuthor||busy||!window.confirm('Remove this media from the draft gallery? The published story will remain unchanged until a reviewer approves the update.'))return;
   setBusy(true);setError('');try{
     await request('/api/admin/news-events/'+active.id+'/media/'+media.id,'DELETE',{confirmation:'REMOVE_MEDIA_FROM_DRAFT'});
     await refresh();setMessage('Media removed from draft.');
   }catch(e){setError(e instanceof Error?e.message:'Removal failed');}finally{setBusy(false);}
 };
 const shift=async(index:number,direction:number)=>{
   if(!active||!isAuthor||busy||!active.media)return;
   const next=[...active.media];const to=index+direction;
   if(to<0||to>=next.length)return;
   [next[index],next[to]]=[next[to],next[index]];
   setBusy(true);setError('');try{
     await request('/api/admin/news-events/'+active.id+'/media-order','POST',{ids:next.map(m=>m.id)});
     await refresh();setMessage('Gallery order saved as draft. First image is the featured image.');
   }catch(e){setError(e instanceof Error?e.message:'Could not reorder');}finally{setBusy(false);}
 };
 if(!isAuthor&&!isReviewer)return <p role="alert">Website news requires an authorized editor or reviewer.</p>;
 return <section className="rounded-xl border bg-white p-5 text-slate-800">
  <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold text-[#4A1249]">Website News & Events</h2>
   <p className="mt-1 text-sm text-slate-600">Publish verified university news with photographs, galleries and videos. Actual HIAU media must have approved captions and usage rights.</p></div>
   <button type="button" disabled={!isAuthor} onClick={()=>{setActiveId('');setDraft(blank);setMessage('');setError('');}}
    className="hiau-brand-action rounded bg-[#4A1249] px-4 py-2 font-bold text-white disabled:opacity-50">+ New announcement</button></div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {message&&<p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,1fr)_minmax(0,1.7fr)]">
   <div className="space-y-2">{items.map(item=><button key={item.id} type="button" onClick={()=>select(item)}
     className="block w-full rounded border p-3 text-left text-sm hover:bg-purple-50 focus-visible:outline-2">
     <strong className="block">{item.title}</strong><span className="text-xs capitalize text-slate-500">{item.kind} · {item.status} · {item.media?.length||0} media</span>
     </button>)}{!items.length&&<p className="text-sm text-slate-500">No announcements yet.</p>}</div>
   <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="block text-sm font-semibold">Content category<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value as Kind,verified:false})} className="mt-1 w-full rounded border p-2">
      <option value="news">News</option><option value="event">Event</option><option value="announcement">Announcement</option></select></label>
     <label className="block text-sm font-semibold">Newsroom destination<select value={draft.audience} onChange={e=>setDraft({...draft,audience:e.target.value as Audience,verified:false})} className="mt-1 w-full rounded border p-2">
      <option value="general">University Newsroom</option><option value="faculty">Faculty & Staff News</option><option value="students">Student News & Achievements</option><option value="press">Press Releases & Media</option></select></label>
    </div>
    <label className="block text-sm font-semibold">Title<input maxLength={130} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <label className="block text-sm font-semibold">Article or event summary<textarea rows={5} maxLength={1800} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="block text-sm font-semibold">Event date {draft.kind==='event'?'(required)':'(optional)'}<input type="date" value={draft.eventDate} onChange={e=>setDraft({...draft,eventDate:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
     <label className="block text-sm font-semibold">Location (optional)<input maxLength={140} value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value,verified:false})} className="mt-1 w-full rounded border p-2"/></label>
    </div>
    <section className="space-y-3 rounded-lg border border-purple-200 p-4" aria-label="News gallery media">
     <h3 className="font-bold text-[#4A1249]">Photos & Videos</h3>
     {!active?<p className="text-sm text-slate-600">Save the news draft first, then upload HIAU photographs and videos here.</p>:<>
      <p className="text-xs text-slate-600">Gallery: up to 12 media files per story. PNG/JPEG/WebP below 8 MB or MP4 below 24 MB. The first image will be used as the featured photograph.</p>
      {isAuthor&&<div className="grid gap-3">
       <label className="text-sm font-semibold">Caption<input maxLength={240} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Describe the documented activity" className="mt-1 w-full rounded border p-2"/></label>
       <label className="text-sm font-semibold">Accessible alternative text<input maxLength={240} value={alt} onChange={e=>setAlt(e.target.value)} placeholder="What does the image show?" className="mt-1 w-full rounded border p-2"/></label>
       <label className="text-sm font-semibold">Or link HIAU YouTube video
         <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)}
           placeholder="https://www.youtube.com/watch?v=nmlg7uHvJy4" className="mt-1 w-full rounded border p-2"/>
       </label>
       <button type="button" disabled={busy||!youtubeUrl||!caption||!alt} onClick={()=>void addYoutube()}
         className="rounded border border-[#4A1249] px-4 py-2 text-sm font-semibold disabled:opacity-50">
         Attach YouTube video to draft
       </button>
       <label className="text-sm font-semibold">Upload image or video
         <input type="file" accept=".png,.jpg,.jpeg,.webp,.mp4,image/png,image/jpeg,image/webp,video/mp4" disabled={busy}
           onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void upload(file);e.currentTarget.value='';}}
           className="mt-1 block w-full rounded border p-2 text-xs"/>
       </label>
      </div>}
      <div className="grid gap-3 sm:grid-cols-2">{(active.media||[]).map((media,index)=><div key={media.id} className="rounded-lg border p-3">
       {media.kind==='image'?<img loading="lazy" src={mediaPreview(active.id,media.id)} alt={media.alt} className="aspect-video w-full rounded object-cover"/>:
        media.kind==='youtube'?<iframe src={'https://www.youtube-nocookie.com/embed/'+media.youtubeId}
          title={media.alt} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded"/>:
        <video src={mediaPreview(active.id,media.id)} controls preload="metadata" className="aspect-video w-full rounded bg-slate-900"/>}
       <p className="mt-2 text-sm font-medium">{media.caption}</p>
       <p className="text-xs text-slate-600">{media.kind} · {Math.round(media.bytes/1024)} KB {index===0&&media.kind==='image'?'· Featured':''}</p>
       {isAuthor&&<div className="mt-2 flex flex-wrap gap-2">
         <button type="button" disabled={busy||index===0} onClick={()=>void shift(index,-1)} className="rounded border px-2 py-1 text-xs">Move up</button>
         <button type="button" disabled={busy||index===(active.media||[]).length-1} onClick={()=>void shift(index,1)} className="rounded border px-2 py-1 text-xs">Move down</button>
         <button type="button" disabled={busy} onClick={()=>void updateMedia(media)} className="rounded border px-2 py-1 text-xs">Edit caption</button>
         <button type="button" disabled={busy} onClick={()=>void removeMedia(media)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">Remove</button>
       </div>}
      </div>)}</div>
      {!(active.media||[]).length&&<p className="text-xs text-slate-600">No files uploaded. Published articles can be text-only.</p>}
     </>}
    </section>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" disabled={!isAuthor} checked={draft.verified}
       onChange={e=>setDraft({...draft,verified:e.target.checked})}/>
       I confirm the information is accurate and photographs/videos have HIAU permission and truthful captions.</label>
    <div className="flex flex-wrap gap-2">
     <button disabled={busy||!isAuthor} onClick={()=>void act('save')} className="hiau-brand-action rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save draft</button>
     {active&&<>{isReviewer&&!active.verified&&<button disabled={busy} onClick={()=>void act('approve')} className="rounded border px-4 py-2 text-sm font-bold">Approve draft</button>}
     <button disabled={busy||!isReviewer||!active.verified} onClick={()=>void act('publish')} className="rounded border px-4 py-2 text-sm">Publish</button>
     <button disabled={busy||!isReviewer} onClick={()=>void act('unpublish')} className="rounded border px-4 py-2 text-sm">Unpublish</button>
     <button disabled={busy||!isReviewer} onClick={()=>void act('delete')} className="rounded border border-red-300 px-4 py-2 text-sm text-red-700">Delete</button></>}
    </div>
    {active?.scheduledAt&&<p role="status" className="text-sm text-[#4A1249]">Scheduled: {new Date(active.scheduledAt).toLocaleString()}</p>}
    {active&&isReviewer&&<div className="flex flex-wrap items-end gap-3">
     <label className="text-sm font-semibold">Publication time (local)
       <input type="datetime-local" value={publishTime} onChange={e=>setPublishTime(e.target.value)} className="mt-1 block rounded border p-2"/>
     </label>
     <button type="button" disabled={busy||!active.verified||!publishTime} onClick={()=>void act('schedule')}
       className="rounded border border-[#4A1249] px-4 py-2 text-sm font-semibold disabled:opacity-50">Schedule event or news</button>
    </div>}
   </div>
  </div>
 </section>;
};
