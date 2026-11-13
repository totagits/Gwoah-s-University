import crypto from 'node:crypto';
import type {Express,Response} from 'express';
import {actorOf} from './identity';
import {Operations,WorkflowError} from './operations';

const eventTypes=new Set(['guest_lecture','seminar','symposium','conference','workshop','professional_development']);
const modes=new Set(['online','hybrid','in_person']);
const scopeFor=(type:string)=>type==='guest_lecture'?'lectures':'symposiums';
const required=(value:unknown,label:string,max=500)=>{
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)
    throw new WorkflowError(`${label} is required (maximum ${max} characters).`);
  return value.trim();
};
const optional=(value:unknown,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
const dateTime=(value:unknown,label:string)=>{
  const text=required(value,label,80);
  const parsed=Date.parse(text);
  if(!Number.isFinite(parsed))throw new WorkflowError(`${label} must be a valid date and time.`);
  return new Date(parsed).toISOString();
};
const httpsUrl=(value:unknown)=>{
  const text=optional(value,1500);
  if(!text)return '';
  let url:URL;
  try{url=new URL(text);}catch{throw new WorkflowError('Meeting URL must be a valid HTTPS URL.');}
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.')||
    /^(localhost|.*\.localhost)$/i.test(url.hostname))
    throw new WorkflowError('Meeting URL must use an approved public HTTPS address.');
  return url.toString();
};
const admin=(res:Response)=>actorOf(res)?.role==='super_admin';
const fail=(res:Response,error:unknown)=>res.status(error instanceof WorkflowError?error.status:500)
  .json({error:error instanceof WorkflowError?error.message:'Academic event request failed.'});
const eligibleHiauUser=(store:Operations,userId:string)=>{
  const user=store.one('SELECT id,name,role FROM users WHERE id=?',userId);
  if(!user)return null;
  if(user.role==='student'){
    const student=store.one("SELECT id FROM students WHERE user_id=? AND status='active'",userId);
    return student?user:null;
  }
  return ['lecturer','dean'].includes(user.role)?user:null;
};
const partnerMember=(store:Operations,res:Response)=>{
  const actor=actorOf(res);
  if(!actor||actor.role!=='partner_representative')throw new WorkflowError('Partner access denied.',403);
  const today=new Date().toISOString().slice(0,10);
  const member=store.one(`SELECT m.partner_id,m.email,m.name,p.name AS institution_name,p.status
    FROM institutional_partner_members m
    JOIN institutional_partners p ON p.id=m.partner_id
    WHERE m.email=? AND m.revoked_at IS NULL AND p.status='active'`,actor.email.toLowerCase());
  if(!member)throw new WorkflowError('Active partner membership required.',403);
  const agreements=store.all(`SELECT activities_json FROM institutional_partner_agreements
    WHERE partner_id=? AND revoked_at IS NULL AND starts_on<=? AND expires_on>?`,
    member.partner_id,today,today);
  return {...member,agreements};
};
const activityAllowed=(member:any,eventType:string)=>
  member.agreements.some((row:any)=>{
    try{return (JSON.parse(row.activities_json) as string[]).includes(scopeFor(eventType));}
    catch{return false;}
  });
const publicEvent=(row:any)=>({
  id:row.id,title:row.title,eventType:row.event_type,summary:row.summary,
  deliveryMode:row.delivery_mode,venue:row.venue,startsAt:row.starts_at,endsAt:row.ends_at,
  timezone:row.timezone,status:row.status,registrationOpen:Boolean(row.registration_open),
  maxParticipants:row.max_participants,certificateEligible:Boolean(row.certificate_eligible),
  institutionName:row.institution_name||'HIAU',reviewNote:row.review_note||'',
});

export function installPartnerEvents(app:Express,store:Operations){
  store.sql.exec(`
    CREATE TABLE IF NOT EXISTS institutional_partner_events(
      id TEXT PRIMARY KEY,
      partner_id TEXT REFERENCES institutional_partners(id),
      proposed_by_email TEXT NOT NULL,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('guest_lecture','seminar','symposium','conference','workshop','professional_development')),
      summary TEXT NOT NULL,
      delivery_mode TEXT NOT NULL CHECK(delivery_mode IN ('online','hybrid','in_person')),
      venue TEXT NOT NULL DEFAULT '',
      meeting_url TEXT NOT NULL DEFAULT '',
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      timezone TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('proposed','approved','rejected','cancelled','completed')),
      registration_open INTEGER NOT NULL DEFAULT 0,
      max_participants INTEGER NOT NULL DEFAULT 0,
      certificate_eligible INTEGER NOT NULL DEFAULT 0,
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS partner_events_status_time
      ON institutional_partner_events(status,starts_at);
    CREATE INDEX IF NOT EXISTS partner_events_partner
      ON institutional_partner_events(partner_id,status);
    CREATE TABLE IF NOT EXISTS institutional_partner_event_registrations(
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES institutional_partner_events(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      registered_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('registered','cancelled','attended')),
      attended_at TEXT,
      attendance_verified_by TEXT,
      certificate_code TEXT,
      certificate_issued_at TEXT,
      UNIQUE(event_id,user_id)
    );
    CREATE INDEX IF NOT EXISTS partner_event_regs_user
      ON institutional_partner_event_registrations(user_id,status);
  `);

  const event=(id:string)=>{
    const row=store.one(`SELECT e.*,p.name AS institution_name
      FROM institutional_partner_events e
      LEFT JOIN institutional_partners p ON p.id=e.partner_id WHERE e.id=?`,id);
    if(!row)throw new WorkflowError('Academic event not found.',404);
    return row;
  };

  app.post('/api/partner-collaboration/events/proposals',(req,res)=>{
    try{
      const member=partnerMember(store,res);
      const eventType=required(req.body.eventType,'Event type',80);
      if(!eventTypes.has(eventType))throw new WorkflowError('Unsupported academic event type.');
      if(!activityAllowed(member,eventType))
        throw new WorkflowError('This event type is not authorized by the institution agreement.',403);
      const mode=required(req.body.deliveryMode,'Delivery mode',30);
      if(!modes.has(mode))throw new WorkflowError('Unsupported delivery mode.');
      const start=dateTime(req.body.startsAt,'Start time'),end=dateTime(req.body.endsAt,'End time');
      if(Date.parse(end)<=Date.parse(start)||Date.parse(start)<=Date.now())
        throw new WorkflowError('Academic event must start in the future and end after it starts.');
      const title=required(req.body.title,'Event title',220);
      const summary=required(req.body.summary,'Academic event description',2500);
      const timezone=required(req.body.timezone,'Time zone',80);
      const venue=optional(req.body.venue,300);
      const meetingUrl=mode==='in_person'?'':httpsUrl(req.body.meetingUrl);
      if(mode!=='online'&&!venue)throw new WorkflowError('Venue is required for in-person or hybrid events.');
      if(mode!=='in_person'&&!meetingUrl)throw new WorkflowError('Meeting URL is required for online or hybrid events.');
      const max=Number(req.body.maxParticipants||0);
      if(!Number.isInteger(max)||max<0||max>100000)throw new WorkflowError('Maximum participants must be 0–100000.');
      const id=crypto.randomUUID(),stamp=new Date().toISOString();
      store.transaction(()=>{
        store.run(`INSERT INTO institutional_partner_events
          (id,partner_id,proposed_by_email,title,event_type,summary,delivery_mode,venue,meeting_url,
           starts_at,ends_at,timezone,status,registration_open,max_participants,certificate_eligible,
           created_at,updated_at)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?, 'proposed',0,?,?,?,?)`,
          id,member.partner_id,member.email,title,eventType,summary,mode,venue,meetingUrl,
          start,end,timezone,max,req.body.certificateEligible===true?1:0,stamp,stamp);
        store.audit(actorOf(res)!,'PARTNER_EVENT_PROPOSED','institutional_partner_event',null,
          {id,partnerId:member.partner_id,eventType,title});
      });
      return res.status(201).json({event:publicEvent(event(id))});
    }catch(e){return fail(res,e);}
  });

  app.get('/api/partner-collaboration/events',(_req,res)=>{
    try{
      const actor=actorOf(res);
      if(!actor)throw new WorkflowError('Authentication required.',401);
      if(actor.role==='super_admin'){
        return res.json({events:store.all(`SELECT e.*,p.name AS institution_name
          FROM institutional_partner_events e LEFT JOIN institutional_partners p ON p.id=e.partner_id
          ORDER BY e.starts_at ASC LIMIT 300`).map(publicEvent)});
      }
      if(actor.role==='partner_representative'){
        const member=partnerMember(store,res);
        return res.json({events:store.all(`SELECT e.*,p.name AS institution_name
          FROM institutional_partner_events e JOIN institutional_partners p ON p.id=e.partner_id
          WHERE e.partner_id=? ORDER BY e.starts_at ASC LIMIT 300`,member.partner_id).map(publicEvent)});
      }
      const person=eligibleHiauUser(store,actor.id);
      if(!person)throw new WorkflowError('Academic event access denied.',403);
      const rows=store.all(`SELECT e.*,p.name AS institution_name
        FROM institutional_partner_events e LEFT JOIN institutional_partners p ON p.id=e.partner_id
        WHERE e.status='approved' AND e.ends_at>? ORDER BY e.starts_at ASC LIMIT 300`,
        new Date().toISOString());
      const registered=new Set(store.all(`SELECT event_id FROM institutional_partner_event_registrations
        WHERE user_id=? AND status IN ('registered','attended')`,actor.id).map((r:any)=>r.event_id));
      return res.json({events:rows.map((row:any)=>({...publicEvent(row),registered:registered.has(row.id)}))});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/review',(req,res)=>{
    if(!admin(res))return res.sendStatus(403);
    try{
      const record=event(req.params.id);
      if(record.status!=='proposed')throw new WorkflowError('Only proposed events can be reviewed.',409);
      const decision=required(req.body.decision,'Decision',20);
      if(!['approved','rejected'].includes(decision))throw new WorkflowError('Decision must be approved or rejected.');
      const note=required(req.body.note,'Review note',2000);
      const registrationOpen=decision==='approved'&&req.body.registrationOpen!==false?1:0;
      const stamp=new Date().toISOString();
      store.transaction(()=>{
        store.run(`UPDATE institutional_partner_events
          SET status=?,registration_open=?,reviewed_by=?,reviewed_at=?,review_note=?,updated_at=? WHERE id=?`,
          decision,registrationOpen,actorOf(res)!.id,stamp,note,stamp,record.id);
        store.audit(actorOf(res)!,'PARTNER_EVENT_REVIEWED','institutional_partner_event',record,
          {id:record.id,status:decision,registrationOpen:Boolean(registrationOpen),reviewNote:note});
      });
      return res.json({event:publicEvent(event(record.id))});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/cancel',(req,res)=>{
    if(!admin(res))return res.sendStatus(403);
    try{
      const record=event(req.params.id);
      if(!['approved','proposed'].includes(record.status))
        throw new WorkflowError('Only proposed or approved events can be cancelled.',409);
      const reason=required(req.body.reason,'Cancellation reason',1000);
      store.transaction(()=>{
        const stamp=new Date().toISOString();
        store.run(`UPDATE institutional_partner_events SET status='cancelled',registration_open=0,
          review_note=?,updated_at=? WHERE id=?`,reason,stamp,record.id);
        store.audit(actorOf(res)!,'PARTNER_EVENT_CANCELLED','institutional_partner_event',record,
          {id:record.id,reason});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/register',(req,res)=>{
    try{
      const actor=actorOf(res);
      if(!actor)throw new WorkflowError('Authentication required.',401);
      if(!eligibleHiauUser(store,actor.id))throw new WorkflowError('Only active HIAU students or faculty may register.',403);
      const record=event(req.params.id);
      if(record.status!=='approved'||!record.registration_open||Date.parse(record.starts_at)<=Date.now())
        throw new WorkflowError('Registration is not currently open for this event.',409);
      if(record.max_participants>0){
        const count=store.one(`SELECT COUNT(*) AS n FROM institutional_partner_event_registrations
          WHERE event_id=? AND status IN ('registered','attended')`,record.id)?.n||0;
        if(count>=record.max_participants)throw new WorkflowError('This event has reached its registration capacity.',409);
      }
      const prior=store.one(`SELECT * FROM institutional_partner_event_registrations
        WHERE event_id=? AND user_id=?`,record.id,actor.id);
      if(prior&&prior.status!=='cancelled')throw new WorkflowError('You are already registered.',409);
      const stamp=new Date().toISOString();
      store.transaction(()=>{
        if(prior)store.run(`UPDATE institutional_partner_event_registrations
          SET status='registered',registered_at=?,attended_at=NULL,attendance_verified_by=NULL,
          certificate_code=NULL,certificate_issued_at=NULL WHERE id=?`,stamp,prior.id);
        else store.run(`INSERT INTO institutional_partner_event_registrations
          (id,event_id,user_id,registered_at,status) VALUES(?,?,?,?,'registered')`,
          crypto.randomUUID(),record.id,actor.id,stamp);
        store.audit(actor,'PARTNER_EVENT_REGISTERED','institutional_partner_event',null,
          {eventId:record.id,userId:actor.id});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/unregister',(req,res)=>{
    try{
      const actor=actorOf(res);
      if(!actor||!eligibleHiauUser(store,actor.id))throw new WorkflowError('Academic event access denied.',403);
      const reg=store.one(`SELECT * FROM institutional_partner_event_registrations
        WHERE event_id=? AND user_id=? AND status='registered'`,req.params.id,actor.id);
      if(!reg)throw new WorkflowError('Active registration not found.',404);
      store.transaction(()=>{
        store.run(`UPDATE institutional_partner_event_registrations SET status='cancelled' WHERE id=?`,reg.id);
        store.audit(actor,'PARTNER_EVENT_REGISTRATION_CANCELLED','institutional_partner_event',reg,{eventId:req.params.id});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });

  app.get('/api/partner-collaboration/events/:id/access',(req,res)=>{
    try{
      const actor=actorOf(res);
      if(!actor||!eligibleHiauUser(store,actor.id))throw new WorkflowError('Academic event access denied.',403);
      const record=event(req.params.id);
      const reg=store.one(`SELECT * FROM institutional_partner_event_registrations
        WHERE event_id=? AND user_id=? AND status IN ('registered','attended')`,record.id,actor.id);
      if(!reg||record.status!=='approved')throw new WorkflowError('Register for this approved event before accessing it.',403);
      res.set('Cache-Control','private, no-store');
      store.audit(actor,'PARTNER_EVENT_ACCESS_OPENED','institutional_partner_event',null,{eventId:record.id});
      return res.json({
        event:publicEvent(record),
        meetingUrl:record.delivery_mode==='in_person'?'':record.meeting_url,
        venue:record.venue,
      });
    }catch(e){return fail(res,e);}
  });

  app.get('/api/partner-collaboration/events/:id/participants',(req,res)=>{
    if(!admin(res))return res.sendStatus(403);
    try{
      event(req.params.id);
      const rows=store.all(`SELECT r.*,u.name,u.email,u.role
        FROM institutional_partner_event_registrations r JOIN users u ON u.id=r.user_id
        WHERE r.event_id=? ORDER BY r.registered_at ASC`,req.params.id);
      return res.json({participants:rows});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/attendance/:userId',(req,res)=>{
    if(!admin(res))return res.sendStatus(403);
    try{
      const record=event(req.params.id);
      if(record.status!=='approved'&&record.status!=='completed')
        throw new WorkflowError('Attendance can be verified only for an approved event.',409);
      const reg=store.one(`SELECT * FROM institutional_partner_event_registrations
        WHERE event_id=? AND user_id=? AND status='registered'`,record.id,req.params.userId);
      if(!reg)throw new WorkflowError('Registered participant not found.',404);
      const stamp=new Date().toISOString();
      store.transaction(()=>{
        store.run(`UPDATE institutional_partner_event_registrations
          SET status='attended',attended_at=?,attendance_verified_by=? WHERE id=?`,
          stamp,actorOf(res)!.id,reg.id);
        store.audit(actorOf(res)!,'PARTNER_EVENT_ATTENDANCE_VERIFIED','institutional_partner_event',reg,
          {eventId:record.id,userId:reg.user_id});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });

  app.post('/api/partner-collaboration/events/:id/certificate/:userId',(req,res)=>{
    if(!admin(res))return res.sendStatus(403);
    try{
      const record=event(req.params.id);
      if(!record.certificate_eligible)throw new WorkflowError('This event is not configured for participation certificates.',409);
      const reg=store.one(`SELECT * FROM institutional_partner_event_registrations
        WHERE event_id=? AND user_id=? AND status='attended'`,record.id,req.params.userId);
      if(!reg)throw new WorkflowError('Verified attendance is required before issuing a certificate.',409);
      const code=reg.certificate_code||('HIAU-'+crypto.randomBytes(6).toString('hex').toUpperCase());
      const stamp=new Date().toISOString();
      store.transaction(()=>{
        store.run(`UPDATE institutional_partner_event_registrations
          SET certificate_code=?,certificate_issued_at=? WHERE id=?`,code,stamp,reg.id);
        store.audit(actorOf(res)!,'PARTNER_EVENT_CERTIFICATE_ISSUED','institutional_partner_event',reg,
          {eventId:record.id,userId:reg.user_id,certificateCode:code});
      });
      return res.json({certificateCode:code});
    }catch(e){return fail(res,e);}
  });

  app.get('/api/partner-collaboration/events/my/participation',(_req,res)=>{
    try{
      const actor=actorOf(res);
      if(!actor||!eligibleHiauUser(store,actor.id))throw new WorkflowError('Academic participation access denied.',403);
      const rows=store.all(`SELECT r.status,r.registered_at,r.attended_at,r.certificate_code,r.certificate_issued_at,
          e.id AS event_id,e.title,e.event_type,e.starts_at,e.ends_at
        FROM institutional_partner_event_registrations r
        JOIN institutional_partner_events e ON e.id=r.event_id
        WHERE r.user_id=? ORDER BY e.starts_at DESC LIMIT 250`,actor.id);
      return res.json({participation:rows});
    }catch(e){return fail(res,e);}
  });
}
