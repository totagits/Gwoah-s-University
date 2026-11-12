import React,{useEffect,useState} from 'react';
import {Download} from 'lucide-react';
interface InstallEvent extends Event{
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>;
}
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||
  (window.navigator as Navigator&{standalone?:boolean}).standalone===true;
export const PublicInstallApp:React.FC=()=>{
 const [prompt,setPrompt]=useState<InstallEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 const [hint,setHint]=useState(false);
 useEffect(()=>{
   setInstalled(isStandalone());
   const offer=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent);};
   const complete=()=>{setInstalled(true);setPrompt(null);setHint(false);};
   window.addEventListener('beforeinstallprompt',offer);
   window.addEventListener('appinstalled',complete);
   return()=>{
     window.removeEventListener('beforeinstallprompt',offer);
     window.removeEventListener('appinstalled',complete);
   };
 },[]);
 if(installed)return null;
 const install=async()=>{
   if(prompt){
     await prompt.prompt();
     const result=await prompt.userChoice;
     if(result.outcome==='accepted')setHint(false);
     setPrompt(null);
   }else setHint(v=>!v);
 };
 return <div className="relative shrink-0">
   <button type="button" onClick={()=>void install()} title="Install HIAU on your phone"
     aria-expanded={hint}
     className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-2 py-2 text-xs font-bold text-[#4A1249] hover:border-[#4A1249] focus-visible:outline-2">
     <Download className="h-4 w-4"/><span className="hidden md:inline">Install app</span>
     <span className="sr-only md:hidden">Install HIAU app</span>
   </button>
   {hint&&<div role="status" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-purple-200 bg-white p-3 text-xs leading-5 text-slate-700 shadow-xl">
     <p className="font-bold text-[#4A1249]">Install HIAU</p>
     <p className="mt-1">On iPhone: Safari → Share → Add to Home Screen. On Android: browser menu → Install app or Add to Home screen.</p>
     <p className="mt-1">Student and university records still require an internet connection and authorized sign-in.</p>
   </div>}
 </div>;
};
