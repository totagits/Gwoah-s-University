import React,{useEffect,useState} from 'react';
type Entry={id:string;kind:'news'|'event'|'announcement';title:string;summary:string;eventDate:string;location:string;status:'published';verified:boolean;publishedAt:string|null};
export const PublicNewsEvents:React.FC=()=>{
 const [items,setItems]=useState<Entry[]>([]);
 useEffect(()=>{let active=true;void fetch('/api/public/news-events',{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('News feed unavailable')))
  .then(data=>{if(active&&Array.isArray(data.items))setItems(data.items);})
  .catch(()=>{});return()=>{active=false;};},[]);
 if(!items.length)return null;
 return <section id="hiau-news-events" className="scroll-mt-32 bg-white py-12" aria-label="HIAU News and Events">
  <div className="mx-auto max-w-7xl px-5 sm:px-8">
   <p className="text-xs font-bold uppercase tracking-widest text-[#936a31]">University updates</p>
   <h2 className="mt-2 text-3xl font-bold text-[#4A1249]">News, announcements and upcoming events</h2>
   <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {items.map(item=><article key={item.id} className="rounded-xl border border-purple-200 bg-[#FAF8FB] p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#956a32]">{item.kind}</p>
      <h3 className="mt-2 text-lg font-bold text-[#4A1249]">{item.title}</h3>
      {item.eventDate&&<p className="mt-2 text-xs font-semibold text-slate-700">Date: {item.eventDate}</p>}
      {item.location&&<p className="mt-1 text-xs text-slate-600">Location: {item.location}</p>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.summary}</p>
    </article>)}
   </div>
  </div>
 </section>;
};
