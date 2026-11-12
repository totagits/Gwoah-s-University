import React,{useCallback,useEffect,useState} from 'react';
import type {UserProfile} from '../../types';
type Handoff={
 commit_id:string;plan_id:string;student_id:string;term_id:string;registered_at:string;
 student_number:string;full_name:string;term_title:string;
 registered_sections:number;unbilled_sections:number;
};
type Quote={studentNumber:string;studentName:string;term:string;currency:string;lines:{
 course_code:string;course_title:string;credits:number;fee_per_credit_cents:number;line_cents:number;invoice_number?:string|null;
 }[];indicativeUnbilledCents:number;unbilledCount:number;readyForPosting:boolean;notice:string};
const amount=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
export const FinanceRegistrationHandoff:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
 const allowed=['super_admin','registrar','bursar'].includes(currentUser.role);
 const [items,setItems]=useState<Handoff[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [quote,setQuote]=useState<Quote|null>(null),[quoteBusy,setQuoteBusy]=useState<string|null>(null);
 const refresh=useCallback(async()=>{
  if(!allowed)return;
  setBusy(true);setError('');
  try{
   const r=await fetch('/api/student/finance-handoff',{credentials:'same-origin',cache:'no-store'});
   const data=await r.json();
   if(!r.ok)throw new Error(data.error||'Unable to load the billing review queue.');
   setItems(data.items||[]);
  }catch(e){setError(e instanceof Error?e.message:'Unable to load billing review queue.');}
  finally{setBusy(false);}
 },[allowed]);
 useEffect(()=>{void refresh();},[refresh]);
 const preview=async(commitId:string)=>{
  setQuoteBusy(commitId);setError('');setQuote(null);
  try{
   const response=await fetch('/api/student/finance-quote/'+encodeURIComponent(commitId),
     {credentials:'same-origin',cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not preview unbilled courses.');
   setQuote(data);
  }catch(e){setError(e instanceof Error?e.message:'Could not load fee preview.');}
  finally{setQuoteBusy(null);}
 };
 if(!allowed)return null;
 return <section aria-label="Registered courses pending Finance verification"
  className="mt-6 rounded-xl border border-purple-200 bg-white p-4 sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-lg font-bold text-[#4A1249]">Course Registration — Finance Handoff</h2>
     <p className="mt-1 text-sm leading-6 text-slate-600">
       Officially registered students requiring fee verification. This queue does not post an invoice, approve aid,
       authorize a waiver, schedule a payment or record money.
     </p></div>
   <button type="button" disabled={busy} onClick={()=>void refresh()}
      className="rounded border border-purple-300 px-3 py-2 text-xs font-semibold text-[#4A1249] disabled:opacity-50">
      Refresh queue
   </button>
  </div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {!items.length?<p className="mt-4 rounded border border-dashed border-purple-200 p-4 text-sm text-slate-600">
    No course-plan registrations have been handed over for Finance review.
  </p>:<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm">
   <thead><tr className="border-b border-purple-200 text-[#4A1249]">
    <th className="p-2">Student</th><th className="p-2">Term</th><th className="p-2">Registered</th>
    <th className="p-2">Unbilled</th><th className="p-2">Finance status</th><th className="p-2">Review</th></tr></thead>
   <tbody>{items.map(item=><tr key={item.commit_id} className="border-b border-purple-100">
    <td className="p-2"><span className="font-semibold">{item.student_number}</span><span className="block">{item.full_name}</span></td>
    <td className="p-2">{item.term_title}</td>
    <td className="p-2">{item.registered_sections} sections</td>
    <td className="p-2">{item.unbilled_sections} sections</td>
    <td className="p-2">{item.unbilled_sections>0?'Pending verified fee review':'All active sections billed'}</td>
    <td className="p-2"><button type="button" disabled={quoteBusy!==null} onClick={()=>void preview(item.commit_id)}
      className="rounded border border-[#4A1249] px-3 py-2 text-xs font-semibold text-[#4A1249] disabled:opacity-50">
      {quoteBusy===item.commit_id?'Loading…':'Preview fees'}</button></td>
   </tr>)}</tbody>
  </table></div>}
  {quote&&<div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4" aria-label="Indicative fees preview">
    <h3 className="font-bold text-[#4A1249]">Indicative fees — {quote.studentNumber} · {quote.term}</h3>
    <p className="mt-2 text-xs text-amber-900">{quote.notice}</p>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[440px] text-left text-sm">
      <thead><tr><th className="p-2">Course</th><th className="p-2">Credits</th><th className="p-2">Per credit</th><th className="p-2">Line</th><th className="p-2">Billing</th></tr></thead>
      <tbody>{quote.lines.map((line,i)=><tr key={i} className="border-t border-amber-200">
       <td className="p-2">{line.course_code} — {line.course_title}</td><td className="p-2">{line.credits}</td>
       <td className="p-2">{amount(line.fee_per_credit_cents)}</td><td className="p-2">{amount(line.line_cents)}</td>
       <td className="p-2">{line.invoice_number||'Unbilled'}</td>
      </tr>)}</tbody>
    </table></div>
    <p className="mt-3 font-semibold">Unbilled estimate: {amount(quote.indicativeUnbilledCents)} ({quote.unbilledCount} courses)</p>
    <p className="mt-1 text-xs">No amount is payable based on this preview. The approved institutional fee schedule and authorized assistance decisions must be confirmed before an invoice is posted.</p>
   </div>}
  <p className="mt-3 text-xs leading-5 text-slate-600">
   Finance must confirm officially adopted fees, scholarship/aid awards, waiver approvals and payment deadlines before posting any financial obligation.
  </p>
 </section>;
};
