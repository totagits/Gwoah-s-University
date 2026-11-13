import React,{useEffect,useMemo,useState} from 'react';
import {CheckCircle2,RefreshCw,UserCheck} from 'lucide-react';
import type {UserProfile} from '../../types';

type Account={id:string;name:string;email:string};
type Program={id:string;code:string;title:string};
type Term={id:string;code:string;title:string;status:string;start_date:string;end_date:string;max_credits:number};

const checked=async(response:Response)=>{
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'Request failed.');
  return data;
};
const csrf=async()=>{
  const data=await checked(await fetch('/api/auth/me',{credentials:'same-origin',cache:'no-store'}));
  if(typeof data.csrf!=='string'||!data.csrf)throw new Error('Session verification unavailable. Refresh and sign in again.');
  return data.csrf;
};

export const StagingStudentRecordSetup:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const staging=window.location.hostname==='hiau-staging.totag.network';
  const allowed=staging&&currentUser.role==='super_admin';
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [programs,setPrograms]=useState<Program[]>([]);
  const [terms,setTerms]=useState<Term[]>([]);
  const [accountId,setAccountId]=useState('');
  const [programId,setProgramId]=useState('');
  const [termId,setTermId]=useState('');
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [created,setCreated]=useState<any>(null);

  const load=async()=>{
    if(!allowed)return;
    setLoading(true);setError('');
    try{
      const data=await checked(await fetch('/api/workspaces/staging-student-setup',{
        credentials:'same-origin',cache:'no-store',
      }));
      const a=Array.isArray(data.accounts)?data.accounts:[];
      const p=Array.isArray(data.programs)?data.programs:[];
      const t=Array.isArray(data.terms)?data.terms:[];
      setAccounts(a);setPrograms(p);setTerms(t);
      setAccountId(current=>{
        if(current&&a.some((x:Account)=>x.id===current))return current;
        const michael=a.find((x:Account)=>/michael\s+gwoah/i.test(x.name));
        return (michael||a[0])?.id||'';
      });
      setProgramId(current=>current&&p.some((x:Program)=>x.id===current)?current:p[0]?.id||'');
      setTermId(current=>current&&t.some((x:Term)=>x.id===current)?current:t[0]?.id||'');
    }catch(e){setError(e instanceof Error?e.message:'Unable to load staging setup options.');}
    finally{setLoading(false);}
  };

  useEffect(()=>{void load();},[currentUser.id,allowed]);

  const account=useMemo(()=>accounts.find(x=>x.id===accountId),[accounts,accountId]);
  const program=useMemo(()=>programs.find(x=>x.id===programId),[programs,programId]);
  const term=useMemo(()=>terms.find(x=>x.id===termId),[terms,termId]);

  const create=async()=>{
    if(!account||!program||!term||busy)return;
    if(!window.confirm(
      'Create one admitted ACTIVE STAGING TEST student record for '+account.name+
      ' ('+account.email+') in '+program.title+' for '+term.title+'? '+
      'This creates no grades, registrations, invoices, aid awards or payments.'
    ))return;
    setBusy(true);setError('');setMessage('');setCreated(null);
    try{
      const token=await csrf();
      const data=await checked(await fetch('/api/workspaces/staging-student-setup',{
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','x-csrf-token':token},
        body:JSON.stringify({accountId:account.id,programId:program.id,termId:term.id}),
      }));
      setCreated(data.student);
      setMessage(data.message||'Staging test student record created and linked.');
      await load();
    }catch(e){setError(e instanceof Error?e.message:'Could not create staging test student record.');}
    finally{setBusy(false);}
  };

  if(!allowed)return null;
  return <section aria-label="Staging test student record setup"
    className="mt-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-800">Staging acceptance utility</p>
        <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-[#4A1249]"><UserCheck className="h-5 w-5"/> Link a real test login to an admitted student record</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This utility exists only on hiau-staging.totag.network. It creates one clearly marked admitted/active test record
          for an existing Student login and links it by the login's actual email. It does not create grades, registrations,
          bills, aid decisions or payments.
        </p>
      </div>
      <button type="button" onClick={()=>void load()} disabled={loading||busy}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-2 text-sm font-semibold text-[#4A1249] disabled:opacity-50">
        <RefreshCw className="h-4 w-4"/> Refresh candidates
      </button>
    </div>

    {error&&<p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {message&&<p role="status" className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">{message}</p>}
    {created&&<div className="mt-4 rounded-lg border border-emerald-300 bg-white p-4 text-sm">
      <p className="flex items-center gap-2 font-bold text-emerald-900"><CheckCircle2 className="h-4 w-4"/> Linked staging student</p>
      <p className="mt-2"><strong>{created.studentNumber}</strong> · {created.fullName} · {created.programTitle} · {created.termTitle}</p>
      <p className="mt-1 text-xs text-slate-600">Ask the student to reopen/refresh the Student PWA. The workspace should now load the linked server-authorized record.</p>
    </div>}

    <div className="mt-5 grid gap-3 lg:grid-cols-3">
      <label className="text-sm font-semibold">Existing unlinked Student login
        <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
          value={accountId} onChange={e=>setAccountId(e.target.value)}>
          <option value="">Select test student account</option>
          {accounts.map(a=><option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">HIAU program
        <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
          value={programId} onChange={e=>setProgramId(e.target.value)}>
          <option value="">Select program</option>
          {programs.map(p=><option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">Open admitted term
        <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
          value={termId} onChange={e=>setTermId(e.target.value)}>
          <option value="">Select open term</option>
          {terms.map(t=><option key={t.id} value={t.id}>{t.code} — {t.title}</option>)}
        </select>
      </label>
    </div>

    {!loading&&!accounts.length&&<p className="mt-4 text-sm text-slate-700">
      No unlinked activated Student login is available. Create/activate a staging Student account first.
    </p>}
    {!loading&&!programs.length&&<p className="mt-4 text-sm text-red-800">No HIAU program exists in the operational database.</p>}
    {!loading&&!terms.length&&<p className="mt-4 text-sm text-red-800">No academic term is currently open. Registrar must open a term before this acceptance fixture can be created.</p>}

    <button type="button" onClick={()=>void create()} disabled={busy||loading||!account||!program||!term}
      className="mt-5 rounded-lg bg-[#4A1249] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
      {busy?'Creating and linking…':'Create admitted staging record & link account'}
    </button>
  </section>;
};
