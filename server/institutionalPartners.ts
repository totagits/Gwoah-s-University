import crypto from 'node:crypto';
import type { Express, Response } from 'express';
import { actorOf } from './identity';
import { Operations, WorkflowError } from './operations';

// This registry is intentionally HIAU-admin-only. It does not confer an
// institution account, library entitlement, or academic credit.
const required = (value: unknown, label: string, max = 200): string => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new WorkflowError(`${label} is required (maximum ${max} characters).`);
  return value.trim();
};
const optional = (value: unknown, label: string, max = 500): string =>
  value == null || value === '' ? '' : required(value, label, max);
const country = (value: unknown) => required(value, 'Country', 100);
const asDate = (value: unknown, label: string) => {
  const text = required(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) ||
      !Number.isFinite(Date.parse(text + 'T00:00:00Z')) ||
      new Date(text + 'T00:00:00Z').toISOString().slice(0,10) !== text)
    throw new WorkflowError(`${label} must be a valid date (YYYY-MM-DD).`);
  return text;
};
const allowed = new Set(['lectures','symposiums','research','library','courses']);
const validActivities = (raw: unknown): string[] => {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > allowed.size ||
      raw.some(item => typeof item !== 'string' || !allowed.has(item)))
    throw new WorkflowError('Select at least one valid collaboration activity.');
  return [...new Set(raw)].sort();
};
const handle = (res: Response, work: () => unknown) => {
  if (actorOf(res)?.role !== 'super_admin')
    return res.status(403).json({error:'Only authorized university administrators may manage institutional partners.'});
  try {return res.json(work());}
  catch (error) {
    return res.status(error instanceof WorkflowError ? error.status : 500)
      .json({error: error instanceof WorkflowError ? error.message : 'Partner request failed.'});
  }
};

export function installInstitutionalPartners(app: Express, store: Operations) {
  // Separate, additive tables; nothing changes existing university or
  // student/finance schema. No partner accounts are created by this module.
  store.sql.exec(`
    CREATE TABLE IF NOT EXISTS institutional_partners(
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      institution_type TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('draft','verified','active','suspended')),
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      verified_by TEXT,
      verified_at TEXT,
      activated_by TEXT,
      activated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS institutional_partner_agreements(
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES institutional_partners(id),
      signed_reference TEXT NOT NULL,
      activities_json TEXT NOT NULL,
      starts_on TEXT NOT NULL,
      expires_on TEXT NOT NULL,
      accepted_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS partner_agreements_current
      ON institutional_partner_agreements(partner_id,expires_on);
  `);
  const find = (id: string) => store.one(
    'SELECT * FROM institutional_partners WHERE id=?',id,
  );
  const snapshot = (id: string) => {
    const partner = find(id);
    if (!partner) throw new WorkflowError('Partner not found.',404);
    const agreements = store.all(
      'SELECT * FROM institutional_partner_agreements WHERE partner_id=? ORDER BY created_at DESC',
      id,
    ).map(({activities_json,...item})=>({...item,activities:JSON.parse(activities_json)}));
    return {...partner,agreements};
  };
  const auditChange = (res: Response, action: string, id: string, before: unknown) =>
    store.audit(actorOf(res)!,action,'institutional_partner',before,snapshot(id));
  app.get('/api/institutional-partners',(_req,res)=>handle(res,()=>({
    partners:store.all(
      'SELECT id,name,country,contact_email,institution_type,status,created_at,updated_at FROM institutional_partners ORDER BY created_at DESC',
    ),
  })));
  app.get('/api/institutional-partners/:id', (req,res)=>handle(res,()=>({
    partner:snapshot(req.params.id),
  })));
  app.post('/api/institutional-partners', (req,res)=>handle(res,()=>{
    const name=required(req.body.name,'Institution name',180);
    const location=country(req.body.country);
    const contact=required(req.body.contactEmail,'Contact email',254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
      throw new WorkflowError('Enter a valid contact email.');
    const kind=required(req.body.institutionType,'Institution type',80);
    const notes=optional(req.body.notes,'Notes',2000);
    const id=crypto.randomUUID();
    const now=new Date().toISOString();
    store.transaction(()=>{
      store.run(
        `INSERT INTO institutional_partners
         (id,name,country,contact_email,institution_type,notes,status,created_by,created_at,updated_at)
         VALUES(?,?,?,?,?,?,'draft',?,?,?)`,
        id,name,location,contact,kind,notes,actorOf(res)!.id,now,now,
      );
      auditChange(res,'PARTNER_DRAFT_CREATED',id,null);
    });
    return {partner:snapshot(id)};
  }));
  app.post('/api/institutional-partners/:id/verify',(req,res)=>handle(res,()=>{
    const before=snapshot(req.params.id);
    if(before.status!=='draft')
      throw new WorkflowError('Only draft partners may be verified.',409);
    const note=required(req.body.verificationNote,'Verification note',2000);
    // Verification is an explicit, auditable human decision.
    store.transaction(()=>{
      const now=new Date().toISOString();
      store.run(`UPDATE institutional_partners SET status='verified',verified_by=?,verified_at=?,
        notes=?,updated_at=? WHERE id=?`,
        actorOf(res)!.id,now,note,now,req.params.id);
      auditChange(res,'PARTNER_VERIFIED',req.params.id,before);
    });
    return {partner:snapshot(req.params.id)};
  }));
  app.post('/api/institutional-partners/:id/activate',(req,res)=>handle(res,()=>{
    const before=snapshot(req.params.id);
    if(before.status!=='verified')
      throw new WorkflowError('A partner must be verified before activation.',409);
    const agreement=required(req.body.signedAgreementReference,'Signed agreement reference',300);
    const activities=validActivities(req.body.activities);
    const start=asDate(req.body.startsOn,'Agreement start date');
    const expiry=asDate(req.body.expiresOn,'Agreement expiry date');
    const today=new Date().toISOString().slice(0,10);
    if(start>today || expiry<=today || expiry<=start)
      throw new WorkflowError('Agreement must be in force and have a future expiry date.');
    store.transaction(()=>{
      const now=new Date().toISOString();
      store.run(`INSERT INTO institutional_partner_agreements
        (id,partner_id,signed_reference,activities_json,starts_on,expires_on,accepted_by,created_at)
        VALUES(?,?,?,?,?,?,?,?)`,
        crypto.randomUUID(),before.id,agreement,JSON.stringify(activities),start,expiry,actorOf(res)!.id,now);
      store.run(`UPDATE institutional_partners SET status='active',activated_by=?,activated_at=?,updated_at=?
        WHERE id=?`,actorOf(res)!.id,now,now,before.id);
      auditChange(res,'PARTNER_AGREEMENT_ACTIVATED',before.id,before);
    });
    return {partner:snapshot(before.id)};
  }));
  app.post('/api/institutional-partners/:id/suspend',(req,res)=>handle(res,()=>{
    const before=snapshot(req.params.id);
    if(before.status!=='active'&&before.status!=='verified')
      throw new WorkflowError('Only verified or active partners can be suspended.',409);
    const reason=required(req.body.reason,'Suspension reason',1000);
    store.transaction(()=>{
      const now=new Date().toISOString();
      store.run(`UPDATE institutional_partners SET status='suspended',updated_at=? WHERE id=?`,
        now,before.id);
      store.run(`UPDATE institutional_partner_agreements SET revoked_at=?
        WHERE partner_id=? AND revoked_at IS NULL`,now,before.id);
      store.audit(actorOf(res)!,'PARTNER_SUSPENDED','institutional_partner',before,
        {...snapshot(before.id),suspensionReason:reason});
    });
    return {partner:snapshot(before.id)};
  }));
}
