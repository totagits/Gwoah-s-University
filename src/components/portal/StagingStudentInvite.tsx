import React,{useState} from 'react';
import {UserPlus,Copy} from 'lucide-react';
/** Staging-only invitation: it creates an unactivated student-role account,
 * never generates passwords, and does not insert fake grades/tuition records. */
export const StagingStudentInvite:React.FC=()=>{
 const [open,setOpen]=useState(false),[name,setName]=useState(''),[email,setEmail]=useState('');
 const [activation,setActivation]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const create=async(event:React.FormEvent)=>{
   event.preventDefault();setBusy(true);setActivation('');setStatus('');
   try{
     const response=await fetch('/api/identity/invite',{method:'POST',
       headers:{'content-type':'application/json'},credentials:'same-origin',
       body:JSON.stringify({name:name.trim(),email:email.trim().toLowerCase(),role:'student'})});
     const data=await response.json();
     if(!response.ok)throw new Error(data.error||'Could not create invitation');
     const link=new URL(data.activationUrl);
     if(!/^[a-f0-9]{64}$/.test(link.hash.slice(1)))throw Error('Invalid activation link');
     // Use the host being tested; API origin may be configured to another hostname.
     const safe=window.location.origin+'/?activate=1'+link.hash;
     setActivation(safe);
     setStatus('Student-role invitation created. Activation expires in 48 hours. Open the link in a separate browser profile to choose a password.');
   }catch(error){setStatus(error instanceof Error?error.message:'Could not create invitation');}
   finally{setBusy(false);}
 };
 return <div className="relative">
   <button type="button" onClick={()=>setOpen(v=>!v)}
     className="inline-flex items-center gap-1 rounded border border-purple-200 px-2 py-1.5 text-xs font-semibold text-[#4A1249]">
     <UserPlus className="h-4 w-4"/> Test student account
   </button>
   {open&&<div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,23rem)] rounded-lg border border-purple-200 bg-white p-4 text-sm text-[#2E0F34] shadow-2xl">
    <h2 className="font-bold text-[#4A1249]">Create staging student login</h2>
    <p className="mt-1 text-xs leading-5 text-slate-600">Use an email address you control. This creates a student login for testing; it does not create enrollment, fee balances or academic records.</p>
    <form onSubmit={e=>void create(e)} className="mt-3 grid gap-3">
     <label className="text-xs font-semibold">Test account name<input required value={name} maxLength={100}
       onChange={e=>setName(e.target.value)} className="mt-1 block w-full rounded border p-2"/></label>
     <label className="text-xs font-semibold">Email address you control<input required type="email" value={email}
       onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full rounded border p-2"/></label>
     <button type="submit" disabled={busy||!name.trim()||!email.trim()}
       className="hiau-brand-action rounded bg-[#4A1249] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
       {busy?'Creating invitation…':'Create student invitation'}
     </button>
    </form>
    {status&&<p role="status" className="mt-3 text-xs leading-5">{status}</p>}
    {activation&&<div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs">
      <p className="font-semibold">Private activation link — do not share publicly</p>
      <button type="button" onClick={()=>void navigator.clipboard.writeText(activation)}
        className="mt-2 inline-flex items-center gap-1 rounded border border-[#4A1249] bg-white px-2 py-1">
        <Copy className="h-3 w-3"/> Copy activation link
      </button>
      <p className="mt-2 text-slate-700">After activation, sign in at /student/ using this email and the password you chose.</p>
     </div>}
     <button type="button" onClick={()=>{setOpen(false);setActivation('');setStatus('');}}
       className="mt-3 text-xs underline">Close</button>
   </div>}
 </div>;
};
