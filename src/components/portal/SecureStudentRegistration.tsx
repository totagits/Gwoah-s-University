import React,{useCallback,useEffect,useState} from 'react';
import {BookOpen,Plus,Minus,RefreshCw,AlertCircle,CheckCircle2,Printer} from 'lucide-react';
import type {UserProfile} from '../../types';

type Row=Record<string,any>;
type State={
  actor:{id:string;role:string};
  ownStudent:Row|null;
  sections:Row[];
  terms:Row[];
  registrations:Row[];
  courses:Row[];
  invoices:Row[];
  creditNotes:Row[];
};
type Props={currentUser:UserProfile;onOpenPrintModal:(type:'registration_plan')=>void};
const asText=(value:unknown)=>typeof value==='string'?value:'';
const money=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)
  ?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100):'Not available';

export const SecureStudentRegistration:React.FC<Props>=({currentUser,onOpenPrintModal})=>{
  const [state,setState]=useState<State|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const [target,setTarget]=useState<{kind:'register'|'drop';row:Row}|null>(null);
  const [reason,setReason]=useState('');
  const refresh=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/workspaces/state',{credentials:'same-origin',cache:'no-store',signal});
      if(!response.ok)throw new Error(response.status===401?'Your session expired; please sign in again.':'Academic records could not be loaded.');
      const data:State=await response.json();
      if(data.actor?.id!==currentUser.id||data.actor.role!==currentUser.role)
        throw new Error('The server did not return your authorized academic workspace.');
      if(!signal?.aborted)setState(data);
    }catch(e){if(!signal?.aborted){setState(null);setError(e instanceof Error?e.message:'Could not load registration.');}}
    finally{if(!signal?.aborted)setLoading(false);}
  },[currentUser.id,currentUser.role]);
  useEffect(()=>{
    if(currentUser.role!=='student'){setLoading(false);return;}
    const controller=new AbortController();
    void refresh(controller.signal);
    return ()=>controller.abort();
  },[refresh,currentUser.role]);

  const run=async()=>{
    if(!target||busy||!state?.ownStudent)return;
    const action=target.kind==='register'?'register':'drop';
    if(action==='drop'&&!reason.trim()){setError('A reason is required to request this course drop.');return;}
    setBusy(true);setError('');setNotice('');
    try{
      const response=await fetch('/api/workspaces/action',{
        method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action,data:action==='register'
          ?{sectionId:target.row.id}
          :{id:target.row.id,reason:reason.trim()}}),
      });
      const data=await response.json();
      if(!response.ok||!data.success)throw new Error(data.error||'Your registration request was not accepted.');
      const creditCents=action==='drop'&&typeof data.result?.creditCents==='number'?data.result.creditCents:0;
      setNotice(action==='register'
        ?'Course enrolled successfully. Your verified registration record has been updated.'
        :`Course dropped. ${creditCents>0?'A credit note of '+money(creditCents)+' was recorded against the billed registration.':'No billed registration credit note was needed.'} This is not a cash refund.`);
      setTarget(null);setReason('');
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:'Registration failed.');}
    finally{setBusy(false);}
  };

  if(currentUser.role!=='student')return <section className="rounded-xl border border-[#e6dce7] bg-white p-6 text-slate-700">
    <h2 className="text-xl font-bold text-[#35103b]">Student course registration</h2>
    <p className="mt-2 text-sm">Students register or drop their own courses here. Registrar staff should use the authorized academic operations workspace for institutional enrollment review. Student impersonation is not permitted.</p>
  </section>;
  if(loading&&!state)return <p role="status" className="rounded-xl bg-white p-6 text-slate-700">Loading your verified course registration…</p>;
  const student=state?.ownStudent;
  const registrations=(state?.registrations||[]).filter(r=>r.student_id===student?.id);
  const active=registrations.filter(r=>r.status==='enrolled');
  const openSections=(state?.sections||[]).filter(s=>s.term_status==='open');
  const creditsBySection=new Map((state?.sections||[]).map(s=>[s.id,Number(s.credits)||0]));
  const activeCredits=active.reduce((sum,r)=>sum+(creditsBySection.get(r.section_id)||Number(r.credits)||0),0);
  const activeTermIds=new Set(openSections.map(s=>s.term_id));
  const maxCredits=(state?.terms||[]).filter(t=>activeTermIds.has(t.id)).map(t=>Number(t.max_credits)).filter(Number.isFinite);
  return <section className="space-y-5 text-[#35103b]">
    <div className="rounded-2xl border border-[#e6dce7] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#916b32]">Student academic services · Verified registration</p>
      <h2 className="mt-2 text-2xl font-bold">Course Selection and Add/Drop</h2>
      <p className="mt-2 text-sm text-slate-700">{student?asText(student.full_name)+' · '+asText(student.student_number):'No linked student record'}</p>
      <p className="mt-2 text-xs text-slate-600">Registration is available only for university-open terms and sections. The server checks eligibility, prerequisites, seat capacity, credit limits and financial holds.</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{active.length} active course(s) · {activeCredits} credits {maxCredits.length===1?'· Maximum '+maxCredits[0]+' credits':''}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={()=>void refresh()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-[#d2bfd5] px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4"/>Refresh</button>
          <button type="button" onClick={()=>onOpenPrintModal('registration_plan')} disabled={!student} className="inline-flex items-center gap-2 rounded-lg border border-[#d2bfd5] px-3 py-2 text-sm font-semibold disabled:opacity-50"><Printer className="h-4 w-4"/>Print registration slip</button>
        </div>
      </div>
    </div>
    {notice&&<p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="h-5 w-5 shrink-0"/>{notice}</p>}
    {error&&<p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle className="h-5 w-5 shrink-0"/>{error}</p>}
    {!student?<p className="rounded-xl border border-amber-200 bg-white p-6 text-sm">Your authorized university student record has not been linked to this account. Contact the Registrar; no sample student is substituted.</p>:<>
      <div className="rounded-2xl border border-[#e6dce7] bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5"/>Your registered courses</h3>
        {active.length===0?<p className="text-sm text-slate-600">No active registrations on your verified account.</p>:<div className="space-y-2">
          {active.map(r=>{
            const section=(state?.sections||[]).find(s=>s.id===r.section_id);
            const canDrop=section?.term_status==='open';
            return <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8dfe9] p-4">
              <div><p className="font-semibold">{asText(r.course_code)} — {asText(r.course_title)}</p>
                <p className="mt-1 text-xs text-slate-600">{asText(r.term_title)} · {Number(section?.credits)||0} credits · {asText(section?.schedule)||'Schedule not recorded'}</p>
              </div>
              <button type="button" disabled={busy||!canDrop} onClick={()=>{setTarget({kind:'drop',row:r});setReason('');setError('');}}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 disabled:opacity-40">
                <Minus className="h-4 w-4"/>Drop course</button>
            </div>;
          })}
        </div>}
      </div>
      <div className="rounded-2xl border border-[#e6dce7] bg-white p-5">
        <h3 className="text-lg font-bold">Available open sections</h3>
        <p className="mb-4 mt-1 text-sm text-slate-600">Only sections actually published as open in the university's operational records appear here. The server decides whether a registration can proceed.</p>
        {openSections.length===0?<p className="rounded-lg bg-[#faf8fb] p-4 text-sm text-slate-600">No sections are currently open for student registration.</p>:
        <div className="grid gap-3 md:grid-cols-2">{openSections.map(s=>{
          const sameCourse=active.some(r=>r.term_id===s.term_id&&r.course_code===s.course_code);
          const full=Number(s.enrolled)>=Number(s.capacity);
          return <article key={s.id} className="rounded-xl border border-[#e6dce7] p-4">
            <h4 className="font-bold">{asText(s.course_code)} — {asText(s.course_title)}</h4>
            <p className="mt-1 text-xs text-slate-600">{asText(s.term_title)} · {Number(s.credits)||0} credits</p>
            <p className="mt-2 text-sm">{asText(s.schedule)||'Schedule not recorded'} · {asText(s.location)||'Location not recorded'}</p>
            <p className="mt-1 text-xs text-slate-600">Lecturer: {asText(s.lecturer_name)||'Not assigned'} · {Number(s.enrolled)||0}/{Number(s.capacity)||0} seats</p>
            <button type="button" disabled={busy||sameCourse||full} onClick={()=>{setTarget({kind:'register',row:s});setError('');}}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              <Plus className="h-4 w-4"/>{sameCourse?'Already enrolled':full?'Section full':'Add course'}</button>
          </article>;
        })}</div>}
      </div>
      {target&&<div role="dialog" aria-modal="true" aria-labelledby="hiau-enrollment-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h3 id="hiau-enrollment-dialog" className="text-xl font-bold">{target.kind==='register'?'Confirm course registration':'Confirm course drop'}</h3>
          <p className="mt-3 text-sm">{asText(target.row.course_code)} — {asText(target.row.course_title)}</p>
          {target.kind==='drop'?<><label htmlFor="hiau-drop-reason" className="mt-4 block text-sm font-semibold">Reason for dropping this course</label>
            <textarea id="hiau-drop-reason" required rows={3} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#d2bfd5] p-3 text-sm"/>
            <p className="mt-2 text-xs text-slate-600">A billed course drop creates a credit note where applicable. It does not automatically refund cash. Confirm institutional withdrawal and refund policy with the Registrar and Bursar.</p></>:
            <p className="mt-3 text-xs text-slate-600">Course eligibility, credit ceiling, prerequisite completion and seat availability are verified on the server when submitted. Enrollment alone does not confirm an online classroom is available.</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={()=>setTarget(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="button" disabled={busy||(target.kind==='drop'&&!reason.trim())} onClick={()=>void run()}
              className="rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy?'Saving…':'Confirm'}</button>
          </div>
        </div>
      </div>}
    </>}
  </section>;
};
