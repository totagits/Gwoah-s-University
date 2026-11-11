import React,{useEffect,useState} from 'react';
type Published={id:string;section:string;slot?:string;body:string;verified:boolean};
let saved:Published[]=[];
let ongoing:Promise<Published[]>|null=null;
const fetchContent=()=>ongoing||(ongoing=fetch('/api/public/site-content',{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('Unavailable')))
 .then(data=>{saved=Array.isArray(data.items)?data.items:[];return saved;})
 .catch(()=>saved).finally(()=>{ongoing=null;}));
/** An editable field with a safe, existing institutional copy fallback. */
export const ManagedText:React.FC<{section:string;slot:string;fallback:string}>=({section,slot,fallback})=>{
 const [items,setItems]=useState(saved);
 useEffect(()=>{let alive=true;void fetchContent().then(rows=>{if(alive)setItems(rows);});return()=>{alive=false;};},[]);
 const item=items.find(row=>row.section===section&&row.slot===slot&&row.verified);
 return <>{item?.body||fallback}</>;
};
