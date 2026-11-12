import React,{useCallback,useEffect,useState} from 'react';
import type {UserProfile} from '../../types';
type Request={id:string;kind:string;term_id:string;term_title:string;requested_cents:number;reason:string;
 status:string;created_at:string;student_number?:string;full_name?:string;registrar_note?:string;finance_note?:string};
type Term={id:string;title:string};
const amount=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const post=async(url:string,payload:object)=>{
 const response=await fetch(url,{method:'POST',credentials:'same-origin',
  headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const data=await response.json();
 if(!response.ok)throw Error(data.error||'Request failed.');
 return data;
};
export const StudentAssistanceRequests:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
 const role=currentUser.role,isStudent=role==='student',isRegistrar=['registrar','super_admin'].includes(role),
 isFinance=['bursar','super_admin'].includes(role);
 const [items,setItems]=useState<Request[]>([]),[terms,setTerms]=useState<Term[]>([]),[linked,setLinked]=useState(true);
 const [termId,setTermId]=useState(''),[kind,setKind]=useState('scholarship'),[requestedAmount,setAmount]=useState('0.00'),
 [reason,setReason]=useState(''),[notes,setNotes]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const permitted=isStudent||isRegistrar||isFinance;
 const load=useCallback(async()=>{
  if(!permitted)return;
  const response=await fetch('/api/student/assistance',{credentials:'same-origin',cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw Error(data.error||'Unable to load assistance requests.');
  setItems(data.requests||[]);setTerms(data.terms||[]);setLinked(data.linked!==false);
 },[currentUser.id,role,permitted]);
 useEffect(()=>{void load().catch(e=>setError(e.message));},[load]);
 if(!permitted)return null;
 const submit=async()=>{
  if(busy)return;setBusy(true);setError('');setMessage('');
  try{
   await post('/api/student/assistance',{termId,kind,requestedAmount,reason});
   setReason('');setMessage('Application submitted for institutional review. No award or tuition credit has been granted.');
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Unable to submit request.');}
  finally{setBusy(false);}
 };
 const decide=async(requestId:string,decision:string)=>{
  if(busy)return;setBusy(true);setError('');setMessage('');
  try{
   const r=await post('/api/student/assistance/'+requestId+'/review',{decision,note:notes[requestId]||''});
   setMessage('Review status: '+r.status+'. No award or fee adjustment has been posted.');
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Review not saved.');}
  finally{setBusy(false);}
 };
 return <section className="mt-5 rounded-xl border border-purple-200 bg-white p-4 sm:p-6" aria-label="Financial assistance requests">
  <h2 className="text-lg font-bold text-[#4A1249]">Scholarships, Financial Aid & Tuition Waivers</h2>
  <p className="mt-2 text-sm text-slate-600">Requests and reviews only. An institutional award, fee reduction or financial credit requires a separate authorized posting process.</p>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {message&&<p role="status" className="mt-3 text-sm text-green-800">{message}</p>}
  {isStudent&&(!linked?<p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm">Registrar-linked admission record required before applying.</p>:
   <div className="mt-4 grid gap-3 sm:grid-cols-2">
    <label className="text-sm font-semibold">Academic term<select value={termId} onChange={e=>setTermId(e.target.value)} className="mt-1 block w-full rounded border p-2">
      <option value="">Select open term</option>{terms.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
    <label className="text-sm font-semibold">Assistance type<select value={kind} onChange={e=>setKind(e.target.value)} className="mt-1 block w-full rounded border p-2">
      <option value="scholarship">Scholarship</option><option value="financial_aid">Need-based financial aid</option>
      <option value="tuition_waiver">Tuition waiver request</option></select></label>
    <label className="text-sm font-semibold">Requested amount (USD)<input value={requestedAmount}
      inputMode="decimal" onChange={e=>setAmount(e.target.value)} className="mt-1 block w-full rounded border p-2" placeholder="0.00"/></label>
    <label className="text-sm font-semibold sm:col-span-2">Reason / justification<textarea rows={3} value={reason} maxLength={2000}
      onChange={e=>setReason(e.target.value)} className="mt-1 block w-full rounded border p-2" placeholder="Explain your request (minimum 20 characters)"/></label>
    <div><button disabled={busy||!termId||reason.trim().length<20} type="button" onClick={()=>void submit()}
      className="hiau-brand-action rounded bg-[#4A1249] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Submit application</button></div>
   </div>)}
  <h3 className="mt-6 text-sm font-bold text-[#4A1249]">{isStudent?'My applications':'Assistance review queue'}</h3>
  {!items.length?<p className="mt-3 rounded border border-dashed p-4 text-sm text-slate-600">No applications currently in this view.</p>:
   <div className="mt-3 space-y-3">{items.map(item=><article key={item.id} className="rounded-lg border border-purple-100 p-4 text-sm">
    <h4 className="font-semibold">{item.kind.replaceAll('_',' ')} · {item.term_title} · {amount(item.requested_cents)}</h4>
    {item.student_number&&<p className="text-xs text-slate-600">{item.student_number} — {item.full_name}</p>}
    <p className="mt-2 font-medium capitalize">Status: {item.status.replaceAll('_',' ')}</p>
    <p className="mt-2 whitespace-pre-wrap text-slate-700">{item.reason}</p>
    {item.registrar_note&&<p className="mt-2 text-slate-600">Academic review: {item.registrar_note}</p>}
    {item.finance_note&&<p className="mt-2 text-slate-600">Finance review: {item.finance_note}</p>}
    {!isStudent&&<div className="mt-3 space-y-2">
     <label className="block font-semibold">Review reason<textarea rows={2} maxLength={1200}
       value={notes[item.id]||''} onChange={e=>setNotes(v=>({...v,[item.id]:e.target.value}))}
       className="mt-1 block w-full rounded border p-2"/></label>
     <div className="flex flex-wrap gap-2">
      {item.status==='submitted'&&isRegistrar&&<button disabled={busy||!notes[item.id]||notes[item.id].trim().length<10}
       onClick={()=>void decide(item.id,'recommend')} className="rounded border border-[#4A1249] px-3 py-2 font-semibold text-[#4A1249] disabled:opacity-50">Recommend for Finance review</button>}
      {item.status==='recommended'&&isFinance&&<button disabled={busy||!notes[item.id]||notes[item.id].trim().length<10}
       onClick={()=>void decide(item.id,'finance_review')} className="rounded border border-[#4A1249] px-3 py-2 font-semibold text-[#4A1249] disabled:opacity-50">Complete Finance review (no award)</button>}
      <button disabled={busy||!notes[item.id]||notes[item.id].trim().length<10} onClick={()=>void decide(item.id,'return')}
       className="rounded border px-3 py-2 disabled:opacity-50">Return</button>
      <button disabled={busy||!notes[item.id]||notes[item.id].trim().length<10} onClick={()=>void decide(item.id,'reject')}
       className="rounded border px-3 py-2 disabled:opacity-50">Reject</button>
     </div>
    </div>}
   </article>)}</div>}
 </section>;
};
