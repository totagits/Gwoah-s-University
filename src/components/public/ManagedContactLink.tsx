import React,{useEffect,useState} from 'react';
type Item={id:string;section:string;slot?:string;body:string;verified:boolean};
let cache:Item[]=[];
let pending:Promise<Item[]>|null=null;
const load=()=>pending||(pending=fetch('/api/public/site-content',{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('CMS unavailable')))
  .then(data=>{cache=Array.isArray(data.items)?data.items:[];return cache;})
  .catch(()=>cache).finally(()=>{pending=null;}));
export function usePublicContentSlot(section:string,slot:string,fallback:string){
 const [items,setItems]=useState(cache);
 useEffect(()=>{let live=true;void load().then(rows=>{if(live)setItems(rows);});return()=>{live=false;};},[]);
 return items.find(x=>x.section===section&&x.slot===slot&&x.verified)?.body||fallback;
}
export const ManagedContactLink:React.FC<{kind:'email'|'phone';slot:string;fallback:string}>=({kind,slot,fallback})=>{
 const raw=usePublicContentSlot('footer',slot,fallback);
 const value=kind==='email'
   ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)?raw:fallback)
   : (/^\+?[0-9() .-]{7,25}$/.test(raw)?raw:fallback);
 const href=kind==='email'?'mailto:'+value:'tel:'+value.replace(/[^+0-9]/g,'');
 return <a href={href} className="inline-flex min-w-0 items-center gap-2 break-all rounded-sm text-sm leading-6 text-[#EEE6EE] hover:text-white hover:underline">{value}</a>;
};
