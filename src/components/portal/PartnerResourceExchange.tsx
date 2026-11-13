import React,{useEffect,useState} from 'react';
import {BookOpen,RefreshCw} from 'lucide-react';
import type {UserProfile} from '../../types';

type Resource={id:string;title:string;kind:string;summary:string;status:string;submitted_at:string;reviewer_note?:string;institution_name?:string;source_url?:string;license_statement?:string};
const style='w-full rounded-lg border border-[#CBBAD0] bg-white px-3 py-2.5 text-sm text-[#291632] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249]';
const btn='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#341034] disabled:cursor-not-allowed disabled:opacity-50';
const label='mb-1 block text-sm font-semibold text-[#35103B]';
const types=[['lesson','Lesson'],['lecture','Guest lecture'],['symposium','Symposium'],['research','Research'],['library','Library resource']] as const;
const blank={kind:'lecture',title:'',summary:'',sourceUrl:'',licenseStatement:'',rightsConfirmed:false};
const result=async(response:Response)=>{const data=await response.json().catch(()=>({error:'Unable to read server response.'}));if(!response.ok)throw Error(data.error||'Request failed.');return data;};
export const PartnerResourceExchange:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const isAdmin=currentUser.role==='super_admin';
  const isPartner=currentUser.role==='partner_representative';
  const [resources,setResources]=useState<Resource[]>([]);
  const [institution,setInstitution]=useState('');
  const [form,setForm]=useState(blank);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const load=async()=>{
    setLoading(true);setError('');
    try{
      if(isPartner){
        const profile=await result(await fetch('/api/partner-collaboration/me',{cache:'no-store'}));
        setInstitution(profile.institution.name);
      }
      const data=await result(await fetch('/api/partner-collaboration/resources',{cache:'no-store'}));
      setResources(data.resources);
    }catch(e){setError(e instanceof Error?e.message:'Unable to load resources.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[currentUser.id]);
  const post=async(url:string,body:unknown,success:string)=>{
    setBusy(true);setError('');setMessage('');
    try{
      await result(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
      setMessage(success);
      const data=await result(await fetch('/api/partner-collaboration/resources',{cache:'no-store'}));
      setResources(data.resources);
      if(isPartner)setForm(blank);
    }catch(e){setError(e instanceof Error?e.message:'Unable to submit this request.');}
    finally{setBusy(false);}
  };
  if(!isAdmin&&!isPartner)return <p role="alert">This workspace is not available for your account.</p>;
  return <section className="mx-auto max-w-6xl space-y-5 text-[#27152F]" aria-labelledby="partner-resource-heading">
    <header className="rounded-xl border border-[#E5DCE8] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#977039]">HIAU Global Academic Collaboration</p>
      <h2 id="partner-resource-heading" className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#35103B]"><BookOpen/> Academic Resource Exchange</h2>
      <p className="mt-2 text-sm text-slate-700">{isPartner
        ? 'Submit authorized academic resources from '+institution+'. Every resource requires university review before any future distribution.'
        : 'Review and approve partner-submitted learning and research resources. Approval does not make them publicly available or grant student access.'}</p>
      <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#CBBAD0] px-3 py-2 text-sm font-semibold text-[#4A1249]" onClick={()=>void load()}><RefreshCw size={16}/> Refresh</button>
    </header>
    {error&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {message&&<p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">{message}</p>}
    {isPartner&&<form className="grid gap-4 rounded-xl border border-[#E5DCE8] bg-white p-5 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();void post('/api/partner-collaboration/resources',form,'Resource submitted for HIAU review.');}}>
      <h3 className="text-lg font-bold text-[#35103B] sm:col-span-2">Submit a resource for academic review</h3>
      <label><span className={label}>Resource type</span><select className={style} value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}>{types.map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label>
      <label><span className={label}>Title</span><input required maxLength={200} className={style} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label className="sm:col-span-2"><span className={label}>Academic description</span><textarea required maxLength={2000} rows={3} className={style} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></label>
      <label><span className={label}>Approved HTTPS resource URL</span><input type="url" required placeholder="https://institution.example/resource" className={style} maxLength={1500} value={form.sourceUrl} onChange={e=>setForm({...form,sourceUrl:e.target.value})}/></label>
      <label><span className={label}>Copyright / license declaration</span><input required className={style} maxLength={500} value={form.licenseStatement} onChange={e=>setForm({...form,licenseStatement:e.target.value})}/></label>
      <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2"><input type="checkbox" required className="mt-1 accent-[#4A1249]" checked={form.rightsConfirmed} onChange={e=>setForm({...form,rightsConfirmed:e.target.checked})}/>I confirm this institution has permission to share this academic material with HIAU for review.</label>
      <div className="sm:col-span-2"><button className={btn} disabled={busy||!form.rightsConfirmed}>Submit for review</button></div>
    </form>}
    <section className="rounded-xl border border-[#E5DCE8] bg-white p-5" aria-label="Academic resource submissions">
      <h3 className="text-lg font-bold text-[#35103B]">{isAdmin?'Academic review queue':'Institution submissions'} ({resources.length})</h3>
      {loading?<p className="mt-3 text-sm">Loading submissions…</p>:resources.length===0?<p className="mt-3 text-sm text-slate-600">No submissions recorded.</p>:<div className="mt-4 space-y-3">{resources.map(item=>
        <article key={item.id} className="rounded-xl border border-[#E5DCE8] p-4">
          <div className="flex flex-wrap justify-between gap-2"><h4 className="font-semibold text-[#35103B]">{item.title}</h4><span className="rounded bg-[#F4EDF5] px-2 py-1 text-xs font-bold capitalize text-[#4A1249]">{item.status}</span></div>
          <p className="mt-1 text-xs text-slate-600">{item.institution_name?item.institution_name+' · ':''}{item.kind} · {item.submitted_at.slice(0,10)}</p>
          <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
          {item.reviewer_note&&<p className="mt-2 text-sm text-slate-700">Review: {item.reviewer_note}</p>}
          {isAdmin&&item.status==='submitted'&&<form className="mt-4 space-y-2 border-t pt-3" onSubmit={e=>e.preventDefault()}>
            <label><span className={label}>Review note / decision rationale</span><textarea required rows={2} className={style} value={notes[item.id]||''} onChange={e=>setNotes({...notes,[item.id]:e.target.value})}/></label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn} disabled={busy||!notes[item.id]?.trim()} onClick={()=>void post('/api/partner-collaboration/admin/resources/'+item.id+'/review',{decision:'approved',note:notes[item.id]},'Resource approved for future controlled distribution.')}>Approve</button>
              <button type="button" className="min-h-10 rounded-lg border border-[#A580A8] px-4 py-2 text-sm font-semibold text-[#4A1249]" disabled={busy||!notes[item.id]?.trim()} onClick={()=>void post('/api/partner-collaboration/admin/resources/'+item.id+'/review',{decision:'rejected',note:notes[item.id]},'Resource rejected with reasons.')}>Reject</button>
            </div>
          </form>}
          {isAdmin&&item.status==='approved'&&<button type="button" disabled={busy} className="mt-3 min-h-10 rounded-lg border border-[#A580A8] px-4 py-2 text-sm font-semibold text-[#4A1249]" onClick={()=>void post('/api/partner-collaboration/admin/resources/'+item.id+'/withdraw',{},'Resource withdrawn.')}>Withdraw approval</button>}
        </article>)}</div>}
    </section>
  </section>;
};
