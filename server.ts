import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { installCampus } from './server/campus';
import { installIdentity } from './server/identity';
import { installPlatform } from './server/platform';
import { fileURLToPath } from 'url';
import {
  DEMO_USERS,
  INITIAL_TASKS,
  INITIAL_COURSES,
  INITIAL_SECTIONS,
  DEMO_STUDENT,
  DEMO_REGISTRATIONS,
  DEMO_FINANCIAL_ACCOUNT,
  DEMO_APPLICATIONS,
  NCHE_POLICY_REGISTRY,
  INITIAL_MATERIALS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
} from './src/data/seedData';
import { INITIAL_LIBRARY_RESOURCES } from './src/data/libraryResourcesData';
import { INITIAL_CALENDAR_EVENTS } from './src/data/calendarData';
import {
  UniversityTask,
  StudentRegistrationItem,
  ApplicationRecord,
  FinancialAccount,
  AuditLogEntry,
  UserProfile,
  CourseMaterial,
  DirectMessage,
  LibraryResource,
  AcademicCalendarEvent,
} from './src/types';
import { generateIcsCalendar, filterCalendarEvents } from './src/utils/calendarSync';
import { computeTaskAnalytics } from './src/utils/taskAnalytics';
import {
  validateCourseAdd,
  validateCourseDrop,
  calculateGPA,
  evaluateAcademicStanding,
  scoreToLetterGrade,
} from './src/utils/academicRules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'university-db.json');

// In-memory working database structure
interface AppDatabase {
  users: UserProfile[];
  tasks: UniversityTask[];
  courses: typeof INITIAL_COURSES;
  sections: typeof INITIAL_SECTIONS;
  student: typeof DEMO_STUDENT;
  registrations: StudentRegistrationItem[];
  financialAccount: FinancialAccount;
  applications: ApplicationRecord[];
  policies: typeof NCHE_POLICY_REGISTRY;
  materials: CourseMaterial[];
  messages: DirectMessage[];
  resources: LibraryResource[];
  calendarEvents: AcademicCalendarEvent[];
  auditLogs: AuditLogEntry[];
}

function loadDatabase(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.materials) parsed.materials = INITIAL_MATERIALS;
      if (!parsed.messages) parsed.messages = INITIAL_MESSAGES;
      if (!parsed.resources || parsed.resources.length === 0) {
        parsed.resources = INITIAL_LIBRARY_RESOURCES;
      }
      if (!parsed.calendarEvents || parsed.calendarEvents.length === 0) {
        parsed.calendarEvents = INITIAL_CALENDAR_EVENTS;
      }
      return parsed;
    }
  } catch (err) {
    throw new Error('University data could not be read. Preserve the existing data file and restore a verified snapshot before starting.');
  }

  const initialDb: AppDatabase = {
    users: DEMO_USERS,
    tasks: INITIAL_TASKS,
    courses: INITIAL_COURSES,
    sections: INITIAL_SECTIONS,
    student: DEMO_STUDENT,
    registrations: DEMO_REGISTRATIONS,
    financialAccount: DEMO_FINANCIAL_ACCOUNT,
    applications: DEMO_APPLICATIONS,
    policies: NCHE_POLICY_REGISTRY,
    materials: INITIAL_MATERIALS,
    messages: INITIAL_MESSAGES,
    resources: INITIAL_LIBRARY_RESOURCES,
    calendarEvents: INITIAL_CALENDAR_EVENTS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: AppDatabase) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const temporary=DB_FILE+'.tmp';
    fs.writeFileSync(temporary, JSON.stringify(db, null, 2), {encoding:'utf-8',mode:0o600});
    fs.renameSync(temporary,DB_FILE);
  } catch (err) {
    throw new Error('University data could not be saved.');
  }
}

let db = loadDatabase();

const app = express();
app.use((req,res,next)=>{
  if(/^\/api\/auth\/|^\/api\/applications$|^\/api\/campus\/integrations\//.test(req.path))return express.json({limit:'64kb'})(req,res,next);
  next();
});
const identity = installIdentity(app, { directory: DATA_DIR, users: () => db.users, save: () => saveDatabase(db) });
let platform: ReturnType<typeof installPlatform>;
const campus = installCampus(app, { directory: DATA_DIR, database: () => db, save: () => saveDatabase(db), push: targets => platform?.notifyPush(targets) });
platform = installPlatform(app, { directory: DATA_DIR, campus, identity, database: () => db, restore: data => {db=data;saveDatabase(db);} });

// Helper to record audit logs
function recordAudit(
  user: { id?: string; name?: string; role?: string },
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  req: Request
) {
  user = (req as any).actor || {id:'public',name:'Public applicant',role:'guest'};
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId: user.id || 'anonymous',
    userName: user.name || 'Anonymous User',
    userRole: user.role || 'guest',
    action,
    entityType,
    entityId,
    details,
    ipAddress: ip,
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDatabase(db);
  return entry;
}

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */
app.get('/api/auth/users', (_req: Request, res: Response) => {
  return res.json({ users: db.users });
});

/* ==========================================================================
   USER PREFERENCES & THEME PERSISTENCE ENDPOINTS
   ========================================================================== */
app.patch('/api/users/:id/theme', (req: Request, res: Response) => {
  const { id } = req.params;
  const { theme } = req.body;

  if (theme !== 'dark' && theme !== 'light') {
    return res.status(400).json({ error: 'Theme must be either "dark" or "light".' });
  }

  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: `User with id "${id}" not found.` });
  }

  db.users[userIndex].themePreference = theme;
  saveDatabase(db);

  recordAudit(
    db.users[userIndex],
    'USER_THEME_UPDATED',
    'UserProfile',
    id,
    `Accessibility theme updated to "${theme}" mode for ${db.users[userIndex].name}`,
    req
  );

  return res.json({
    success: true,
    user: db.users[userIndex],
    themePreference: theme,
    message: `Theme preference saved as ${theme} mode.`,
  });
});

/* ==========================================================================
   ACADEMIC CALENDAR & EXAM SYNC ENDPOINTS
   ========================================================================== */
app.get('/api/calendar/events', (req: Request, res: Response) => {
  const { type, search, courseCode } = req.query;

  const filtered = filterCalendarEvents(db.calendarEvents, {
    eventType: (type as any) || 'all',
    search: typeof search === 'string' ? search : undefined,
    courseCode: typeof courseCode === 'string' ? courseCode : undefined,
  });

  return res.json({
    events: filtered,
    total: filtered.length,
    academicYear: '2026/2027',
    currentTerm: 'Semester I',
  });
});

app.post('/api/calendar/events', (req: Request, res: Response) => {
  const {
    title,
    description,
    eventType = 'exam',
    startDate,
    endDate,
    location,
    courseCode,
    isMandatory = true,
    statutoryRef,
    term = 'Semester I 2026/2027',
  } = req.body;

  if (!title || !description || !startDate) {
    return res.status(400).json({ error: 'Title, description, and startDate are required.' });
  }

  const newEvent: AcademicCalendarEvent = {
    id: `cal-${Date.now()}`,
    title,
    description,
    eventType,
    startDate,
    endDate: endDate || startDate,
    location,
    courseCode,
    isMandatory,
    statutoryRef,
    term,
  };

  db.calendarEvents.push(newEvent);
  saveDatabase(db);

  return res.status(201).json({
    success: true,
    event: newEvent,
  });
});

app.get('/api/calendar/export.ics', (req: Request, res: Response) => {
  const { type, courseCode } = req.query;

  const filtered = filterCalendarEvents(db.calendarEvents, {
    eventType: (type as any) || 'all',
    courseCode: typeof courseCode === 'string' ? courseCode : undefined,
  });

  const icsData = generateIcsCalendar(filtered, "Gwoah's University Senate Calendar");

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="gwoahs-university-academic-calendar.ics"');
  return res.send(icsData);
});


/* ==========================================================================
   TASK MANAGEMENT DASHBOARD & ANALYTICS ENDPOINTS
   ========================================================================== */
app.get('/api/tasks', (req: Request, res: Response) => {
  const { category, priority, status, department, search } = req.query;

  let results = res.locals.actor.role==='student' ? db.tasks.filter(t=>t.assigneeEmail===res.locals.actor.email) : [...db.tasks];

  if (category && category !== 'all') {
    results = results.filter((t) => t.category === category);
  }
  if (priority && priority !== 'all') {
    results = results.filter((t) => t.priority === priority);
  }
  if (status && status !== 'all') {
    results = results.filter((t) => t.status === status);
  }
  if (department && department !== 'all') {
    results = results.filter((t) => t.department === department);
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assigneeName.toLowerCase().includes(q)
    );
  }

  // Return tasks sorted by updated/created date descending
  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return res.json({ tasks: results });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    priority,
    status = 'todo',
    assigneeName,
    assigneeRole = 'super_admin',
    assigneeEmail,
    dueDate,
    department,
    tags = [],
    estimatedHours = 10,
    slaDays = 14,
  } = req.body;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({ error: 'Title, description, category, and priority are required.' });
  }

  const newTask: UniversityTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    category,
    priority,
    status,
    assigneeName: assigneeName || 'Dr. Gabriel M. Gwoah',
    assigneeRole,
    assigneeEmail: assigneeEmail || 'president@gwoah.edu.lr',
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedHours: Number(estimatedHours) || 8,
    actualHours: 0,
    tags: Array.isArray(tags) ? tags : [category],
    department: department || 'Registry',
    slaDays: Number(slaDays) || 14,
  };

  db.tasks.unshift(newTask);
  saveDatabase(db);

  recordAudit(
    { name: newTask.assigneeName, role: newTask.assigneeRole },
    'TASK_CREATED',
    'UniversityTask',
    newTask.id,
    `Created task: "${newTask.title}" [Priority: ${newTask.priority}]`,
    req
  );

  return res.status(201).json({ success: true, task: newTask });
});

app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existing = db.tasks[index];
  const updated: UniversityTask = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (req.body.status === 'completed' && existing.status !== 'completed') {
    updated.actualHours = updated.actualHours || updated.estimatedHours || 6;
  }

  db.tasks[index] = updated;
  saveDatabase(db);

  recordAudit(
    { name: updated.assigneeName, role: updated.assigneeRole },
    'TASK_STATUS_UPDATED',
    'UniversityTask',
    updated.id,
    `Updated task "${updated.title}" status to "${updated.status}"`,
    req
  );

  return res.json({ success: true, task: updated });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = db.tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.tasks = db.tasks.filter((t) => t.id !== id);
  saveDatabase(db);

  recordAudit(
    { name: 'Admin', role: 'super_admin' },
    'TASK_DELETED',
    'UniversityTask',
    id,
    `Deleted task "${task.title}"`,
    req
  );

  return res.json({ success: true, message: 'Task deleted successfully' });
});

/* ==========================================================================
   INTEGRATED ANALYTICS HUB
   ========================================================================== */
app.get('/api/analytics/overview', (_req: Request, res: Response) => {
  const taskMetrics = computeTaskAnalytics(db.tasks);

  // Admissions Funnel
  const totalApps = db.applications.length;
  const admittedApps = db.applications.filter((a) => a.status === 'admitted').length;
  const underReviewApps = db.applications.filter((a) => a.status === 'under_review').length;
  const conditionalApps = db.applications.filter((a) => a.status === 'conditional').length;

  // Enrollment metrics
  const totalEnrolled = db.sections.reduce((acc, sec) => acc + sec.enrolled, 0);
  const totalCapacity = db.sections.reduce((acc, sec) => acc + sec.capacity, 0);
  const capacityUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Financial summary
  const tuitionBilled = 124500.00;
  const tuitionCollected = 98200.00;
  const scholarshipSubsidy = 14800.00;
  const outstandingReceivables = tuitionBilled - (tuitionCollected + scholarshipSubsidy);
  const collectionRate = Math.round(((tuitionCollected + scholarshipSubsidy) / tuitionBilled) * 100);

  // College distribution
  const collegeEnrollment = [
    { college: 'Engineering & Computing', enrolled: 485, color: '#2563eb' },
    { college: 'Health & Medical Sciences', enrolled: 410, color: '#059669' },
    { college: 'Business & Public Admin', enrolled: 520, color: '#d97706' },
    { college: 'Agriculture & Forestry', enrolled: 260, color: '#16a34a' },
    { college: 'Education & Leadership', enrolled: 175, color: '#7c3aed' },
  ];

  // NCHE Compliance Rate
  const compliantPolicies = db.policies.filter((p) => p.complianceStatus === 'Compliant').length;
  const ncheComplianceScore = Math.round((compliantPolicies / db.policies.length) * 100);

  return res.json({
    taskMetrics,
    admissionsFunnel: {
      totalApplications: totalApps,
      admitted: admittedApps,
      underReview: underReviewApps,
      conditional: conditionalApps,
      conversionRate: totalApps > 0 ? Math.round((admittedApps / totalApps) * 100) : 0,
    },
    academics: {
      activeStudents: 1850,
      totalCourseSections: db.sections.length,
      totalEnrolledSeats: totalEnrolled,
      totalCapacitySeats: totalCapacity,
      capacityUtilization,
      averageCGPA: 3.18,
      attendanceRate: 92.4,
    },
    finance: {
      tuitionBilledUSD: tuitionBilled,
      tuitionCollectedUSD: tuitionCollected,
      scholarshipSubsidyUSD: scholarshipSubsidy,
      outstandingReceivablesUSD: outstandingReceivables,
      collectionRate,
    },
    collegeEnrollment,
    compliance: {
      ncheScore: ncheComplianceScore,
      totalPoliciesTracked: db.policies.length,
      auditLogCount: db.auditLogs.length,
    },
  });
});

/* ==========================================================================
   ACADEMIC, COURSES & ADD/DROP REGISTRATION
   ========================================================================== */
app.get('/api/courses', (_req: Request, res: Response) => {
  return res.json({
    courses: db.courses,
    sections: db.sections,
  });
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (db.student.id !== id) return res.status(404).json({ error: 'Student record not found.' });
  const student = db.student;
  const regs = db.registrations.filter((r) => r.studentId === student.id);
  const fin = ['super_admin', 'registrar', 'bursar', 'student'].includes(res.locals.actor.role) ? db.financialAccount : null;

  // Recalculate GPA dynamically
  const gradeEntries = regs
    .filter((r) => r.status === 'registered' && r.grade)
    .map((r) => ({
      courseCode: r.courseCode,
      credits: r.credits,
      letterGrade: r.grade!,
    }));

  const currentGPA = calculateGPA(gradeEntries) || student.cgpa;
  const standing = evaluateAcademicStanding(currentGPA);

  return res.json({
    student: {
      ...student,
      cgpa: currentGPA,
      academicStanding: standing,
    },
    registrations: regs,
    financialAccount: fin,
  });
});

app.post('/api/registration/add', (req: Request, res: Response) => {
  const { studentId, sectionId } = req.body;

  const section = db.sections.find((s) => s.id === sectionId);
  if (!section) {
    return res.status(404).json({ error: 'Course section not found' });
  }

  const course = db.courses.find((c) => c.id === section.courseId);
  const student = db.student;

  // Check if student is already registered
  const existingReg = db.registrations.find(
    (r) => r.studentId === studentId && r.courseCode === section.courseCode && r.status === 'registered'
  );
  if (existingReg) {
    return res.status(400).json({ error: `Already enrolled in ${section.courseCode}` });
  }

  // Calculate current active registered credits
  const currentCredits = db.registrations
    .filter((r) => r.studentId === studentId && r.status === 'registered')
    .reduce((sum, r) => sum + r.credits, 0);

  const courseCredits = course ? course.credits : 3;

  // Check completed prereqs
  const completedPrereqs = ['MAT 101', 'CSC 101', 'ENG 101'];

  const validation = validateCourseAdd({
    currentCredits,
    courseCredits,
    enrolledStudents: section.enrolled,
    capacity: section.capacity,
    studentCompletedPrereqs: completedPrereqs,
    coursePrereqs: course ? course.prerequisites : [],
    hasFinancialHold: student.financialHold,
  });

  if (!validation.allowed) {
    return res.status(400).json({ error: validation.error });
  }

  // Register
  const newReg: StudentRegistrationItem = {
    id: `reg-${Date.now()}`,
    studentId,
    sectionId: section.id,
    courseCode: section.courseCode,
    courseTitle: section.courseTitle,
    credits: courseCredits,
    status: 'registered',
    registeredDate: new Date().toISOString(),
  };

  db.registrations.push(newReg);
  section.enrolled += 1;
  saveDatabase(db);

  recordAudit(
    { id: student.id, name: student.fullName, role: 'student' },
    'COURSE_REGISTERED',
    'StudentRegistrationItem',
    newReg.id,
    `Registered for ${section.courseCode} (${section.sectionCode}) - ${courseCredits} credits`,
    req
  );

  return res.json({
    success: true,
    message: `Successfully registered for ${section.courseCode}`,
    registration: newReg,
  });
});

app.post('/api/registration/drop', (req: Request, res: Response) => {
  const { studentId, registrationId, reason = 'Academic load realignment' } = req.body;

  const regIndex = db.registrations.findIndex(
    (r) => r.id === registrationId && r.studentId === studentId && r.status === 'registered'
  );

  if (regIndex === -1) {
    return res.status(404).json({ error: 'Active registration record not found' });
  }

  const regItem = db.registrations[regIndex];
  const section = db.sections.find((s) => s.id === regItem.sectionId);

  const currentCredits = db.registrations
    .filter((r) => r.studentId === studentId && r.status === 'registered')
    .reduce((sum, r) => sum + r.credits, 0);

  // Validate drop against minimum 12 credits full-time floor
  const validation = validateCourseDrop({
    currentCredits,
    courseCredits: regItem.credits,
    courseFeeUSD: regItem.credits * 45,
    minCreditsLimit: 12,
    semesterWeek: 2, // Within official Add/Drop window (Week 2)
  });

  if (!validation.allowed) {
    return res.status(400).json({ error: validation.reason });
  }

  // Update registration
  regItem.status = validation.recordedStatus;
  regItem.droppedDate = new Date().toISOString();
  regItem.dropReason = reason;

  if (section && section.enrolled > 0) {
    section.enrolled -= 1;
  }

  saveDatabase(db);

  recordAudit(
    { id: studentId, name: db.student.fullName, role: 'student' },
    'COURSE_DROPPED',
    'StudentRegistrationItem',
    regItem.id,
    `Dropped course ${regItem.courseCode} (${regItem.credits} cr). Refund Adjustment: $${Math.abs(validation.financialAdjustmentUSD)}. Reason: ${reason}`,
    req
  );

  return res.json({
    success: true,
    message: `Course ${regItem.courseCode} dropped successfully. Status: ${validation.recordedStatus}`,
    registration: regItem,
    refundAdjustmentUSD: validation.financialAdjustmentUSD,
  });
});

/* ==========================================================================
   ADMISSIONS ENDPOINTS
   ========================================================================== */
app.get('/api/applications', (_req: Request, res: Response) => {
  return res.json({ applications: db.applications });
});

app.post('/api/applications', (req: Request, res: Response) => {
  const { applicantName, email, phone, programDesired, faculty, wassceIndex, wassceCoreSubjects } = req.body;

  if (!applicantName || !email || !programDesired) {
    return res.status(400).json({ error: 'Applicant name, email, and program are required' });
  }

  const newApp: ApplicationRecord = {
    id: `app-${Date.now()}`,
    applicationNumber: `GU-APP-2026-${Math.floor(100 + Math.random() * 900)}`,
    applicantName,
    email,
    phone: phone || '',
    programDesired,
    faculty: faculty || 'College of Engineering & Technology',
    wassceIndex: wassceIndex || '',
    wassceCoreSubjects: Array.isArray(wassceCoreSubjects)
      ? wassceCoreSubjects
      : [],
    applicationDate: new Date().toISOString(),
    status: 'under_review',
    scoringTotal: 0,
    applicationFeePaid: false,
  };

  db.applications.unshift(newApp);
  saveDatabase(db);

  recordAudit(
    { name: applicantName, role: 'applicant' },
    'APPLICATION_SUBMITTED',
    'ApplicationRecord',
    newApp.id,
    `New application submitted for ${newApp.programDesired} (App #${newApp.applicationNumber})`,
    req
  );

  return res.status(201).json({ success: true, application: newApp });
});

app.patch('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewerNotes, scoringTotal } = req.body;

  const appRecord = db.applications.find((a) => a.id === id);
  if (!appRecord) {
    return res.status(404).json({ error: 'Application record not found' });
  }

  if (status) appRecord.status = status;
  if (reviewerNotes !== undefined) appRecord.reviewerNotes = reviewerNotes;
  if (scoringTotal !== undefined) appRecord.scoringTotal = Number(scoringTotal);

  saveDatabase(db);

  recordAudit(
    { name: 'Admissions Officer', role: 'admissions_officer' },
    'APPLICATION_DECISION_UPDATED',
    'ApplicationRecord',
    id,
    `Admissions status for ${appRecord.applicantName} updated to "${appRecord.status}"`,
    req
  );

  return res.json({ success: true, application: appRecord });
});

/* ==========================================================================
   FINANCE & BURSAR ENDPOINTS
   ========================================================================== */
app.get('/api/finance/student/:id', (_req: Request, res: Response) => {
  return res.json({ account: db.financialAccount });
});

app.post('/api/finance/pay', (req: Request, res: Response) => {
  const { amountUSD, paymentMethod, reference } = req.body;

  const paymentAmount = Number(amountUSD);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  const newTx = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: (paymentMethod?.includes('Money') ? 'Mobile Money' : 'Bank Deposit') as any,
    reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    amountUSD: paymentAmount,
    paymentMethod: paymentMethod || 'Lonestar MTN Mobile Money',
    receivedBy: 'Bursar Automated Cashier',
  };

  db.financialAccount.transactions.unshift(newTx);
  db.financialAccount.totalPaidUSD += paymentAmount;
  db.financialAccount.currentBalanceUSD = Math.max(0, db.financialAccount.currentBalanceUSD - paymentAmount);

  if (db.financialAccount.currentBalanceUSD === 0) {
    db.financialAccount.status = 'cleared';
    db.student.financialHold = false;
  }

  saveDatabase(db);

  recordAudit(
    { name: 'Bursar Cashier', role: 'bursar' },
    'PAYMENT_RECORDED',
    'FinancialTransaction',
    newTx.id,
    `Processed $${paymentAmount.toFixed(2)} via ${newTx.paymentMethod} (Ref: ${newTx.reference})`,
    req
  );

  return res.json({
    success: true,
    message: `Payment of $${paymentAmount.toFixed(2)} recorded. Updated balance: $${db.financialAccount.currentBalanceUSD.toFixed(2)}`,
    account: db.financialAccount,
    transaction: newTx,
  });
});

/* ==========================================================================
   FACULTY ROSTER & GRADE UPDATE ENDPOINTS
   ========================================================================== */
app.get('/api/faculty/roster/:sectionId', (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const section = db.sections.find((s) => s.id === sectionId);
  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  if(res.locals.actor.role==='lecturer'&&section.lecturerName!==res.locals.actor.name)return res.status(403).json({error:'This section is not assigned to your account.'});
  // Get registrations for this section
  const sectionRegs = db.registrations.filter((r) => r.sectionId === sectionId && r.status === 'registered');

  const roster = sectionRegs.map((reg) => ({
    registrationId: reg.id,
    studentId: reg.studentId,
    studentNumber: db.student.studentNumber,
    studentName: db.student.fullName,
    courseCode: reg.courseCode,
    credits: reg.credits,
    score: reg.score ?? 85,
    grade: reg.grade || scoreToLetterGrade(reg.score ?? 85),
    attendanceRate: 94,
  }));

  return res.json({
    section,
    roster,
  });
});

app.post('/api/faculty/grades', (req: Request, res: Response) => {
  const { registrationId, score, letterGrade, facultyName } = req.body;
  const reg = db.registrations.find((r) => r.id === registrationId);
  if (!reg) {
    return res.status(404).json({ error: 'Registration record not found' });
  }

  if(res.locals.actor.role==='lecturer'&&!db.sections.some(s=>s.id===reg.sectionId&&s.lecturerName===res.locals.actor.name))return res.status(403).json({error:'This grade is outside your assigned sections.'});
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) return res.status(400).json({error:'Score must be between 0 and 100.'});
  const grade = scoreToLetterGrade(numericScore);

  reg.score = numericScore;
  reg.grade = grade;

  // Recalculate student GPA
  const activeRegs = db.registrations.filter((r) => r.studentId === reg.studentId && r.status === 'registered' && r.grade);
  const newGPA = calculateGPA(activeRegs.map((r) => ({ courseCode: r.courseCode, credits: r.credits, letterGrade: r.grade! })));
  db.student.cgpa = newGPA;
  db.student.academicStanding = evaluateAcademicStanding(newGPA);

  saveDatabase(db);

  recordAudit(
    { name: facultyName || 'Faculty Lecturer', role: 'lecturer' },
    'GRADE_AMENDED',
    'StudentRegistrationItem',
    reg.id,
    `Updated final score to ${numericScore}% (${grade}) for course ${reg.courseCode}. New CGPA: ${newGPA}`,
    req
  );

  return res.json({
    success: true,
    message: `Grade updated for ${reg.courseCode}: Score ${numericScore} (${grade}). Student CGPA recalculated to ${newGPA}.`,
    registration: reg,
    student: db.student,
  });
});

/* ==========================================================================
   COURSE MATERIALS (SYLLABI & LECTURE NOTES) ENDPOINTS
   ========================================================================== */
app.get('/api/materials', (req: Request, res: Response) => {
  const { courseCode } = req.query;
  let materials = db.materials || [];
  if (courseCode && typeof courseCode === 'string') {
    materials = materials.filter((m) => m.courseCode.toLowerCase() === courseCode.toLowerCase());
  }
  return res.json({ materials });
});

app.post('/api/materials', (req: Request, res: Response) => {
  const { courseCode, title, weekNumber, type, description, facultyAuthor } = req.body;
  if (!courseCode || !title || !type) {
    return res.status(400).json({ error: 'courseCode, title, and type are required' });
  }

  const newMaterial: CourseMaterial = {
    id: `mat-${Date.now()}`,
    courseCode,
    title,
    weekNumber: Number(weekNumber) || 1,
    type,
    description: description || 'Course study material and lecture slides',
    fileSizeKB: Math.floor(200 + Math.random() * 800),
    downloadUrl: '#',
    uploadedDate: new Date().toISOString(),
    facultyAuthor: facultyAuthor || 'Faculty Instructor',
  };

  if (!db.materials) db.materials = [];
  db.materials.unshift(newMaterial);
  saveDatabase(db);

  recordAudit(
    { name: facultyAuthor || 'Faculty Lecturer', role: 'lecturer' },
    'MATERIAL_UPLOADED',
    'CourseMaterial',
    newMaterial.id,
    `Uploaded ${newMaterial.type}: "${newMaterial.title}" for ${newMaterial.courseCode}`,
    req
  );

  return res.status(201).json({ success: true, material: newMaterial });
});

/* ==========================================================================
   SHARED RESOURCE LIBRARY ENDPOINTS (Course Materials, NCHE, Handbooks)
   ========================================================================== */
app.get('/api/resources', (req: Request, res: Response) => {
  const { category, courseCode, search, subcategory } = req.query;
  let resources = db.resources || INITIAL_LIBRARY_RESOURCES;

  if (category && typeof category === 'string' && category !== 'all') {
    resources = resources.filter((r) => r.category === category);
  }
  if (subcategory && typeof subcategory === 'string' && subcategory !== 'all') {
    resources = resources.filter((r) => r.subcategory.toLowerCase() === subcategory.toLowerCase());
  }
  if (courseCode && typeof courseCode === 'string' && courseCode !== 'all') {
    resources = resources.filter((r) => r.courseCode?.toLowerCase() === courseCode.toLowerCase());
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.authorOrAuthority.toLowerCase().includes(q) ||
        (r.statutoryReference && r.statutoryReference.toLowerCase().includes(q)) ||
        (r.courseCode && r.courseCode.toLowerCase().includes(q)) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return res.json({ resources });
});

app.get('/api/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const resource = (db.resources || INITIAL_LIBRARY_RESOURCES).find((r) => r.id === id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.json({ resource });
});

/* ==========================================================================
   FACULTY - STUDENT MESSAGING ENDPOINTS
   ========================================================================== */
app.get('/api/messages', (req: Request, res: Response) => {
  const userId = res.locals.actor.id;
  let msgs = db.messages || [];
  if (userId && typeof userId === 'string') {
    msgs = msgs.filter((m) => m.senderId === userId || m.recipientId === userId);
  }
  return res.json({ messages: msgs });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { senderId, senderName, senderRole, recipientId, recipientName, courseCode, subject, content } = req.body;
  if (!senderId || !recipientId || !content) {
    return res.status(400).json({ error: 'senderId, recipientId, and content are required' });
  }

  const newMsg: DirectMessage = {
    id: `msg-${Date.now()}`,
    senderId,
    senderName: senderName || 'User',
    senderRole: senderRole || 'student',
    recipientId,
    recipientName: recipientName || 'Recipient',
    courseCode: courseCode || 'General',
    subject: subject || 'Course Inquiry',
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  if (!db.messages) db.messages = [];
  db.messages.unshift(newMsg);
  saveDatabase(db);

  recordAudit(
    { name: senderName, role: senderRole },
    'MESSAGE_SENT',
    'DirectMessage',
    newMsg.id,
    `Direct message sent from ${senderName} to ${recipientName} regarding "${newMsg.subject}"`,
    req
  );

  return res.status(201).json({ success: true, message: newMsg });
});

/* ==========================================================================
   ADMINISTRATOR USER & CATALOG MANAGEMENT
   ========================================================================== */
app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, role, title, department, staffId } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const newUser: UserProfile = {
    id: `u-${Date.now()}`,
    name,
    email,
    role,
    title: title || `${role} Member`,
    department: department || 'Academic Affairs',
    staffId: staffId || `GU-STF-${Math.floor(100 + Math.random() * 900)}`,
  };

  db.users.push(newUser);
  saveDatabase(db);

  recordAudit(
    { name: 'Admin', role: 'super_admin' },
    'USER_CREATED',
    'UserProfile',
    newUser.id,
    `Created user account for ${newUser.name} with role ${newUser.role}`,
    req
  );

  return res.status(201).json({ success: true, user: newUser });
});

app.patch('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  Object.assign(user, req.body);
  saveDatabase(db);

  recordAudit(
    { name: 'Admin', role: 'super_admin' },
    'USER_UPDATED',
    'UserProfile',
    id,
    `Updated account details for ${user.name}`,
    req
  );

  return res.json({ success: true, user });
});

app.post('/api/admin/courses', (req: Request, res: Response) => {
  const { code, title, credits, department, faculty, description, feePerCreditUSD } = req.body;
  if (!code || !title || !credits) {
    return res.status(400).json({ error: 'Course code, title, and credits are required' });
  }

  const newCourse = {
    id: `c-${code.toLowerCase().replace(/\s+/g, '')}`,
    code,
    title,
    credits: Number(credits),
    department: department || 'General Education',
    faculty: faculty || 'Arts & Sciences',
    description: description || 'Senate approved course curriculum.',
    prerequisites: [],
    level: 100 as const,
    feePerCreditUSD: Number(feePerCreditUSD) || 40,
  };

  db.courses.push(newCourse);
  saveDatabase(db);

  recordAudit(
    { name: 'Admin', role: 'super_admin' },
    'COURSE_CREATED',
    'Course',
    newCourse.id,
    `Added course ${newCourse.code}: ${newCourse.title} (${newCourse.credits} cr) to university catalog`,
    req
  );

  return res.status(201).json({ success: true, course: newCourse });
});

app.post('/api/admin/sections', (req: Request, res: Response) => {
  const { courseCode, sectionCode, lecturerName, schedule, room, capacity } = req.body;
  const course = db.courses.find((c) => c.code === courseCode);

  const newSection = {
    id: `sec-${courseCode.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
    courseId: course ? course.id : 'c-gen',
    courseCode,
    courseTitle: course ? course.title : courseCode,
    sectionCode: sectionCode || 'Section 01',
    lecturerName: lecturerName || 'Dr. Moses S. Doe',
    schedule: schedule || 'Mon/Wed 10:00 AM - 12:00 PM',
    room: room || 'Hall A, Monrovia Campus',
    capacity: Number(capacity) || 40,
    enrolled: 0,
    semester: 'Semester I',
    academicYear: '2026/2027',
  };

  db.sections.push(newSection);
  saveDatabase(db);

  recordAudit(
    { name: 'Admin', role: 'super_admin' },
    'SECTION_CREATED',
    'CourseSection',
    newSection.id,
    `Scheduled section ${newSection.courseCode} (${newSection.sectionCode}) with ${newSection.lecturerName}`,
    req
  );

  return res.status(201).json({ success: true, section: newSection });
});

/* ==========================================================================
   POLICY, NCHE ACCREDITATION & AUDIT ENDPOINTS
   ========================================================================== */
app.get('/api/policies', (_req: Request, res: Response) => {
  return res.json({ policies: db.policies });
});

app.get('/api/audit', (_req: Request, res: Response) => {
  return res.json({ auditLogs: db.auditLogs });
});

app.post('/api/reset-demo', (req: Request, res: Response) => {
  db = {
    users: DEMO_USERS,
    tasks: INITIAL_TASKS,
    courses: INITIAL_COURSES,
    sections: INITIAL_SECTIONS,
    student: DEMO_STUDENT,
    registrations: DEMO_REGISTRATIONS,
    financialAccount: DEMO_FINANCIAL_ACCOUNT,
    applications: DEMO_APPLICATIONS,
    policies: NCHE_POLICY_REGISTRY,
    materials: INITIAL_MATERIALS,
    messages: INITIAL_MESSAGES,
    resources: INITIAL_LIBRARY_RESOURCES,
    calendarEvents: INITIAL_CALENDAR_EVENTS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
  saveDatabase(db);

  recordAudit(
    { name: 'System Admin', role: 'super_admin' },
    'DEMO_DATA_RESET',
    'AppDatabase',
    'all',
    'Reset all university ERP demonstration records to initial state',
    req
  );

  return res.json({ success: true, message: 'Demo data re-initialized successfully' });
});

/* ==========================================================================
   VITE DEV MIDDLEWARE OR STATIC SERVING
   ========================================================================== */
app.use('/api', (_req, res) => res.status(404).json({error:'API endpoint not found.'}));
app.use((error:any,_req:Request,res:Response,_next:any)=>res.status(500).json({error:'The server could not complete this operation.'}));

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gwoah's University ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
