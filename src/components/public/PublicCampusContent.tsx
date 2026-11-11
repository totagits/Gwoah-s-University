import React,{useEffect,useState} from 'react';
type Entry={id:string;category:'campus'|'facilities'|'community';kind:'photo'|'video'|'information';title:string;description:string;mediaUrl:string;photoVersion:number;verified:boolean;status:'draft'|'published';updatedAt:string};
const categories=[{id:'campus',title:'Campus Overview'},{id:'facilities',title:'Facilities & Infrastructure'},{id:'community',title:'Campus Life & Community'}] as const;
export const PublicCampusContent:React.FC=()=>{
 const [items,setItems]=useState<Entry[]>([]);
 useEffect(()=>{let active=true;fetch('/api/public/campus-content',{cache:'no-store'})
   .then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(active&&Array.isArray(data.entries))setItems(data.entries);})
   .catch(()=>{});return()=>{active=false;};},[]);
 return <section id="campus-content" className="bg-white py-14 scroll-mt-32" aria-labelledby="campus-content-title">
   <div className="mx-auto max-w-7xl px-5 sm:px-8">
     <p className="text-xs font-bold uppercase tracking-widest text-[#927139]">Campus & Community</p>
     <h2 id="campus-content-title" className="mt-2 text-3xl font-bold text-[#4A1249]">Discover the HIAU learning environment</h2>
     <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Institutional photographs, facility information and campus stories are published only after university review. Unpublished content is shown as a clearly marked placeholder.</p>
     <div className="mt-9 grid gap-6 md:grid-cols-3">
       {categories.map(group=>{
         const records=items.filter(x=>x.category===group.id);
         return <article id={`campus-${group.id}`} key={group.id} className="scroll-mt-32 rounded-xl border border-[#E5DEE8] bg-[#FAF8FB] p-5">
           <h3 className="text-lg font-bold text-[#4A1249]">{group.title}</h3>
           {records.length===0?<div className="mt-4 flex min-h-44 flex-col justify-center rounded-lg border-2 border-dashed border-[#CFC4D2] bg-white p-5 text-center">
             <span className="text-sm font-semibold text-[#4A1249]">HIAU content placeholder</span>
             <p className="mt-2 text-xs leading-5 text-slate-600">Official photographs, verified details and approved videos will appear here when published by the university.</p>
           </div>:<div className="mt-4 space-y-5">{records.map(item=><div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
             {item.kind==='photo'&&<img src={item.mediaUrl} alt={item.title} loading="lazy" className="aspect-video w-full object-cover"/>}
             {item.kind==='video'&&<video src={item.mediaUrl} controls preload="metadata" className="aspect-video w-full bg-slate-900"/>}
             <div className="p-4"><h4 className="font-semibold text-[#4A1249]">{item.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.description}</p></div>
           </div>)}</div>}
         </article>;
       })}
     </div>
   </div>
 </section>;
};
