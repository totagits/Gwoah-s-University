import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {CreditCard,RefreshCw,FileText,CheckCircle2,AlertCircle,ShieldCheck} from 'lucide-react';
import type {UserProfile} from '../../types';

type Row=Record<string,any>;
type FinanceState={
 actor:{id:string;role:string};
 permissions:{finance:boolean};
 students:Row[];terms:Row[];registrations:Row[];
 invoices:Row[];payments:Row[];invoiceLines:Row[];creditNotes:Row[];
};
type Action='invoice'|'payment'|'reconcilePayment';
const value=(v:unknown)=>typeof v==='string'?v:'';
const dollars=(cents:unknown)=>typeof cents==='number'&&Number.isFinite(cents)
  ?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100):'—';

const Section=({title,children}:{title:string;children:React.ReactNode})=>
  <section className="rounded-2xl border border-[#e9dcea] bg-white p-5 shadow-sm"><h3 className="mb-4 text-lg font-bold text-[#35103b]">{title}</h3>{children}</section>;

/**
 * Secure finance operations. Nothing here claims to initiate a mobile-money
 * transfer or confirms settlement before an independent reconciliation.
 */
export const VerifiedTuitionLedger:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const [data,setData]=useState<FinanceState|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [studentId,setStudentId]=useState('');
  const [termId,setTermId]=useState('');
  const [dueDate,setDueDate]=useState('');
  const [invoiceId,setInvoiceId]=useState('');
  const [amount,setAmount]=useState('');
  const [method,setMethod]=useState('bank');
  const [reference,setReference]=useState('');
  const [receivedDate,setReceivedDate]=useState('');
  const [reviewId,setReviewId]=useState('');
  const [reviewStatus,setReviewStatus]=useState<'reconciled'|'cancelled'>('reconciled');
  const [reviewNote,setReviewNote]=useState('');

  const refresh=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/workspaces/state',{credentials:'same-origin',cache:'no-store',signal});
      if(!response.ok)throw new Error(response.status===401?'Your session has expired. Sign in again.':'Unable to retrieve institutional ledger.');
      const state:FinanceState=await response.json();
      if(state.actor?.id!==currentUser.id||state.actor?.role!==currentUser.role||!state.permissions?.finance)
        throw new Error('Your account is not authorized to manage institutional finances.');
      if(!signal?.aborted){
        setData(state);
        setStudentId(prev=>state.students?.some(s=>s.id===prev)?prev:state.students?.[0]?.id||'');
        setInvoiceId(prev=>state.invoices?.some(i=>i.id===prev)?prev:state.invoices?.[0]?.id||'');
        setReviewId(prev=>state.payments?.some(p=>p.id===prev&&p.status==='recorded')?prev:'');
      }
    }catch(e){
      if(!signal?.aborted){setData(null);setError(e instanceof Error?e.message:'Could not load finance records.');}
    }finally{if(!signal?.aborted)setLoading(false);}
  },[currentUser.id,currentUser.role]);
  useEffect(()=>{
    if(!['super_admin','bursar'].includes(currentUser.role)){setLoading(false);return;}
    const controller=new AbortController();void refresh(controller.signal);
    return ()=>controller.abort();
  },[refresh,currentUser.role]);

  const submit=async(action:Action,payload:Row)=>{
    if(busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const response=await fetch('/api/workspaces/action',{method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action,data:payload}),
      });
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.error||'The finance operation was not saved.');
      setNotice(action==='invoice'
        ?'Invoice generated from actual unbilled course registrations. No money was collected.'
        :action==='payment'
          ?'Payment evidence recorded for review. This is not a confirmed payment or a gateway transaction.'
          :reviewStatus==='reconciled'
            ?'Payment evidence independently reconciled. Student ledger has been updated.'
            :'Payment record cancelled with audit history preserved.');
      if(action==='payment'){setAmount('');setReference('');}
      setReviewId('');setReviewNote('');
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:'Finance operation failed.');}
    finally{setBusy(false);}
  };
  const ownInvoices=useMemo(()=>data?.invoices||[],[data]);
  const selectedInvoice=ownInvoices.find(i=>i.id===invoiceId);
  const pending=(data?.payments||[]).filter(p=>p.status==='recorded');
  const selectedReview=pending.find(p=>p.id===reviewId);
  const eligibleTerms=(data?.terms||[]).filter(t=>(data?.registrations||[]).some(r=>r.student_id===studentId&&r.term_id===t.id&&r.status==='enrolled'
    &&!(data?.invoiceLines||[]).some(line=>line.registration_id===r.id)));
  const totalBilled=ownInvoices.reduce((n,i)=>n+(Number(i.amount_cents)||0),0);
  const totalOwed=ownInvoices.reduce((n,i)=>n+(Number(i.balance_cents)||0),0);
  const confirmed=(data?.payments||[]).filter(p=>p.status==='reconciled').reduce((n,p)=>n+(Number(p.amount_cents)||0),0);

  if(!['super_admin','bursar'].includes(currentUser.role))
    return <p role="alert" className="rounded-xl border border-red-200 bg-white p-6">Only authorized Finance/Bursar administrators can manage tuition accounts.</p>;
  if(loading&&!data)return <p role="status" className="rounded-xl bg-white p-6">Loading verified tuition records…</p>;
  const label='mb-1 block text-sm font-semibold text-[#35103b]';
  const input='w-full rounded-lg border border-[#d8c8da] bg-white p-2.5 text-sm text-slate-900';
  const actionButton='rounded-lg bg-[#4a1249] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40';
  return <div className="space-y-5 text-[#35103b]">
    <header className="rounded-2xl border border-[#e9dcea] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#967749]">Finance Office · Server-verified institutional records</p>
      <h2 className="mt-2 text-2xl font-bold">Tuition Billing, Receipts & Reconciliation</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-700">Generate course-based invoices, record documented partial payments, and independently reconcile them. This is an internal ledger—not a live MTN, Orange Money, or bank payment gateway.</p>
      <button type="button" onClick={()=>void refresh()} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#d8c8da] px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4"/>Refresh ledger</button>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      {[{name:'Total invoices',amount:totalBilled},{name:'Confirmed reconciled payments',amount:confirmed},{name:'Recorded outstanding balances',amount:totalOwed}]
        .map(metric=><div key={metric.name} className="rounded-xl border border-[#e9dcea] bg-white p-5">
          <p className="text-sm text-slate-600">{metric.name}</p><p className="mt-2 text-2xl font-bold">{dollars(metric.amount)}</p></div>)}
    </div>
    {notice&&<p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="h-5 w-5 shrink-0"/>{notice}</p>}
    {error&&<p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle className="h-5 w-5 shrink-0"/>{error}</p>}
    <div className="grid gap-5 xl:grid-cols-2">
      <Section title="1. Generate tuition invoice">
        <form className="space-y-3" onSubmit={event=>{event.preventDefault();if(!studentId||!termId||!dueDate)return;void submit('invoice',{studentId,termId,dueDate});}}>
          <div><label className={label} htmlFor="ledger-student">Enrolled student</label>
            <select id="ledger-student" className={input} value={studentId} onChange={e=>{setStudentId(e.target.value);setTermId('');}} required>
              <option value="">Select student</option>{(data?.students||[]).map(s=><option key={s.id} value={s.id}>{value(s.student_number)} — {value(s.full_name)}</option>)}
            </select></div>
          <div><label className={label} htmlFor="ledger-term">Term containing unbilled courses</label>
            <select id="ledger-term" className={input} value={termId} onChange={e=>setTermId(e.target.value)} required>
              <option value="">Select term</option>{eligibleTerms.map(t=><option key={t.id} value={t.id}>{value(t.code)} — {value(t.title)}</option>)}
            </select></div>
          <div><label className={label} htmlFor="ledger-date">Invoice due date</label><input id="ledger-date" type="date" required value={dueDate} onChange={e=>setDueDate(e.target.value)} className={input}/></div>
          <p className="text-xs text-slate-600">One invoice is generated from the student's unbilled enrolled courses for the selected term. The fee catalog determines the amount.</p>
          <button type="submit" disabled={busy||!studentId||!termId||!dueDate} className={actionButton}><FileText className="mr-2 inline h-4 w-4"/>Generate invoice</button>
        </form>
      </Section>
      <Section title="2. Record documentary payment evidence">
        <form className="space-y-3" onSubmit={event=>{event.preventDefault();if(!invoiceId||!amount||!reference.trim()||!receivedDate)return;void submit('payment',{invoiceId,amount,reference:reference.trim(),method,receivedDate});}}>
          <div><label className={label} htmlFor="ledger-invoice">Invoice</label>
            <select id="ledger-invoice" className={input} value={invoiceId} onChange={e=>setInvoiceId(e.target.value)} required>
              <option value="">Select invoice</option>{ownInvoices.filter(i=>Number(i.balance_cents)>0).map(i=><option key={i.id} value={i.id}>{value(i.number)} · {value(i.full_name)} · Due {dollars(i.balance_cents)}</option>)}
            </select></div>
          {selectedInvoice&&<p className="text-sm text-slate-600">Current outstanding: <strong>{dollars(selectedInvoice.balance_cents)}</strong>. You may record a partial amount. It will not reduce confirmed outstanding until a second authorized officer reconciles the evidence.</p>}
          <div><label className={label} htmlFor="ledger-amount">Amount in USD</label><input id="ledger-amount" className={input} type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required/></div>
          <div><label className={label} htmlFor="ledger-method">Evidence channel</label>
            <select id="ledger-method" value={method} onChange={e=>setMethod(e.target.value)} className={input}>
              <option value="bank">Verified bank statement/deposit reference</option>
              <option value="mobile_money">Mobile-money transaction reference (verification required)</option>
              <option value="cash">Cash office receipt</option>
            </select></div>
          <div><label className={label} htmlFor="ledger-reference">Unique receipt or transaction reference</label><input id="ledger-reference" className={input} value={reference} onChange={e=>setReference(e.target.value)} required maxLength={120}/></div>
          <div><label className={label} htmlFor="ledger-received">Date evidence was received</label><input id="ledger-received" className={input} type="date" value={receivedDate} onChange={e=>setReceivedDate(e.target.value)} required/></div>
          <button type="submit" disabled={busy||!invoiceId||!amount||!reference.trim()||!receivedDate} className={actionButton}><CreditCard className="mr-2 inline h-4 w-4"/>Record payment evidence</button>
        </form>
      </Section>
    </div>
    <Section title="3. Independent payment reconciliation">
      <p className="mb-4 flex items-start gap-2 text-sm text-slate-700"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0"/>A different bursar or an authorized administrator must independently verify the source evidence before reconciliation. The staff member recording a payment cannot reconcile their own entry as a bursar.</p>
      {pending.length===0?<p className="text-sm text-slate-600">No payment evidence awaiting review.</p>:<>
        <label className={label} htmlFor="ledger-review">Recorded payment awaiting review</label>
        <select id="ledger-review" className={input} value={reviewId} onChange={e=>setReviewId(e.target.value)}>
          <option value="">Select payment</option>{pending.map(p=><option key={p.id} value={p.id}>{value(p.reference)} · {dollars(p.amount_cents)} · {value(p.full_name)} · Recorder {value(p.recorded_by)}</option>)}
        </select>
        {selectedReview&&<form className="mt-4 space-y-3" onSubmit={event=>{event.preventDefault();if(reviewNote.trim())void submit('reconcilePayment',{id:reviewId,status:reviewStatus,note:reviewNote.trim()});}}>
          <p className="text-sm">Reference: {value(selectedReview.reference)} · Amount: {dollars(selectedReview.amount_cents)} · Channel: {value(selectedReview.method)}</p>
          <div><label className={label} htmlFor="ledger-decision">Decision</label><select className={input} id="ledger-decision" value={reviewStatus} onChange={e=>setReviewStatus(e.target.value as 'reconciled'|'cancelled')}>
            <option value="reconciled">Reconciled — source evidence verified</option><option value="cancelled">Cancelled — do not credit student account</option>
          </select></div>
          <div><label className={label} htmlFor="ledger-note">Independent verification note</label><textarea id="ledger-note" className={input} rows={3} required maxLength={1000} value={reviewNote} onChange={e=>setReviewNote(e.target.value)}/></div>
          <button type="submit" disabled={busy||!reviewNote.trim()} className={actionButton}>Save review decision</button>
        </form>}
      </>}
    </Section>
    <Section title="4. Posted invoices, credit notes and payment status">
      {(data?.invoices||[]).length===0?<p className="text-sm text-slate-600">No institutionally posted tuition invoices yet.</p>:
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-600">
        <th className="p-2">Invoice/student</th><th className="p-2">Billed</th><th className="p-2">Credit notes</th><th className="p-2">Confirmed payments</th><th className="p-2">Outstanding</th>
      </tr></thead><tbody>{ownInvoices.map(i=>{
        const credits=(data?.creditNotes||[]).filter(c=>c.invoice_id===i.id).reduce((n,c)=>n+(Number(c.amount_cents)||0),0);
        const received=(data?.payments||[]).filter(p=>p.invoice_id===i.id&&p.status==='reconciled').reduce((n,p)=>n+(Number(p.amount_cents)||0),0);
        return <tr key={i.id} className="border-b last:border-0">
          <td className="p-2"><span className="font-semibold">{value(i.number)}</span><p className="text-xs text-slate-600">{value(i.full_name)} · {value(i.term_title)}</p></td>
          <td className="p-2">{dollars(i.amount_cents)}</td><td className="p-2">{dollars(credits)}</td>
          <td className="p-2">{dollars(received)}</td><td className="p-2 font-semibold">{dollars(i.balance_cents)}</td>
        </tr>;
      })}</tbody></table></div>}
      {ownInvoices.some(i=>Number(i.balance_cents)<0)&&<p role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Some invoices have a student credit balance after course drops or adjustments. An authorized Bursar must review the credit; this system does not automatically refund cash or transfer it to another term.
      </p>}
      {(data?.payments||[]).length>0&&<p className="mt-4 text-xs text-slate-600">{(data?.payments||[]).filter(p=>p.status==='recorded').length} unreconciled payment(s). Recorded-but-unreconciled evidence does not decrease confirmed outstanding balances.</p>}
      <p className="mt-3 text-xs text-slate-600">Payment gateway credentials, provider callbacks, transaction verification, certified receipts and official refund disbursements require separate institution-approved integrations.</p>
    </Section>
  </div>;
};
