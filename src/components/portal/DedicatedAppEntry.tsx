import React,{useEffect,useState} from 'react';
import {Download,GraduationCap,LockKeyhole,ShieldCheck} from 'lucide-react';
import type {UserProfile} from '../../types';
type Kind='student'|'staff';
interface InstallPrompt extends Event{
 prompt:()=>Promise<void>;userChoice:Promise<{outcome:string;platform:string}>;
}
export const DedicatedAppEntry:React.FC<{kind:Kind;currentUser:UserProfile|null;onSignIn:()=>void;onSignOut:()=>void}>=({
 kind,currentUser,onSignIn,onSignOut
})=>{
 const [installPrompt,setInstallPrompt]=useState<InstallPrompt|null>(null);
 const [help,setHelp]=useState(false),[installed,setInstalled]=useState(false);
 const isStudent=kind==='student',correctRole=currentUser&&(isStudent?currentUser.role==='student':currentUser.role!=='student'&&currentUser.role!=='alumni');
 useEffect(()=>{
  const standalone=window.matchMedia('(display-mode: standalone)').matches||
   (navigator as Navigator&{standalone?:boolean}).standalone===true;
  setInstalled(standalone);
  const ready=(event:Event)=>{event.preventDefault();setInstallPrompt(event as InstallPrompt);};
  const complete=()=>{setInstalled(true);setInstallPrompt(null);};
  window.addEventListener('beforeinstallprompt',ready);
  window.addEventListener('appinstalled',complete);
  return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',complete);};
 },[]);
 const install=async()=>{
  if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null);}
  else setHelp(p=>!p);
 };
 return <main className="flex min-h-screen items-center justify-center bg-[#FAF8FB] p-5">
   <div className="w-full max-w-lg rounded-xl border border-purple-200 bg-white p-7 shadow-sm sm:p-10">
    <div className="flex items-center gap-3 text-[#4A1249]">
      {isStudent?<GraduationCap className="h-9 w-9"/>:<LockKeyhole className="h-9 w-9"/>}
      <div><p className="text-xs font-bold tracking-widest text-[#956D2C]">HARVEST INTERCONTINENTAL AMERICAN UNIVERSITY</p>
       <h1 className="mt-1 text-2xl font-extrabold">{isStudent?'HIAU Student App':'HIAU Staff ERP'}</h1></div>
    </div>
    <p className="mt-5 text-sm leading-7 text-slate-700">
      {isStudent?'Secure access to your student workspace, registration, learning activities and academic services.':
      'University operations and authorized ERP workspaces for HIAU faculty and staff.'}
    </p>
    <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>
       Your university credentials are required. Installation does not give access to private records, which remain online only.</p>
    {currentUser&&!correctRole&&<p role="alert" className="mt-5 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      This account is not authorized for the {isStudent?'Student App':'Staff ERP'}. Sign out and use an authorized university account.
    </p>}
    <div className="mt-6 flex flex-wrap gap-3">
      {!currentUser?<button type="button" onClick={onSignIn}
        className="hiau-brand-action rounded bg-[#4A1249] px-5 py-3 text-sm font-bold text-white">Secure sign in</button>:
        <button type="button" onClick={onSignOut} className="rounded border border-[#4A1249] px-5 py-3 text-sm font-bold text-[#4A1249]">Sign out</button>}
      {!installed&&<button type="button" onClick={()=>void install()}
        className="inline-flex items-center gap-2 rounded border border-[#4A1249] px-5 py-3 text-sm font-bold text-[#4A1249]">
        <Download className="h-4 w-4"/> Install {isStudent?'Student':'Staff'} App
      </button>}
    </div>
    {help&&<div role="status" className="mt-4 rounded bg-purple-50 p-4 text-xs leading-6 text-[#2A082C]">
       <strong>Install on your phone:</strong> Android Chrome → browser menu → Install app; iPhone Safari → Share → Add to Home Screen. On some devices the installation control appears only after revisiting the page.
    </div>}
    <a href="/" className="mt-6 inline-block text-sm font-semibold text-[#4A1249] underline">Visit public university website</a>
   </div>
 </main>;
};
