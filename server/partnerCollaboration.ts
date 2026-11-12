import crypto from 'node:crypto';
import type {Express,Response} from 'express';
import {actorOf} from './identity';
import {Operations,WorkflowError} from './operations';

const kindSet=new Set(['lesson','lecture','symposium','research','library']);
const scopeFor:Record<string,string>={
  lesson:'courses',lecture:'lectures',symposium:'symposiums',
  research:'research',library:'library',
};
const text=(value:unknown,label:string,max=250)=>{
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)
    throw new WorkflowError(`${label} is required (maximum ${max} characters).`);
  return value.trim();
};
const email=(value:unknown)=>{
  const result=text(value,'Email',254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    throw new WorkflowError('Enter a valid email.');
  return result;
};
const err=(res:Response,error:unknown)=>res.status(error instanceof WorkflowError?error.status:500)
  .json({error:error instanceof WorkflowError?error.message:'Partner collaboration request failed.'});
const reviewer=(res:Response)=>actorOf(res)?.role==='super_admin';
const user=(res:Response)=>actorOf(res);
const member=(store:Operations,res:Response)=> {
  const actor=user(res);
  if(!actor||actor.role!=='partner_representative')throw new WorkflowError('Partner access denied.',403);
  const row=store.one(`SELECT m.*,p.status AS partner_status,p.name AS institution_name
    FROM institutional_partner_members m
    JOIN institutional_partners p ON p.id=m.partner_id
    WHERE m.email=? AND m.revoked_at IS NULL`,actor.email.toLowerCase());
  if(!row||row.partner_status!=='active')throw new WorkflowError('Partner access suspended or unapproved.',403);
  return row;
};
const activeAgreement=(store:Operations,partnerId:string,activity:string)=>{
  const today=new Date().toISOString().slice(0,10);
  return store.all(`SELECT activities_json FROM institutional_partner_agreements
    WHERE partner_id=? AND revoked_at IS NULL AND starts_on<=? AND expires_on>?`,
    partnerId,today,today).some(row=>{
      try{return (JSON.parse(row.activities_json) as string[]).includes(activity);}
      catch{return false;}
    });
};
const secureLink=(value:unknown)=>{
  const input=text(value,'Resource URL',1500);
  let url:URL;
  try{url=new URL(input);}catch{throw new WorkflowError('Enter a valid HTTPS resource URL.');}
  if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||
     !url.hostname.includes('.')||/^(localhost|.*\.localhost)$/i.test(url.hostname)||
     /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)||
     url.hostname.includes('[')||url.hostname.includes(']'))
    throw new WorkflowError('Provide an approved public HTTPS academic resource link.');
  return url.toString();
};
// Member identity is an existing or newly invited HIAU identity account, but
// this mapping is always a second server-verified constraint on its access.
export function partnerInviteAllowed(store:Operations,emailAddress:string){
  const emailValue=String(emailAddress).toLowerCase();
  const now=new Date().toISOString().slice(0,10);
  return Boolean(store.one(`SELECT 1 AS allowed FROM institutional_partner_members m
    JOIN institutional_partners p ON p.id=m.partner_id
    JOIN institutional_partner_agreements a ON a.partner_id=p.id
    WHERE m.email=? AND m.revoked_at IS NULL AND p.status='active'
      AND a.revoked_at IS NULL AND a.starts_on<=? AND a.expires_on>?
    LIMIT 1`,emailValue,now,now));
}
export function installPartnerCollaboration(app:Express,store:Operations){
  store.sql.exec(`
    CREATE TABLE IF NOT EXISTS institutional_partner_members(
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES institutional_partners(id),
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      invited_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS partner_member_institution ON institutional_partner_members(partner_id);
    CREATE TABLE IF NOT EXISTS institutional_partner_resources(
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES institutional_partners(id),
      member_email TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('lesson','lecture','symposium','research','library')),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      source_url TEXT NOT NULL,
      license_statement TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('submitted','approved','rejected','withdrawn')),
      submitted_at TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      reviewer_note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS partner_resources_queue ON institutional_partner_resources(status,submitted_at);
    CREATE INDEX IF NOT EXISTS partner_resources_tenant ON institutional_partner_resources(partner_id,status);
  `);
  // Administrative partner-membership setup never provisions a session or
  // activation token. Admin must separately use the existing vetted identity
  // invitation workflow; external user cannot self-register.
  app.post('/api/partner-collaboration/admin/partners/:partnerId/members',(req,res)=>{
    if(!reviewer(res))return res.sendStatus(403);
    try{
      const partner=store.one('SELECT * FROM institutional_partners WHERE id=?',req.params.partnerId);
      if(!partner||partner.status!=='active')throw new WorkflowError('An active partnership is required.',409);
      const contact=email(req.body.email),name=text(req.body.name,'Representative name',100);
      if(!partnerInviteAllowedForInstitution(store,partner.id))
        throw new WorkflowError('Partnership agreement expired or revoked.',409);
      const existing=store.one('SELECT * FROM institutional_partner_members WHERE email=?',contact);
      if(existing)throw new WorkflowError('This representative already has an institution assignment.',409);
      const id=crypto.randomUUID(),now=new Date().toISOString();
      store.transaction(()=>{
        store.run(`INSERT INTO institutional_partner_members
          (id,partner_id,email,name,invited_by,created_at) VALUES(?,?,?,?,?,?)`,
          id,partner.id,contact,name,user(res)!.id,now);
        store.audit(user(res)!,'PARTNER_MEMBER_AUTHORIZED','institutional_partner_member',null,
          {id,partnerId:partner.id,email:contact});
      });
      return res.status(201).json({member:{id,name,email:contact,partnerId:partner.id},
        nextAction:'Invite this email using the partner_representative identity role.'});
    }catch(e){return err(res,e);}
  });
  app.get('/api/partner-collaboration/admin/partners/:partnerId/members',(req,res)=>{
    if(!reviewer(res))return res.sendStatus(403);
    return res.json({members:store.all(`SELECT id,partner_id,name,email,created_at,revoked_at
      FROM institutional_partner_members WHERE partner_id=? ORDER BY created_at DESC`,req.params.partnerId)});
  });
  app.post('/api/partner-collaboration/admin/members/:id/revoke',(req,res)=>{
    if(!reviewer(res))return res.sendStatus(403);
    const record=store.one('SELECT * FROM institutional_partner_members WHERE id=?',req.params.id);
    if(!record)return res.status(404).json({error:'Representative not found.'});
    store.transaction(()=>{
      store.run('UPDATE institutional_partner_members SET revoked_at=? WHERE id=?',new Date().toISOString(),record.id);
      store.audit(user(res)!,'PARTNER_MEMBER_REVOKED','institutional_partner_member',record,
        {id:record.id,revoked:true});
    });
    return res.json({success:true});
  });
  app.get('/api/partner-collaboration/me',(_req,res)=>{
    try {
      const m=member(store,res);
      return res.json({institution:{id:m.partner_id,name:m.institution_name},role:'partner_representative'});
    }catch(e){return err(res,e);}
  });
  app.post('/api/partner-collaboration/resources',(req,res)=>{
    try{
      const m=member(store,res);
      const kind=text(req.body.kind,'Resource type',20);
      if(!kindSet.has(kind))throw new WorkflowError('Unsupported resource type.');
      if(!activeAgreement(store,m.partner_id,scopeFor[kind]))
        throw new WorkflowError('This activity is not authorized by an in-force agreement.',403);
      const title=text(req.body.title,'Resource title',200);
      const summary=text(req.body.summary,'Resource description',2000);
      const url=secureLink(req.body.sourceUrl);
      const license=text(req.body.licenseStatement,'Copyright or license statement',500);
      if(req.body.rightsConfirmed!==true)throw new WorkflowError('Confirm the institution has sharing rights.');
      const id=crypto.randomUUID(),now=new Date().toISOString();
      store.transaction(()=>{
        store.run(`INSERT INTO institutional_partner_resources
          (id,partner_id,member_email,kind,title,summary,source_url,license_statement,
           status,submitted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'submitted',?,?)`,
          id,m.partner_id,m.email,kind,title,summary,url,license,now,now);
        store.audit(user(res)!,'PARTNER_RESOURCE_SUBMITTED','institutional_partner_resource',null,
          {id,partnerId:m.partner_id,kind,title});
      });
      return res.status(201).json({resource:{id,status:'submitted',title,kind}});
    }catch(e){return err(res,e);}
  });
  app.get('/api/partner-collaboration/resources',(_req,res)=>{
    try{
      const actor=user(res);
      if(!actor)return res.sendStatus(401);
      if(actor.role==='super_admin'){
        return res.json({resources:store.all(`SELECT r.*,p.name AS institution_name
          FROM institutional_partner_resources r JOIN institutional_partners p ON p.id=r.partner_id
          ORDER BY r.submitted_at DESC LIMIT 250`)});
      }
      const m=member(store,res);
      return res.json({resources:store.all(`SELECT id,kind,title,summary,status,submitted_at,reviewer_note,updated_at
        FROM institutional_partner_resources WHERE partner_id=?
        ORDER BY submitted_at DESC LIMIT 250`,m.partner_id)});
    }catch(e){return err(res,e);}
  });
  app.post('/api/partner-collaboration/admin/resources/:id/review',(req,res)=>{
    if(!reviewer(res))return res.sendStatus(403);
    try{
      const status=text(req.body.decision,'Decision',20);
      if(status!=='approved'&&status!=='rejected')
        throw new WorkflowError('Choose approved or rejected.');
      const note=text(req.body.note,'Review justification',2000);
      const resource=store.one('SELECT * FROM institutional_partner_resources WHERE id=?',req.params.id);
      if(!resource)throw new WorkflowError('Resource not found.',404);
      if(resource.status!=='submitted')throw new WorkflowError('This resource has already been reviewed.',409);
      if(status==='approved'){
        const partner=store.one('SELECT status FROM institutional_partners WHERE id=?',resource.partner_id);
        if(partner?.status!=='active'||!activeAgreement(store,resource.partner_id,scopeFor[resource.kind]))
          throw new WorkflowError('The institution or agreement is no longer active.',409);
      }
      store.transaction(()=>{
        const now=new Date().toISOString();
        store.run(`UPDATE institutional_partner_resources SET status=?,reviewer_note=?,reviewed_by=?,
          reviewed_at=?,updated_at=? WHERE id=?`,status,note,user(res)!.id,now,now,resource.id);
        store.audit(user(res)!,'PARTNER_RESOURCE_REVIEWED','institutional_partner_resource',resource,
          {id:resource.id,status,reviewerNote:note});
      });
      return res.json({success:true,status});
    }catch(e){return err(res,e);}
  });
  app.post('/api/partner-collaboration/admin/resources/:id/withdraw',(req,res)=>{
    if(!reviewer(res))return res.sendStatus(403);
    const resource=store.one('SELECT * FROM institutional_partner_resources WHERE id=?',req.params.id);
    if(!resource)return res.sendStatus(404);
    if(resource.status==='withdrawn')return res.status(409).json({error:'Resource already withdrawn.'});
    store.transaction(()=>{
      store.run(`UPDATE institutional_partner_resources SET status='withdrawn',updated_at=?
        WHERE id=?`,new Date().toISOString(),resource.id);
      store.audit(user(res)!,'PARTNER_RESOURCE_WITHDRAWN','institutional_partner_resource',resource,{id:resource.id});
    });
    return res.json({success:true});
  });
}
function partnerInviteAllowedForInstitution(store:Operations,id:string){
  const today=new Date().toISOString().slice(0,10);
  return Boolean(store.one(`SELECT 1 AS allowed FROM institutional_partner_agreements
    WHERE partner_id=? AND revoked_at IS NULL AND starts_on<=? AND expires_on>? LIMIT 1`,id,today,today));
}
