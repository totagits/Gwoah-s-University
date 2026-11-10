import crypto from 'node:crypto';
import type { Express } from 'express';
import { actorOf } from './identity';
import type { Operations } from './operations';

type ApplicationPayload = {
  applicantName: string;
  email: string;
  phone: string;
  programDesired: string;
  faculty: string;
  county: string;
  wassceIndex: string;
  wassceCoreSubjects: { subject: string; grade: string }[];
  applyingForScholarship: boolean;
};
type FieldError = { error: string };

const permittedGrades = new Set(['A1','B2','B3','C4','C5','C6','D7','E8','F9']);
const acceptedSubjects = ['Mathematics','English Language','Core Elective'];
const clean = (value: unknown, max = 150) =>
  typeof value === 'string' && value.trim().length <= max ? value.trim() : '';

export function parsePublicApplication(input: unknown): ApplicationPayload | FieldError {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {error: 'Enter valid application details.'};
  }
  const row = input as Record<string, unknown>;
  const applicantName = clean(row.applicantName, 120);
  const email = clean(row.email, 254).toLowerCase();
  const phone = clean(row.phone, 40);
  const programDesired = clean(row.programDesired, 200);
  const faculty = clean(row.faculty, 150);
  const county = clean(row.county, 60);
  const wassceIndex = clean(row.wassceIndex, 80);
  const applyingForScholarship = row.applyingForScholarship === true;
  if (typeof row.applyingForScholarship !== 'boolean') {
    return {error: 'Choose whether you want scholarship information.'};
  }
  if (!/^[\p{L}][\p{L}\p{M} .'-]{1,119}$/u.test(applicantName)) {
    return {error: 'Enter your full name.'};
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {error: 'Enter a valid email address.'};
  }
  if (!/^[+0-9][0-9+() .-]{6,39}$/.test(phone)) {
    return {error: 'Enter a valid phone number.'};
  }
  if (!programDesired || !faculty || !county) {
    return {error: 'Select a program, college and county.'};
  }
  if (!Array.isArray(row.wassceCoreSubjects) || row.wassceCoreSubjects.length !== 3) {
    return {error: 'Provide your three examination grades.'};
  }
  const wassceCoreSubjects = row.wassceCoreSubjects.map(item => ({
    subject: clean(item?.subject, 50), grade: clean(item?.grade, 4),
  }));
  if (wassceCoreSubjects.some((item, i) =>
    item.subject !== acceptedSubjects[i] || !permittedGrades.has(item.grade))) {
    return {error: 'Select valid examination grades.'};
  }
  return {applicantName,email,phone,programDesired,faculty,county,wassceIndex,
    wassceCoreSubjects,applyingForScholarship};
}

export function installPublicAdmissions(app: Express, operations: Operations) {
  operations.sql.exec(`
    CREATE TABLE IF NOT EXISTS public_admissions_intake (
      id TEXT PRIMARY KEY,
      application_number TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      program_requested TEXT NOT NULL,
      faculty_requested TEXT NOT NULL,
      county TEXT NOT NULL,
      wassce_index TEXT NOT NULL DEFAULT '',
      grades_json TEXT NOT NULL,
      scholarship_interest INTEGER NOT NULL DEFAULT 0 CHECK (scholarship_interest IN (0,1)),
      status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','under_review','closed')),
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS public_admissions_received
      ON public_admissions_intake(created_at DESC);
  `);

  // The identity middleware allows public POST only after same-origin,
  // persisted IP rate-limit and bounded JSON validation. No other
  // admissions workflow endpoint is exposed to unauthenticated visitors.
  app.post('/api/applications', (req, res) => {
    const parsed = parsePublicApplication(req.body);
    if ('error' in parsed) return res.status(400).json(parsed);
    const id = crypto.randomUUID();
    const applicationNumber = 'HIAU-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    try {
      operations.run(
        `INSERT INTO public_admissions_intake
         (id,application_number,full_name,email,phone,program_requested,faculty_requested,county,wassce_index,grades_json,scholarship_interest,status,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,'received',?)`,
        id,applicationNumber,parsed.applicantName,parsed.email,parsed.phone,
        parsed.programDesired,parsed.faculty,parsed.county,parsed.wassceIndex,
        JSON.stringify(parsed.wassceCoreSubjects),
        parsed.applyingForScholarship ? 1 : 0,
        new Date().toISOString()
      );
      res.set('Cache-Control','no-store');
      return res.status(201).json({
        success:true,
        application:{applicationNumber,status:'received'},
        message:'Your application was received. Financial-aid interest is not an award.'
      });
    } catch {
      return res.status(503).json({
        success:false,error:'Submission could not be saved. Please try again later.'
      });
    }
  });

  // Only admissions-authorized sessions pass the identity middleware.
  app.get('/api/applications', (_req, res) => {
    const actor = actorOf(res);
    if (!actor || !['super_admin','registrar','admissions_officer'].includes(actor.role)) {
      return res.status(403).json({error:'Not authorized.'});
    }
    const applications = operations.all(
      `SELECT id,application_number,full_name,email,phone,program_requested,
              faculty_requested,county,wassce_index,grades_json,
              scholarship_interest,status,created_at
       FROM public_admissions_intake ORDER BY created_at DESC LIMIT 200`
    ).map(row => ({
      ...row,
      scholarship_interest: row.scholarship_interest === 1,
      grades: JSON.parse(row.grades_json)
    }));
    res.set('Cache-Control','no-store');
    return res.json({applications});
  });
}
