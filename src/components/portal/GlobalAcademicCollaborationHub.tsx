import React,{useEffect,useMemo,useState} from 'react';
import {
  ArrowRight,BookOpen,Building2,CalendarDays,FlaskConical,Globe2,
  GraduationCap,Library,ShieldCheck,Video,Wifi,
} from 'lucide-react';
import type {UserProfile} from '../../types';
import {isPortalModuleAvailable,type PortalModuleId} from '../../portal/moduleRegistry';

type Props={
  currentUser:UserProfile;
  openModule:(id:PortalModuleId)=>void;
};
type HubStat={label:string;value:string};
type Capability={
  title:string;
  description:string;
  status:'available'|'foundation'|'demo'|'planned';
  module?:PortalModuleId;
  icon:React.ElementType;
  roles?:string[];
};
const statusLabel={
  available:'Available now',
  foundation:'Foundation available',
  demo:'Demonstration only',
  planned:'Planned next phase',
} as const;
const statusClass={
  available:'border-emerald-300 bg-emerald-50 text-emerald-900',
  foundation:'border-amber-300 bg-amber-50 text-amber-950',
  demo:'border-sky-300 bg-sky-50 text-sky-900',
  planned:'border-slate-300 bg-slate-50 text-slate-700',
} as const;
const read=async(response:Response)=>{
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'Unable to load collaboration information.');
  return data;
};

export const GlobalAcademicCollaborationHub:React.FC<Props>=({currentUser,openModule})=>{
  const role=currentUser.role;
  const [stats,setStats]=useState<HubStat[]>([]);
  const [context,setContext]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      setLoading(true);setError('');
      try{
        if(role==='super_admin'){
          const [partners,resources]=await Promise.all([
            read(await fetch('/api/institutional-partners',{cache:'no-store'})),
            read(await fetch('/api/partner-collaboration/resources',{cache:'no-store'})),
          ]);
          if(!active)return;
          const p=Array.isArray(partners.partners)?partners.partners:[];
          const r=Array.isArray(resources.resources)?resources.resources:[];
          setStats([
            {label:'Active partners',value:String(p.filter((x:any)=>x.status==='active').length)},
            {label:'Partner records',value:String(p.length)},
            {label:'Resources awaiting review',value:String(r.filter((x:any)=>x.status==='submitted').length)},
            {label:'Approved resources',value:String(r.filter((x:any)=>x.status==='approved').length)},
          ]);
          setContext('University-wide governance view');
        }else if(role==='partner_representative'){
          const [profile,resources]=await Promise.all([
            read(await fetch('/api/partner-collaboration/me',{cache:'no-store'})),
            read(await fetch('/api/partner-collaboration/resources',{cache:'no-store'})),
          ]);
          if(!active)return;
          const r=Array.isArray(resources.resources)?resources.resources:[];
          setStats([
            {label:'Your submissions',value:String(r.length)},
            {label:'Awaiting HIAU review',value:String(r.filter((x:any)=>x.status==='submitted').length)},
            {label:'Approved',value:String(r.filter((x:any)=>x.status==='approved').length)},
          ]);
          setContext(profile.institution?.name||'Approved partner institution');
        }else if(['student','lecturer','dean'].includes(role)){
          const library=await read(await fetch('/api/partner-distribution/library',{cache:'no-store'}));
          if(!active)return;
          const r=Array.isArray(library.resources)?library.resources:[];
          setStats([
            {label:'Authorized partner resources',value:String(r.length)},
            {label:'Role',value:role.replaceAll('_',' ')},
          ]);
          setContext(role==='student'?'Student learning access':'Faculty academic access');
        }else{
          setStats([]);setContext('Role-based collaboration overview');
        }
      }catch(e){
        if(active)setError(e instanceof Error?e.message:'Unable to load collaboration summary.');
      }finally{if(active)setLoading(false);}
    };
    void load();
    return()=>{active=false;};
  },[currentUser.id,role]);

  const capabilities=useMemo<Capability[]>(()=>[
    {
      title:'Online & Hybrid Learning',
      description:'Virtual classroom workspace, low-bandwidth controls and asynchronous learning foundation. Live synchronized teaching, recording, attendance and assessment remain under development.',
      status:'demo',module:'classroom',icon:Video,
      roles:['super_admin','student','lecturer','dean'],
    },
    {
      title:'Institutional Partnerships',
      description:'Verify partner institutions, record agreements, define permitted academic activities, authorize representatives and suspend access when agreements change.',
      status:'available',module:'partners',icon:Building2,roles:['super_admin'],
    },
    {
      title:'Partner Academic Resource Exchange',
      description:'Approved partner representatives can submit lessons, lectures, symposium material, research and library resources for HIAU academic review.',
      status:'available',module:'partner_resources',icon:BookOpen,
      roles:['super_admin','partner_representative'],
    },
    {
      title:'Partner Academic Library',
      description:'Named HIAU students and faculty can access only resources covered by active agreements, licensing, academic approval and individual authorization.',
      status:'available',module:'partner_library',icon:Library,
      roles:['super_admin','student','lecturer','dean'],
    },
    {
      title:'Licensing, Rights & Distribution',
      description:'HIAU administrators separately verify distribution rights, set expiry dates, grant named-user access, revoke permissions and withdraw resources.',
      status:'available',module:'partner_distribution',icon:ShieldCheck,roles:['super_admin'],
    },
    {
      title:'Collaborative Research',
      description:'Research submissions can be shared and reviewed now. Full project workspaces, investigators, milestones, datasets, ethics review and co-publication workflows are the next research phase.',
      status:'foundation',module:role==='partner_representative'?'partner_resources':role==='super_admin'?'partner_resources':undefined,icon:FlaskConical,
      roles:['super_admin','partner_representative','lecturer','dean'],
    },
    {
      title:'International Lectures & Symposiums',
      description:'Symposium and lecture resources can already enter the approval pipeline. Event registration, live streaming, attendance, recordings and certificates are not yet live.',
      status:'foundation',module:role==='partner_representative'?'partner_resources':role==='super_admin'?'partner_resources':undefined,icon:CalendarDays,
      roles:['super_admin','partner_representative','student','lecturer','dean'],
    },
    {
      title:'Academic Credit Recognition',
      description:'Partner participation never creates HIAU credit automatically. A separate curriculum-mapping, academic approval and Registrar-controlled recognition workflow is planned.',
      status:'planned',icon:GraduationCap,
      roles:['super_admin','student','lecturer','dean','partner_representative'],
    },
  ],[role]);

  const visible=capabilities.filter(item=>!item.roles||item.roles.includes(role));
  return <section className="mx-auto max-w-7xl space-y-5 text-[#28152F]" aria-labelledby="global-collaboration-title">
    <header className="overflow-hidden rounded-2xl border border-[#DED2E2] bg-white shadow-sm">
      <div className="bg-[#4A1249] px-5 py-6 text-white sm:px-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D6AF58]">HIAU Global Academic Collaboration & Digital Learning Hub</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2 id="global-collaboration-title" className="text-2xl font-extrabold sm:text-3xl">Learning, research and institutional collaboration in one governed workspace</h2>
            <p className="mt-3 text-sm leading-6 text-purple-100">
              HIAU integrates online and hybrid learning with approved institutional partnerships, academic resources,
              research exchange and digital-library access. Access remains controlled by enrollment, roles, agreements,
              licensing and academic approval.
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <p className="font-semibold">{context||'Loading collaboration context…'}</p>
            <p className="mt-1 text-xs text-purple-100">Staging workspace · no automatic academic credit</p>
          </div>
        </div>
      </div>
      <div className="grid gap-px bg-[#E7DEE9] sm:grid-cols-2 lg:grid-cols-4">
        {(loading?[{label:'Loading',value:'…'}]:stats).map(item=>
          <div key={item.label} className="bg-white px-5 py-4">
            <p className="text-2xl font-extrabold text-[#4A1249]">{item.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{item.label}</p>
          </div>)}
      </div>
    </header>

    {error&&<p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      Collaboration summary could not be refreshed: {error}. Role permissions still control the modules below.
    </p>}

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Digital learning and collaboration capabilities">
      {visible.map(item=>{
        const Icon=item.icon;
        const canOpen=item.module&&isPortalModuleAvailable(role,item.module);
        return <article key={item.title} className="flex min-h-[235px] flex-col rounded-2xl border border-[#E3D9E6] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex rounded-xl bg-[#F4ECF5] p-3 text-[#4A1249]"><Icon className="h-6 w-6" aria-hidden="true"/></span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass[item.status]}`}>{statusLabel[item.status]}</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#35103B]">{item.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">{item.description}</p>
          {canOpen?<button type="button" onClick={()=>openModule(item.module!)}
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#35103B]">
            Open workspace <ArrowRight className="h-4 w-4" aria-hidden="true"/>
          </button>:<p className="mt-4 text-xs font-semibold text-slate-500">
            {item.status==='planned'?'Governed workflow not yet enabled for this role.':'Access is managed according to your assigned HIAU role.'}
          </p>}
        </article>;
      })}
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-[#DCD0E0] bg-[#FAF7FB] p-5">
        <div className="flex items-center gap-2 text-[#4A1249]"><Globe2 className="h-5 w-5"/><h3 className="font-bold">Institutional collaboration model</h3></div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Partner institutions remain separate from HIAU internal ERP access. Shared academic activity requires an active agreement,
          verified representative, content review and the applicable licensing or distribution permission.
        </p>
      </article>
      <article className="rounded-2xl border border-[#DCD0E0] bg-[#FAF7FB] p-5">
        <div className="flex items-center gap-2 text-[#4A1249]"><Wifi className="h-5 w-5"/><h3 className="font-bold">Liberia-focused access design</h3></div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          The platform is being developed for mobile use and constrained connectivity. Current partner materials are link-out,
          permission-checked resources; adaptive live streaming and authorized offline learning packages remain future milestones.
        </p>
      </article>
    </section>
  </section>;
};
