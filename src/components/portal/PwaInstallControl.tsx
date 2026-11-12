import React,{useEffect,useState} from 'react';
import {Download,Smartphone} from 'lucide-react';
type Kind='student'|'staff';
interface InstallEvent extends Event{
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:string;platform:string}>;
}
// Bind to the browser installation event before any login transition. The
// callback can arrive while the initial app entry/login is showing.
let pendingInstall:InstallEvent|null=null;
const listeners=new Set<()=>void>();
if(typeof window!=='undefined'){
 window.addEventListener('beforeinstallprompt',event=>{
  if(!(/^\/student\//.test(location.pathname)||/^\/staff\//.test(location.pathname)))return;
  event.preventDefault();pendingInstall=event as InstallEvent;
  listeners.forEach(notify=>notify());
 });
 window.addEventListener('appinstalled',()=>{pendingInstall=null;listeners.forEach(notify=>notify());});
}
export const PwaInstallControl:React.FC<{kind:Kind;compact?:boolean}>=({kind,compact=false})=>{
 const [promptAvailable,setPromptAvailable]=useState(!!pendingInstall);
 const [help,setHelp]=useState(false);
 const [installed,setInstalled]=useState(false);
 useEffect(()=>{
  const refresh=()=>{setPromptAvailable(!!pendingInstall);
    setInstalled(window.matchMedia('(display-mode: standalone)').matches||
      (navigator as Navigator&{standalone?:boolean}).standalone===true);};
  refresh();listeners.add(refresh);return()=>{listeners.delete(refresh);};
 },[]);
 if(installed)return null;
 const install=async()=>{
  if(pendingInstall){
   const prompt=pendingInstall;pendingInstall=null;setPromptAvailable(false);
   try{await prompt.prompt();const choice=await prompt.userChoice;
     if(choice.outcome==='dismissed')setHelp(true);
   }catch{setHelp(true);}
  }else setHelp(v=>!v);
 };
 const title=kind==='student'?'Install Student App':'Install Staff App';
 return <div className="relative">
   <button type="button" onClick={()=>void install()} aria-expanded={help}
     className="inline-flex items-center gap-1.5 rounded border border-[#4A1249] bg-white px-3 py-2 text-xs font-semibold text-[#4A1249] focus-visible:outline-2">
     <Download className="h-4 w-4" aria-hidden="true"/>{compact?title:title}
   </button>
   {help&&<div role="status" className="absolute right-0 top-full z-50 mt-2 w-[min(80vw,19rem)] rounded-lg border border-purple-200 bg-white p-4 text-xs leading-6 text-[#35103b] shadow-lg">
      <strong className="flex items-center gap-2"><Smartphone className="h-4 w-4"/>{title} on your phone</strong>
      <p>Android Chrome: open browser menu → Install app or Add to Home screen.</p>
      <p>iPhone Safari: Share → Add to Home Screen → Add.</p>
      {!promptAvailable&&<p>Installation is controlled by your browser. You do not need to sign out.</p>}
      <button type="button" className="mt-2 underline" onClick={()=>setHelp(false)}>Close instructions</button>
   </div>}
 </div>;
};
