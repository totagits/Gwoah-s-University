import crypto from 'node:crypto';
import type {Express,Response} from 'express';
import {actorOf} from './identity';
import {Operations,WorkflowError} from './operations';
import {COLLEGE_SCIENCE_REFERENCES,COLLEGE_SCIENCE_SOURCE_TITLE,COLLEGE_SCIENCE_COLLEGE} from './collegeScienceReferences';
import degreeNarrations from '../scripts/hiau-degree-video-content.json';
import {validateCurriculum} from './curriculumValidation';

const editor=(res:Response)=>['super_admin','registrar'].includes(actorOf(res)?.role||'');
const approver=(res:Response)=>actorOf(res)?.role==='super_admin';
const val=(value:unknown,label:string,max=180)=>{
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)
    throw new WorkflowError(label+' is required (max '+max+' characters).');
  return value.trim();
};
const optional=(value:unknown,max=1200)=>{
  if(value==null||value==='')return '';
  if(typeof value!=='string'||value.length>max)throw new WorkflowError('Invalid optional text.');
  return value.trim();
};
const half=(input:unknown,label:string,allowZero=true)=>{
  const n=Number(input);
  if(input==null||input===''||!Number.isFinite(n)||n<0||n>300||!Number.isInteger(n*2)||(!allowZero&&n===0))
    throw new WorkflowError(label+' must be a nonnegative number in increments of 0.5.');
  return Math.round(n*2);
};
const statusError=(e:unknown,res:Response)=>{
  const x=e instanceof WorkflowError?e:new WorkflowError('Curriculum operation could not be saved.',500);
  return res.status(x.status).json({error:x.message});
};
const categories=['general','college','major','minor','elective'] as const;
const requireDraft=(store:Operations,id:string)=>{
  const program=store.one('SELECT * FROM curriculum_programs WHERE id=?',id);
  if(!program)throw new WorkflowError('Curriculum program not found.',404);
  if(program.status!=='draft')throw new WorkflowError('Return the program to Draft before modifying it.',409);
  return program;
};
const record=(store:Operations,actorId:string,action:string,entity:string,details:unknown)=>{
  store.audit(actorId,action,entity,null,details);
};


const slug=(value:string)=>value.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const publicationRoutes=new Map(degreeNarrations.degrees.map(item=>[
  item.college+'--'+slug(item.name),item.name,
]));
const byPublicRoute=(route:string)=>{
  const title=publicationRoutes.get(route);
  if(!title)throw new WorkflowError('Public degree route not found.',404);
  return title;
};
const selectPublished=(store:Operations,route:string)=>{
  const row=store.one('SELECT snapshot_json FROM curriculum_publications WHERE degree_route=? AND withdrawn_at IS NULL',route);
  return row?JSON.parse(row.snapshot_json):null;
};

export function installCurriculumStudio(app:Express,store:Operations){
  app.get('/api/curriculum/programs/:id/readiness',(_req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try{
      const program=store.one('SELECT * FROM curriculum_programs WHERE id=?',_req.params.id);
      if(!program)throw new WorkflowError('Curriculum program not found.',404);
      const courses=store.all('SELECT * FROM curriculum_courses WHERE program_id=? ORDER BY year,semester,code',program.id);
      return res.json(validateCurriculum(program,courses));
    }catch(e){return statusError(e,res);}
  });

  // Explicit, read-only public API: exposes a curated immutable snapshot, never draft notes,
  // internal reviewer identities, unpublished program records or source discrepancies.
  app.get('/api/public/degree-curriculum/:route', (req,res)=>{
    try{
      byPublicRoute(req.params.route);
      const published=selectPublished(store,req.params.route);
      res.set('Cache-Control','public, max-age=30');
      return res.json({published});
    }catch(e){return statusError(e,res);}
  });
  app.post('/api/curriculum/programs/:id/publish',(req,res)=>{
    if(!approver(res))return res.sendStatus(403);
    try{
      const actor=actorOf(res)!;
      if(req.body?.confirmation!=='PUBLISH_PUBLIC_CURRICULUM')
        throw new WorkflowError('Explicit publication confirmation required.');
      const effectiveYear=val(req.body?.effectiveYear,'Effective academic year',32);
      if(!/^20[2-9][0-9][\-/]20[2-9][0-9]$/.test(effectiveYear))
        throw new WorkflowError('Use an academic year such as 2027-2028.');
      const program=store.one('SELECT * FROM curriculum_programs WHERE id=?',req.params.id);
      if(!program)throw new WorkflowError('Program not found.',404);
      if(program.status!=='approved'||!program.approved_by||!program.approved_at)
        throw new WorkflowError('Only approved curricula can be published.',409);
      if(program.code.startsWith('REF-')||program.notes.includes('SOURCE_REVIEW_REQUIRED'))
        throw new WorkflowError('Unresolved PDF references cannot be published.',409);
      const intendedRoutes=[...publicationRoutes.entries()].filter(([,name])=>name===program.name);
      if(intendedRoutes.length!==1)
        throw new WorkflowError('Program title must exactly match one unique listed public degree.',409);
      const route=intendedRoutes[0][0];
      const courses=store.all('SELECT code,title,category,credits_half,year,semester,prerequisite_codes FROM curriculum_courses WHERE program_id=? ORDER BY year,semester,code',program.id);
      if(!courses.length)throw new WorkflowError('No approved course sequence available.',409);
      const readiness=validateCurriculum(program,courses);
      if(!readiness.ready)throw new WorkflowError('Published curriculum must pass the full readiness audit.',409);
      for(const kind of ['general','college','major']){
        const subtotal=courses.filter(c=>c.category===kind).reduce((n,c)=>n+c.credits_half,0);
        if(subtotal!==program[kind+'_half'])
          throw new WorkflowError('Course-credit totals do not reconcile for '+kind,409);
      }
      if(program.general_half+program.college_half+program.major_half+program.minor_half+program.elective_half!==program.required_half)
        throw new WorkflowError('Program credits do not reconcile.',409);
      const snapshot={
        programName:program.name,programCode:program.code,credential:program.credential,
        college:program.college,requiredCredits:program.required_half/2,
        credits:{
          general:program.general_half/2,college:program.college_half/2,
          major:program.major_half/2,minor:program.minor_half/2,elective:program.elective_half/2,
        },effectiveYear,
        courses:courses.map(c=>({
          code:c.code,title:c.title,category:c.category,credits:c.credits_half/2,
          year:c.year,semester:c.semester,prerequisites:c.prerequisite_codes,
        })),
        releasedAt:new Date().toISOString(),
      };
      const outcome=store.transaction(()=>{
        const current=store.one('SELECT MAX(version) AS version FROM curriculum_publications WHERE degree_route=?',route);
        const nextVersion=(Number(current?.version)||0)+1;
        store.run('UPDATE curriculum_publications SET withdrawn_at=?,withdrawn_by=? WHERE degree_route=? AND withdrawn_at IS NULL',
          snapshot.releasedAt,actor.id,route);
        store.run('INSERT INTO curriculum_publications(id,program_id,degree_route,version,effective_year,snapshot_json,released_by,released_at) VALUES(?,?,?,?,?,?,?,?)',
          crypto.randomUUID(),program.id,route,nextVersion,effectiveYear,JSON.stringify({...snapshot,version:nextVersion}),actor.id,snapshot.releasedAt);
        record(store,actor.id,'CURRICULUM_PUBLIC_RELEASE',program.id,{route,version:nextVersion,effectiveYear});
        return {route,version:nextVersion};
      });
      return res.status(201).json({success:true,...outcome});
    }catch(e){return statusError(e,res);}
  });
  app.post('/api/curriculum/programs/:id/withdraw',(req,res)=>{
    if(!approver(res))return res.sendStatus(403);
    try{
      if(req.body?.confirmation!=='WITHDRAW_PUBLIC_CURRICULUM')
        throw new WorkflowError('Explicit withdrawal confirmation required.');
      const active=store.one('SELECT * FROM curriculum_publications WHERE program_id=? AND withdrawn_at IS NULL',req.params.id);
      if(!active)throw new WorkflowError('No active publication for that program.',404);
      const actor=actorOf(res)!;
      store.transaction(()=>{
        store.run('UPDATE curriculum_publications SET withdrawn_at=?,withdrawn_by=? WHERE id=?',
          new Date().toISOString(),actor.id,active.id);
        record(store,actor.id,'CURRICULUM_PUBLIC_WITHDRAW',req.params.id,{route:active.degree_route,version:active.version});
      });
      return res.json({success:true,route:active.degree_route});
    }catch(e){return statusError(e,res);}
  });

  app.get('/api/curriculum/reference/college-science',(_req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    const items=COLLEGE_SCIENCE_REFERENCES.map(p=>({
      code:p.code,name:p.name,page:p.page,sourceTotal:p.total,
      draftCourseCount:p.courses.length,notes:p.notes,
      alreadyImported:!!store.one('SELECT id FROM curriculum_programs WHERE code=?',p.code),
    }));
    return res.json({source:COLLEGE_SCIENCE_SOURCE_TITLE,programs:items,
      warning:'Source-referenced candidates only. REF-* codes are provisional; source conflicts require Registrar reconciliation.'});
  });
  app.post('/api/curriculum/reference/college-science/import',(req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    if(req.body?.confirmation!=='IMPORT_UNVERIFIED_DRAFTS')
      return res.status(400).json({error:'Confirm the source review draft import explicitly.'});
    try{
      const actor=actorOf(res)!;
      const result=store.transaction(()=>{
        let imported=0,skipped=0,courses=0;
        for(const p of COLLEGE_SCIENCE_REFERENCES){
          if(store.one('SELECT id FROM curriculum_programs WHERE code=?',p.code)){skipped++;continue;}
          const identifier=crypto.randomUUID(),time=new Date().toISOString();
          const row={
            id:identifier,code:p.code,name:p.name,college:COLLEGE_SCIENCE_COLLEGE,
            credential:p.credential,general_half:p.general*2,college_half:p.college*2,
            major_half:p.major*2,minor_half:p.minor*2,elective_half:p.elective*2,
            required_half:p.total*2,status:'draft',source_title:COLLEGE_SCIENCE_SOURCE_TITLE,
            source_page:p.page,notes:p.notes,created_by:actor.id,updated_at:time,
            approved_by:null,approved_at:null,
          };
          store.run('INSERT INTO curriculum_programs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',...Object.values(row));
          for(const c of p.courses){
            const course={
              id:crypto.randomUUID(),program_id:identifier,code:c.code,title:c.title,
              category:c.category,credits_half:c.credits*2,year:c.year,semester:c.semester,
              prerequisite_codes:'',source_page:c.page,notes:'Source example; not complete or approved.',
              created_at:time,
            };
            store.run('INSERT INTO curriculum_courses VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',...Object.values(course));
            courses++;
          }
          store.audit(actor.id,'CURRICULUM_REFERENCE_IMPORT',identifier,null,{
            source:COLLEGE_SCIENCE_SOURCE_TITLE,program:p.code,exampleCourses:p.courses.length,
            reviewRequired:true,
          });
          imported++;
        }
        return {imported,skipped,courseSamples:courses};
      });
      return res.status(201).json({success:true,...result});
    }catch(e){return statusError(e,res);}
  });
  app.get('/api/curriculum/programs',(_req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try {
      const programs=store.all('SELECT * FROM curriculum_programs ORDER BY updated_at DESC,name');
      const courses=store.all('SELECT * FROM curriculum_courses ORDER BY year,semester,code,title');
      const publications=store.all('SELECT program_id,degree_route,version,effective_year,released_at FROM curriculum_publications WHERE withdrawn_at IS NULL');
      return res.json({programs,courses,publications});
    } catch(e){return statusError(e,res);}
  });
  app.post('/api/curriculum/programs',(req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try {
      const d=req.body||{};
      const totals=categories.map(k=>half(d[k+'Credits'],k+' credits'));
      const total=half(d.requiredCredits,'Total required credits',false);
      if(totals.reduce((a,b)=>a+b,0)!==total)
        throw new WorkflowError('Credit breakdown must equal the total required credits.');
      const actor=actorOf(res)!;
      const id=crypto.randomUUID(), timestamp=new Date().toISOString();
      const code=val(d.code,'Program code',32).toUpperCase();
      const program={
        id,code,name:val(d.name,'Program name'),college:val(d.college,'College'),
        credential:val(d.credential,'Award or credential',80),
        general_half:totals[0],college_half:totals[1],major_half:totals[2],
        minor_half:totals[3],elective_half:totals[4],required_half:total,
        status:'draft',source_title:val(d.sourceTitle,'Source document',220),
        source_page:optional(d.sourcePage,32),notes:optional(d.notes),created_by:actor.id,
        updated_at:timestamp,approved_by:null,approved_at:null,
      };
      store.transaction(()=>{
        store.run('INSERT INTO curriculum_programs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          ...Object.values(program));
        record(store,actor.id,'CURRICULUM_DRAFT_CREATE',id,{code});
      });
      return res.status(201).json({program});
    }catch(e:any){
      if(/UNIQUE constraint/.test(e?.message||''))return res.status(409).json({error:'That curriculum program code already exists.'});
      return statusError(e,res);
    }
  });
  app.patch('/api/curriculum/programs/:id',(req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try{
      const d=req.body||{};
      const old=requireDraft(store,req.params.id);
      const totals=categories.map(k=>half(d[k+'Credits'],k+' credits'));
      const total=half(d.requiredCredits,'Total required credits',false);
      if(totals.reduce((a,b)=>a+b,0)!==total)
        throw new WorkflowError('Credit breakdown must equal the total required credits.');
      const name=val(d.name,'Program name'), college=val(d.college,'College');
      const code=val(d.code,'Program code',32).toUpperCase();
      const credential=val(d.credential,'Award or credential',80);
      const source=val(d.sourceTitle,'Source document',220);
      store.transaction(()=>{
        store.run('UPDATE curriculum_programs SET code=?,name=?,college=?,credential=?,general_half=?,college_half=?,major_half=?,minor_half=?,elective_half=?,required_half=?,source_title=?,source_page=?,notes=?,updated_at=? WHERE id=?',
          code,name,college,credential,...totals,total,source,optional(d.sourcePage,32),optional(d.notes),new Date().toISOString(),old.id);
        record(store,actorOf(res)!.id,'CURRICULUM_DRAFT_EDIT',old.id,{name});
      });
      return res.json({success:true});
    }catch(e){return statusError(e,res);}
  });
  app.post('/api/curriculum/programs/:id/courses',(req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try {
      const d=req.body||{};
      const program=requireDraft(store,req.params.id);
      const category=val(d.category,'Course category',20);
      if(!categories.includes(category as any))throw new WorkflowError('Invalid course category.');
      const year=Number(d.year),semester=Number(d.semester);
      if(!Number.isInteger(year)||year<1||year>6||!Number.isInteger(semester)||semester<1||semester>3)
        throw new WorkflowError('Choose a valid study year and semester.');
      const row={
        id:crypto.randomUUID(),program_id:program.id,code:val(d.code,'Course code',32).toUpperCase(),
        title:val(d.title,'Course title'),category,credits_half:half(d.credits,'Course credits',false),
        year,semester,prerequisite_codes:optional(d.prerequisites,350).toUpperCase(),
        source_page:optional(d.sourcePage,32),notes:optional(d.notes),created_at:new Date().toISOString(),
      };
      store.transaction(()=>{
        store.run('INSERT INTO curriculum_courses VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',...Object.values(row));
        store.run('UPDATE curriculum_programs SET updated_at=? WHERE id=?',new Date().toISOString(),program.id);
        record(store,actorOf(res)!.id,'CURRICULUM_COURSE_ADD',row.id,{program:program.code,code:row.code});
      });
      return res.status(201).json({course:row});
    }catch(e:any){
      if(/UNIQUE constraint/.test(e?.message||''))return res.status(409).json({error:'This course code already exists in that year and semester.'});
      return statusError(e,res);
    }
  });
  app.delete('/api/curriculum/programs/:id/courses/:courseId', (req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try {
      const program=requireDraft(store,req.params.id);
      const course=store.one('SELECT * FROM curriculum_courses WHERE id=? AND program_id=?',req.params.courseId,program.id);
      if(!course)throw new WorkflowError('Curriculum course not found.',404);
      store.transaction(()=>{
        store.run('DELETE FROM curriculum_courses WHERE id=?',course.id);
        store.run('UPDATE curriculum_programs SET updated_at=? WHERE id=?',new Date().toISOString(),program.id);
        record(store,actorOf(res)!.id,'CURRICULUM_COURSE_REMOVE',course.id,{code:course.code,program:program.code});
      });
      return res.json({success:true});
    }catch(e){return statusError(e,res);}
  });
  app.post('/api/curriculum/programs/:id/status',(req,res)=>{
    if(!editor(res))return res.sendStatus(403);
    try{
      const desired=req.body?.status;
      const program=store.one('SELECT * FROM curriculum_programs WHERE id=?',req.params.id);
      if(!program)throw new WorkflowError('Curriculum program not found.',404);
      if(desired==='in_review'){
        if(program.status!=='draft')throw new WorkflowError('Only drafts can enter review.',409);
        if(program.code.startsWith('REF-') || program.notes.includes('SOURCE_REVIEW_REQUIRED'))
          throw new WorkflowError('Resolve reference program code and document discrepancies before submitting for review.',409);
        if(!store.one('SELECT id FROM curriculum_courses WHERE program_id=? LIMIT 1',program.id))
          throw new WorkflowError('Enter curriculum courses before requesting approval.');
      }else if(desired==='approved'){
        if(!approver(res))throw new WorkflowError('Super Administrator approval required.',403);
        if(program.status!=='in_review')throw new WorkflowError('The draft must be submitted for review first.',409);
        const courses=store.all('SELECT * FROM curriculum_courses WHERE program_id=?',program.id);
        const check=validateCurriculum(program,courses);
        if(!check.ready)
          throw new WorkflowError('Curriculum has '+check.errorCount+' readiness issue(s): '+check.findings.filter(f=>f.severity==='error').slice(0,2).map(f=>f.detail).join(' '),409);
      }else if(desired==='draft'){
        if(program.status==='draft')throw new WorkflowError('Program is already a draft.',409);
        if(!approver(res))throw new WorkflowError('Super Administrator must reopen the approved or reviewed draft.',403);
        if(store.one('SELECT id FROM curriculum_publications WHERE program_id=? AND withdrawn_at IS NULL',program.id))
          throw new WorkflowError('Withdraw the public publication before reopening the curriculum.',409);
      }else throw new WorkflowError('Unsupported curriculum status.');
      const actor=actorOf(res)!;
      store.transaction(()=>{
        store.run('UPDATE curriculum_programs SET status=?,updated_at=?,approved_by=?,approved_at=? WHERE id=?',
          desired,new Date().toISOString(),desired==='approved'?actor.id:null,
          desired==='approved'?new Date().toISOString():null,program.id);
        record(store,actor.id,'CURRICULUM_STATUS_CHANGE',program.id,{from:program.status,to:desired});
      });
      return res.json({success:true,status:desired});
    }catch(e){return statusError(e,res);}
  });
}
