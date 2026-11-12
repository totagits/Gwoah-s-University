import React,{useEffect,useState} from 'react';
import type {UserProfile} from '../../types';
import {BookOpen,ExternalLink,RefreshCw} from 'lucide-react';

type Item={id:string;title:string;kind:string;summary:string;institution_name:string;license_statement:string};
const api=async(response:Response)=>{
  const data=await response.json().catch(()=>({error:'The server did not return a readable response.'}));
  if(!response.ok)throw Error(data.error||'Request could not be completed.');
  return data;
};
// Source URLs are intentionally never present in the library listing.
// The URL is released by a separate per-click permission check.
export const PartnerAcademicLibrary:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const [resources,setResources]=useState<Item[]>([]);
  const [loading,setLoading]=useState(true);
  const [opening,setOpening]=useState('');
  const [error,setError]=useState('');
  const eligible=['student','lecturer','dean'].includes(currentUser.role);
  const load=async()=>{
    setLoading(true);setError('');
    try{
      const result=await api(await fetch('/api/partner-distribution/library',{cache:'no-store'}));
      setResources(result.resources);
    }catch(e){setError(e instanceof Error?e.message:'Unable to load authorized resources.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{if(eligible)void load();},[currentUser.id]);
  const open=async(id:string)=>{
    setOpening(id);setError('');
    try{
      const record=await api(await fetch('/api/partner-distribution/library/'+encodeURIComponent(id)+'/access',{cache:'no-store'}));
      // We intentionally navigate, not fetch/proxy/cache third-party content.
      // The publisher can impose additional authentication and license terms.
      window.location.assign(record.url);
    }catch(e){setError(e instanceof Error?e.message:'The resource is not currently available.');}
    finally{setOpening('');}
  };
  if(!eligible)return <section role="alert" className="rounded-lg bg-white p-5">This academic library is for authorized students and faculty.</section>;
  return <section aria-labelledby="partner-academic-library-title" className="mx-auto max-w-6xl space-y-5 text-[#28162F]">
    <header className="rounded-xl border border-[#E4DAE8] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#96713B]">HIAU Global Academic Collaboration</p>
      <h2 id="partner-academic-library-title" className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#4A1249]"><BookOpen/> Partner Academic Library</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">Here are academic resources individually authorized for your HIAU account. Availability depends on institutional agreements, copyright licenses and your current academic eligibility. External publishers may require a separate sign-in.</p>
      <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#CDBED1] bg-white px-4 py-2 text-sm font-semibold text-[#4A1249]" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> Refresh resources</button>
    </header>
    {error&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    <section aria-label="Authorized partner materials" className="grid gap-4 md:grid-cols-2">
      {loading?<p className="text-sm">Checking access permissions…</p>:resources.length===0?
        <div className="rounded-xl border border-[#E4DAE8] bg-white p-5 text-sm text-slate-700 md:col-span-2">No partner resources are currently assigned to your account. HIAU only displays material after institutional and academic approvals.</div>:
        resources.map(item=><article key={item.id} className="flex flex-col gap-3 rounded-xl border border-[#E4DAE8] bg-white p-5">
          <div><p className="text-xs font-bold uppercase tracking-wide text-[#956A32]">{item.kind} · {item.institution_name}</p>
            <h3 className="mt-2 text-lg font-bold text-[#35103B]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.summary}</p></div>
          <p className="text-xs text-slate-600"><strong>License:</strong> {item.license_statement}</p>
          <button type="button" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#341034] disabled:opacity-50" onClick={()=>void open(item.id)} disabled={Boolean(opening)}>
            <ExternalLink size={16}/>{opening===item.id?'Checking access…':'Open authorized resource'}
          </button>
        </article>)}
    </section>
  </section>;
};
