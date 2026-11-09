import crypto from 'node:crypto';
import type {Express,Response} from 'express';
import type {Actor} from './identity';
import {actorOf} from './identity';
import {Operations,WorkflowError} from './operations';

const limited=(v:unknown,name:string,max=200)=>{
  if(typeof v!=='string'||!v.trim()||v.length>max)throw new WorkflowError(name+' is required (maximum '+max+' characters).');
  return v.trim();
};
const validTime=(v:unknown)=>{
  const str=limited(v,'Scheduled time',40);
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(str)||!Number.isFinite(Date.parse(str)))
    throw new WorkflowError('Use an explicit date, time and time zone.');
  return new Date(str).toISOString();
};
const secureLink=(v:unknown,name:string,optional=false)=>{
  if((v==null||v==='')&&optional)return null;
  const text=limited(v,name,2000);
  let url:URL;
  try{url=new URL(text);}catch{throw new WorkflowError(name+' must be an HTTPS URL.');}
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname||/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)/i.test(url.hostname))
    throw new WorkflowError(name+' must be a public HTTPS URL without embedded credentials.');
  return url.toString();
};
const faculty=(role:string)=>['super_admin','lecturer','dean'].includes(role);
const allowedSection=(store:Operations,actor:Actor,sectionId:string,write:boolean)=>{
  const section=store.one('SELECT * FROM sections WHERE id=?',sectionId);
  if(!section)throw new WorkflowError('Class section does not exist.',404);
  if(faculty(actor.role)&&(actor.role==='super_admin'||section.lecturer_id===actor.id))return section;
  if(!write&&actor.role==='student'){
    const enrollment=store.one(
      "SELECT r.id FROM registrations r JOIN students s ON s.id=r.student_id WHERE s.user_id=? AND r.section_id=? AND r.status='enrolled'",
      actor.id,sectionId,
    );
    if(enrollment)return section;
  }
  throw new WorkflowError('Your account cannot access this class.',403);
};
const respond=(res:Response,error:unknown)=>{
  const exception=error instanceof WorkflowError?error:null;
  return res.status(exception?.status||500).json({error:exception?.message||'Classroom operation failed.'});
};

/**
 * This is a secure course-scoped learning foundation; it does NOT host video,
 * stream live media, grade assessments, or verify an external meeting provider.
 */
export function installOnlineLearning(app:Express,store:Operations){
  app.get('/api/classroom/state',(_req,res)=>{
    try{
      const actor=actorOf(res)!;
      if(!faculty(actor.role)&&actor.role!=='student')throw new WorkflowError('Classroom access requires an authorized student or instructor.',403);
      let sections:Record<string,any>[]=[];
      if(actor.role==='super_admin')sections=store.all(
        'SELECT s.*,c.code AS course_code,c.title AS course_title,t.title AS term_title,u.name AS instructor_name FROM sections s JOIN courses c ON c.id=s.course_id JOIN terms t ON t.id=s.term_id JOIN users u ON u.id=s.lecturer_id ORDER BY t.start_date DESC,c.code'
      );
      else if(faculty(actor.role))sections=store.all(
        'SELECT s.*,c.code AS course_code,c.title AS course_title,t.title AS term_title,u.name AS instructor_name FROM sections s JOIN courses c ON c.id=s.course_id JOIN terms t ON t.id=s.term_id JOIN users u ON u.id=s.lecturer_id WHERE s.lecturer_id=? ORDER BY t.start_date DESC,c.code',actor.id
      );
      else sections=store.all(
        "SELECT s.*,c.code AS course_code,c.title AS course_title,t.title AS term_title,u.name AS instructor_name FROM sections s JOIN courses c ON c.id=s.course_id JOIN terms t ON t.id=s.term_id JOIN users u ON u.id=s.lecturer_id JOIN registrations r ON r.section_id=s.id JOIN students st ON st.id=r.student_id WHERE st.user_id=? AND r.status='enrolled' ORDER BY t.start_date DESC,c.code",actor.id
      );
      const ids=sections.map(s=>s.id);
      const placeholders=ids.map(()=>'?').join(',')||'NULL';
      const sessions=store.all(`SELECT id,section_id,title,starts_at,ends_at,meeting_url,notes,created_at FROM class_sessions WHERE section_id IN(${placeholders}) ORDER BY starts_at DESC`,...ids);
      const resources=store.all(`SELECT id,section_id,title,kind,url,description,published_at FROM class_resources WHERE section_id IN(${placeholders}) ORDER BY published_at DESC`,...ids);
      const self=actor.role==='student'?store.one('SELECT id FROM students WHERE user_id=?',actor.id):null;
      const attendance=self?store.all(`SELECT a.session_id,a.checked_in_at FROM class_attendance a JOIN class_sessions m ON a.session_id=m.id WHERE a.student_id=? AND m.section_id IN(${placeholders})`,self.id,...ids):[];
      const attendanceCount=faculty(actor.role)?store.all(`SELECT a.session_id,COUNT(*) AS attended FROM class_attendance a JOIN class_sessions m ON m.id=a.session_id WHERE m.section_id IN(${placeholders}) GROUP BY a.session_id`,...ids):[];
      return res.json({sections,sessions,resources,attendance,attendanceCount,capabilities:{
        scheduledSessions:true,courseResources:true,selfCheckIn:true,
        liveVideoProviderConnected:false,automaticRecording:false,gradedAssignments:false,
      }});
    }catch(error){return respond(res,error);}
  });

  app.post('/api/classroom/sessions',(req,res)=>{
    try{
      const actor=actorOf(res)!;
      const data=req.body||{};
      const section=allowedSection(store,actor,limited(data.sectionId,'Section ID',80),true);
      const title=limited(data.title,'Class session title',180);
      const start=validTime(data.startsAt),end=validTime(data.endsAt);
      if(Date.parse(end)<=Date.parse(start)||Date.parse(end)-Date.parse(start)>8*3600000)
        throw new WorkflowError('Class must end after its start and be no longer than 8 hours.');
      const meeting=secureLink(data.meetingUrl,'External meeting link',true);
      const notes=typeof data.notes==='string'?data.notes.trim().slice(0,2000):'';
      const record={id:crypto.randomUUID(),section_id:section.id,title,starts_at:start,ends_at:end,meeting_url:meeting,notes,created_by:actor.id,created_at:new Date().toISOString()};
      store.transaction(()=>{
        store.run('INSERT INTO class_sessions(id,section_id,title,starts_at,ends_at,meeting_url,notes,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)',...Object.values(record));
        store.audit(actor,'CLASS_SESSION_CREATED',record.id,null,{sectionId:section.id,title,startsAt:start,endsAt:end,meetingConfigured:!!meeting});
      });
      return res.status(201).json({success:true,session:record});
    }catch(error){return respond(res,error);}
  });

  app.post('/api/classroom/resources',(req,res)=>{
    try{
      const actor=actorOf(res)!;
      const data=req.body||{};
      const section=allowedSection(store,actor,limited(data.sectionId,'Section ID',80),true);
      const title=limited(data.title,'Learning resource title',180);
      if(!['notes','recording','assignment','reading'].includes(data.kind))
        throw new WorkflowError('Choose notes, recording, assignment or reading.');
      const url=secureLink(data.url,'Learning resource link');
      const description=typeof data.description==='string'?data.description.trim().slice(0,2000):'';
      const record={id:crypto.randomUUID(),section_id:section.id,title,kind:data.kind,url,description,published_by:actor.id,published_at:new Date().toISOString()};
      store.transaction(()=>{
        store.run('INSERT INTO class_resources(id,section_id,title,kind,url,description,published_by,published_at) VALUES(?,?,?,?,?,?,?,?)',...Object.values(record));
        store.audit(actor,'CLASS_RESOURCE_PUBLISHED',record.id,null,{sectionId:section.id,title,kind:data.kind});
      });
      return res.status(201).json({success:true,resource:record});
    }catch(error){return respond(res,error);}
  });

  app.post('/api/classroom/sessions/:id/check-in',(req,res)=>{
    try{
      const actor=actorOf(res)!;
      if(actor.role!=='student')throw new WorkflowError('Only a registered student can check in.',403);
      const session=store.one('SELECT * FROM class_sessions WHERE id=?',req.params.id);
      if(!session)throw new WorkflowError('Class session not found.',404);
      allowedSection(store,actor,session.section_id,false);
      const instant=Date.now();
      if(instant<Date.parse(session.starts_at)-15*60000||instant>Date.parse(session.ends_at)+15*60000)
        throw new WorkflowError('Check-in is available from 15 minutes before until 15 minutes after the scheduled class.',409);
      const student=store.one('SELECT id FROM students WHERE user_id=?',actor.id);
      if(!student)throw new WorkflowError('Student record is not linked.',403);
      const checkedAt=new Date().toISOString();
      store.transaction(()=>{
        store.run('INSERT OR IGNORE INTO class_attendance(session_id,student_id,checked_in_at) VALUES(?,?,?)',session.id,student.id,checkedAt);
        store.audit(actor,'CLASS_SELF_CHECK_IN',session.id,null,{sectionId:session.section_id,studentId:student.id,method:'self_attested'});
      });
      return res.json({success:true,note:'Self-attested check-in recorded; faculty attendance verification is a separate workflow.'});
    }catch(error){return respond(res,error);}
  });
}
