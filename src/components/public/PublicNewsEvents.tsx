import React,{useEffect,useState} from 'react';
type Audience='general'|'faculty'|'students'|'press';
type Media={id:string;kind:'image'|'video'|'youtube';url:string;caption:string;alt:string;featured?:boolean};
type Entry={id:string;kind:'news'|'event'|'announcement';audience:Audience;title:string;summary:string;eventDate:string;location:string;
 status:'published';verified:boolean;publishedAt:string|null;media?:Media[]};
const tabs:Array<{key:'all'|Audience;label:string}>=[
 {key:'all',label:'All updates'},{key:'general',label:'University Newsroom'},{key:'faculty',label:'Faculty & Staff News'},
 {key:'students',label:'Student News & Achievements'},{key:'press',label:'Press Releases & Media'}];
const MediaView:React.FC<{media:Media;large?:boolean}>=({media,large=false})=>{
 if(media.kind==='image')return <img src={media.url} alt={media.alt} loading="lazy"
   className={large?'w-full rounded-lg object-contain':'aspect-video w-full rounded-t-lg object-cover'}/>;
 if(media.kind==='youtube')return <iframe src={media.url} title={media.alt}
   loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen
   referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded-lg"/>;
 return <video src={media.url} controls preload="metadata" className="aspect-video w-full rounded-lg bg-slate-900"/>;
};
export const PublicNewsEvents:React.FC=()=>{
 const [items,setItems]=useState<Entry[]>([]),[filter,setFilter]=useState<'all'|Audience>('all');
 const [expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>{let active=true;void fetch('/api/public/news-events',{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('News feed unavailable')))
  .then(data=>{if(active&&Array.isArray(data.items))setItems(data.items);})
  .catch(()=>{});return()=>{active=false;};},[]);
 useEffect(()=>{
   const onFilter=(event:Event)=>{const key=(event as CustomEvent<string>).detail;
     if(tabs.some(tab=>tab.key===key))setFilter(key as 'all'|Audience);
   };
   window.addEventListener('hiau:news-filter',onFilter);
   return()=>window.removeEventListener('hiau:news-filter',onFilter);
 },[]);
 // Keep the Newsroom destination visible even before the first approved story.
 const visible=items.filter(x=>filter==='all'||x.audience===filter);
 return <section id="hiau-news-events" className="scroll-mt-32 bg-white py-12" aria-label="HIAU Newsroom">
  <div className="mx-auto max-w-7xl px-5 sm:px-8">
   <p className="text-xs font-bold uppercase tracking-widest text-[#936a31]">University updates</p>
   <h2 className="mt-2 text-3xl font-bold text-[#4A1249]">HIAU Newsroom & Events</h2>
   <p className="mt-3 max-w-3xl text-sm text-slate-600">Official university stories, activities and event coverage are published here following institutional review.</p>
   <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Newsroom categories">
     {tabs.map(tab=><button key={tab.key} type="button" onClick={()=>{setFilter(tab.key);setExpanded(null);}}
       aria-pressed={filter===tab.key}
       className={`rounded-lg border px-3 py-2 text-xs font-semibold focus-visible:outline-2 ${filter===tab.key?'border-[#4A1249] bg-[#4A1249] text-white':'border-purple-200 bg-white text-[#4A1249]'}`}>
       {tab.label}
     </button>)}
   </div>
   {!visible.length?<p className="mt-8 rounded-xl border border-dashed border-purple-200 p-8 text-sm text-slate-600">No approved university stories are currently published in this category.</p>:
   <div className="mt-6 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
    {visible.map(item=>{
     const first=(item.media||[]).find(m=>m.kind==='image')||(item.media||[])[0];
     const featured=visible.length===1||expanded===item.id;
     return <article key={item.id}
       className={`min-w-0 overflow-hidden rounded-xl border border-purple-200 bg-[#FAF8FB] ${featured?'md:col-span-2 lg:col-span-3':''}`}>
      <div className={featured&&first?'grid items-start md:grid-cols-2':''}>
       {first&&<div className="min-w-0 overflow-hidden">
         {first.kind==='image'?<img src={first.url} alt={first.alt} loading="lazy"
           className="aspect-video w-full object-cover"/>:
           <MediaView media={first}/>}
       </div>}
       <div className={featured?'min-w-0 p-5 sm:p-7':'p-5'}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#956a32]">{item.kind}</p>
        <h3 className={`mt-2 font-bold text-[#4A1249] ${featured?'text-2xl':'text-lg'}`}>{item.title}</h3>
        {item.eventDate&&<p className="mt-2 text-xs font-semibold text-slate-700">Date: {item.eventDate}</p>}
        {item.location&&<p className="mt-1 text-xs text-slate-600">Location: {item.location}</p>}
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.summary}</p>
        {!!item.media?.length&&<button type="button" onClick={()=>setExpanded(expanded===item.id?null:item.id)}
           aria-expanded={expanded===item.id} aria-controls={'news-gallery-'+item.id}
           className="mt-4 rounded border border-[#4A1249] bg-white px-3 py-2 text-xs font-bold text-[#4A1249] focus-visible:outline-2">
           {expanded===item.id?'Hide media gallery':'View photos & videos'}
        </button>}
       </div>
      </div>
      {expanded===item.id&&<div id={'news-gallery-'+item.id}
         className="border-t border-purple-200 p-4 sm:p-6" aria-label={'Media gallery for '+item.title}>
        <h4 className="mb-4 text-lg font-bold text-[#4A1249]">Photos & videos</h4>
        <div className="grid items-start gap-5 md:grid-cols-2">
          {item.media?.map(media=><figure key={media.id} className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
            <MediaView media={media} large/>
            <figcaption className="mt-2 text-xs leading-5 text-slate-600">{media.caption}</figcaption>
          </figure>)}
        </div>
      </div>}
     </article>;
    })}
   </div>}
  </div>
 </section>;
};
