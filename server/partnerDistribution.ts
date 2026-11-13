import crypto from 'node:crypto';
import type {Express,Response} from 'express';
import {actorOf} from './identity';
import {Operations,WorkflowError} from './operations';

const scopes:Record<string,string>={
  lesson:'courses',lecture:'lectures',symposium:'symposiums',research:'research',library:'library',
};
const required=(input:unknown,name:string,max:number)=>{
  if(typeof input!=='string'||!input.trim()||input.trim().length>max)
    throw new WorkflowError(name+' is required (maximum '+max+' characters).');
  return input.trim();
};
const validDate=(input:unknown,name:string)=>{
  const date=required(input,name,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00Z'))||
    new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)
    throw new WorkflowError(name+' must be a valid YYYY-MM-DD date.');
  return date;
};
const now=()=>new Date().toISOString();
const today=()=>now().slice(0,10);
const isManager=(res:Response)=>actorOf(res)?.role==='super_admin';
const fail=(res:Response,e:unknown)=>res.status(e instanceof WorkflowError?e.status:500)
  .json({error:e instanceof WorkflowError?e.message:'Access could not be verified.'});
const inScope=(store:Operations,partner:string,kind:string)=>{
  const date=today();
  return store.all(`SELECT activities_json FROM institutional_partner_agreements
    WHERE partner_id=? AND revoked_at IS NULL AND starts_on<=? AND expires_on>?`,partner,date,date)
    .some(r=>{
      try{return (JSON.parse(r.activities_json) as string[]).includes(scopes[kind]);}
      catch{return false;}
    });
};
const eligible=(store:Operations,userId:string)=>{
  const record=store.one('SELECT id,role,name FROM users WHERE id=?',userId);
  if(!record)return null;
  if(record.role==='student'){
    const active=store.one("SELECT id FROM students WHERE user_id=? AND status='active'",userId);
    return active?record:null;
  }
  return ['lecturer','dean'].includes(record.role)?record:null;
};
const accessible=(store:Operations,resourceId:string,userId:string)=>{
  const entry=store.one(`SELECT r.id,r.partner_id,r.kind,r.title,r.summary,r.source_url,
     r.license_statement,p.name AS institution_name
    FROM institutional_partner_resources r
    JOIN institutional_partners p ON p.id=r.partner_id
    JOIN institutional_partner_distributions d ON d.resource_id=r.id
    JOIN institutional_partner_distribution_grants g ON g.resource_id=r.id
    WHERE r.id=? AND g.user_id=? AND g.revoked_at IS NULL
      AND r.status='approved' AND p.status='active'
      AND d.withdrawn_at IS NULL AND d.rights_expires_on>? `,resourceId,userId,today());
  if(!entry||!eligible(store,userId)||!inScope(store,entry.partner_id,entry.kind))return null;
  return entry;
};
export function installPartnerDistribution(app:Express,store:Operations){
  store.sql.exec(`
    CREATE TABLE IF NOT EXISTS institutional_partner_distributions(
      resource_id TEXT PRIMARY KEY REFERENCES institutional_partner_resources(id),
      rights_evidence TEXT NOT NULL,
      rights_expires_on TEXT NOT NULL,
      approved_by TEXT NOT NULL,
      approved_at TEXT NOT NULL,
      withdrawn_at TEXT
    );
    CREATE TABLE IF NOT EXISTS institutional_partner_distribution_grants(
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL REFERENCES institutional_partner_resources(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      granted_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      UNIQUE(resource_id,user_id)
    );
    CREATE INDEX IF NOT EXISTS partner_distribution_grants_user
      ON institutional_partner_distribution_grants(user_id,revoked_at);
  `);
  const resource=(id:string)=>{
    const record=store.one(`SELECT r.*,p.status AS partner_status,p.name AS institution_name
      FROM institutional_partner_resources r
      JOIN institutional_partners p ON p.id=r.partner_id WHERE r.id=?`,id);
    if(!record)throw new WorkflowError('Resource not found.',404);
    return record;
  };
  // Only an existing HIAU administrator can publish an approved resource;
  // approve/reject in the submission workflow is a separate decision.
  app.post('/api/partner-distribution/admin/resources/:id/authorize',(req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    try {
      const record=resource(req.params.id);
      if(record.status!=='approved'||record.partner_status!=='active'||
         !inScope(store,record.partner_id,record.kind))
        throw new WorkflowError('An approved resource and active authorized partner are required.',409);
      const evidence=required(req.body.rightsEvidence,'Documented copyright/license review evidence',1500);
      const expiry=validDate(req.body.rightsExpiresOn,'Rights expiration date');
      if(expiry<=today())throw new WorkflowError('Sharing rights must have a future expiry date.',400);
      const prior=store.one('SELECT * FROM institutional_partner_distributions WHERE resource_id=?',record.id);
      if(prior&&!prior.withdrawn_at)
        throw new WorkflowError('Distribution is already authorized.',409);
      store.transaction(()=>{
        store.run(`INSERT INTO institutional_partner_distributions
          (resource_id,rights_evidence,rights_expires_on,approved_by,approved_at,withdrawn_at)
          VALUES(?,?,?,?,?,NULL)
          ON CONFLICT(resource_id) DO UPDATE SET rights_evidence=excluded.rights_evidence,
          rights_expires_on=excluded.rights_expires_on,approved_by=excluded.approved_by,
          approved_at=excluded.approved_at,withdrawn_at=NULL`,
          record.id,evidence,expiry,actorOf(res)!.id,now());
        store.audit(actorOf(res)!,'PARTNER_DISTRIBUTION_AUTHORIZED','institutional_partner_resource',prior,
          {resourceId:record.id,rightsExpiresOn:expiry,rightsEvidence:evidence});
      });
      return res.json({success:true,resourceId:record.id});
    }catch(e){return fail(res,e);}
  });
  app.post('/api/partner-distribution/admin/resources/:id/withdraw',(req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    try{
      const note=required(req.body.reason,'Withdrawal reason',1000);
      const record=resource(req.params.id);
      const publication=store.one('SELECT * FROM institutional_partner_distributions WHERE resource_id=? AND withdrawn_at IS NULL',record.id);
      if(!publication)throw new WorkflowError('Distribution is not active.',409);
      store.transaction(()=>{
        store.run('UPDATE institutional_partner_distributions SET withdrawn_at=? WHERE resource_id=?',now(),record.id);
        store.audit(actorOf(res)!,'PARTNER_DISTRIBUTION_WITHDRAWN','institutional_partner_resource',publication,
          {resourceId:record.id,reason:note});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });
  app.get('/api/partner-distribution/admin/eligible-users',(_req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    const students=store.all(`SELECT u.id,u.name,u.role FROM users u
      JOIN students s ON s.user_id=u.id WHERE u.role='student' AND s.status='active' ORDER BY u.name LIMIT 500`);
    const faculty=store.all("SELECT id,name,role FROM users WHERE role IN('lecturer','dean') ORDER BY name LIMIT 500");
    return res.json({users:[...students,...faculty]});
  });
  app.get('/api/partner-distribution/admin/resources/:id', (req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    try{
      const record=resource(req.params.id);
      const distribution=store.one('SELECT * FROM institutional_partner_distributions WHERE resource_id=?',record.id)||null;
      const grants=store.all(`SELECT g.id,g.user_id,g.created_at,g.revoked_at,u.name,u.role
        FROM institutional_partner_distribution_grants g
        JOIN users u ON u.id=g.user_id WHERE g.resource_id=? ORDER BY g.created_at DESC`,record.id);
      return res.json({resource:{id:record.id,title:record.title,status:record.status,
        institutionName:record.institution_name},distribution,grants});
    }catch(e){return fail(res,e);}
  });
  app.post('/api/partner-distribution/admin/resources/:id/grants',(req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    try{
      const record=resource(req.params.id);
      const publication=store.one(`SELECT * FROM institutional_partner_distributions
        WHERE resource_id=? AND withdrawn_at IS NULL AND rights_expires_on>?`,record.id,today());
      if(!publication||record.status!=='approved'||record.partner_status!=='active'||
         !inScope(store,record.partner_id,record.kind))
        throw new WorkflowError('Resource distribution is not currently permitted.',409);
      // Identity middleware intentionally overwrites req.body.userId with the actor ID.
      // Use a distinct recipientId for this administrative assignment.
      const userId=required(req.body.recipientId,'Authorized HIAU user',100);
      const person=eligible(store,userId);
      if(!person)throw new WorkflowError('Only active enrolled students or authorized faculty may be granted access.',403);
      const previous=store.one(`SELECT * FROM institutional_partner_distribution_grants
        WHERE resource_id=? AND user_id=?`,record.id,userId);
      if(previous&&!previous.revoked_at)throw new WorkflowError('Access already granted.',409);
      store.transaction(()=>{
        if(previous)store.run(`UPDATE institutional_partner_distribution_grants
          SET revoked_at=NULL,granted_by=?,created_at=? WHERE id=?`,
          actorOf(res)!.id,now(),previous.id);
        else store.run(`INSERT INTO institutional_partner_distribution_grants
          (id,resource_id,user_id,granted_by,created_at) VALUES(?,?,?,?,?)`,
          crypto.randomUUID(),record.id,userId,actorOf(res)!.id,now());
        store.audit(actorOf(res)!,'PARTNER_RESOURCE_ACCESS_GRANTED','institutional_partner_resource',previous,
          {resourceId:record.id,userId});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });
  app.post('/api/partner-distribution/admin/resources/:id/grants/:userId/revoke',(req,res)=>{
    if(!isManager(res))return res.sendStatus(403);
    try{
      const record=resource(req.params.id);
      const old=store.one(`SELECT * FROM institutional_partner_distribution_grants
        WHERE resource_id=? AND user_id=? AND revoked_at IS NULL`,record.id,req.params.userId);
      if(!old)throw new WorkflowError('Active access grant not found.',404);
      store.transaction(()=>{
        store.run('UPDATE institutional_partner_distribution_grants SET revoked_at=? WHERE id=?',now(),old.id);
        store.audit(actorOf(res)!,'PARTNER_RESOURCE_ACCESS_REVOKED','institutional_partner_resource',old,
          {resourceId:record.id,userId:old.user_id});
      });
      return res.json({success:true});
    }catch(e){return fail(res,e);}
  });
  // Fail closed: listing and direct access both recheck role, active HIAU
  // student/faculty status, active partner, license expiry, publication state,
  // resource review state and current scope in signed agreement.
  app.get('/api/partner-distribution/library',(_req,res)=>{
    const actor=actorOf(res);
    if(!actor||!['student','lecturer','dean'].includes(actor.role))return res.sendStatus(403);
    if(!eligible(store,actor.id))return res.json({resources:[]});
    const candidates=store.all(`SELECT r.id FROM institutional_partner_resources r
      JOIN institutional_partner_distribution_grants g ON g.resource_id=r.id
      WHERE g.user_id=? AND g.revoked_at IS NULL ORDER BY r.updated_at DESC LIMIT 250`,actor.id);
    const resources=candidates.map(item=>accessible(store,item.id,actor.id))
      .filter(Boolean).map(({source_url,...entry})=>entry);
    res.set('Cache-Control','private, no-store');
    return res.json({resources});
  });
  app.get('/api/partner-distribution/library/:id/access',(req,res)=>{
    const actor=actorOf(res);
    if(!actor||!['student','lecturer','dean'].includes(actor.role))return res.sendStatus(403);
    const record=accessible(store,req.params.id,actor.id);
    if(!record)return res.status(404).json({error:'Resource unavailable or you are not authorized.'});
    store.audit(actor,'PARTNER_RESOURCE_LINK_ACCESSED','institutional_partner_resource',null,
      {resourceId:record.id});
    res.set('Cache-Control','private, no-store');
    // Link-out only: HIAU does not copy, cache or proxy partner-owned files.
    // An external publisher may additionally require its own authentication.
    return res.json({url:record.source_url,notice:'External publisher terms and sign-in may apply.'});
  });
}
