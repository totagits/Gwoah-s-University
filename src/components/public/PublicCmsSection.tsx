import React,{useEffect,useState} from 'react';
type Section='home'|'about'|'academics'|'admissions'|'events'|'student-life'|'footer';
type Content={id:string;section:Section;title:string;body:string;verified:boolean;slot?:string};
let cached:Content[]|null=null;
let pending:Promise<Content[]>|null=null;
const load=()=>pending||(pending=fetch('/api/public/site-content',{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('Site content unavailable')))
 .then(data=>{cached=Array.isArray(data.items)?data.items:[];return cached!;})
 .catch(()=>{cached=[];return [];}).finally(()=>{pending=null;}));
export const PublicCmsSection:React.FC<{section:Section}>=({section})=>{
 const [items,setItems]=useState<Content[]>(cached||[]);
 useEffect(()=>{let active=true;void load().then(result=>{if(active)setItems(result);});return()=>{active=false;};},[]);
 const content=items.filter(item=>item.section===section&&item.verified&&!item.slot);
 if(content.length===0)return null;
 return <section aria-label={section+' university updates'} className="bg-white py-10 text-[#301337]">
   <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2">
    {content.map(item=><article key={item.id} className="rounded-xl border border-[#E5DEE8] bg-[#FAF8FB] p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#4A1249]">{item.title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.body}</p>
    </article>)}
   </div>
 </section>;
};
