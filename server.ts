import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
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
import { INITIAL_NOTIFICATIONS } from './src/data/notificationData';
import { INITIAL_PEER_THREADS, INITIAL_PEER_MESSAGES } from './src/data/peerDiscussionData';
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
  PortalNotification,
  PeerDiscussionThread,
  PeerDiscussionMessage,
} from './src/types';
import { generateIcsCalendar, filterCalendarEvents } from './src/utils/calendarSync';
import { computeTaskAnalytics } from './src/utils/taskAnalytics';
import { DEFAULT_PUBLIC_VIDEOS, type PublicVideo } from './src/data/publicMedia';
import { mediaAuthRouter, requireMediaAdministrator } from './src/server/mediaAuth';
import { checkMp4Upload } from './src/server/mp4Validation';
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
const DATA_ROOT = process.env.HIAU_DATA_DIR ? path.resolve(process.env.HIAU_DATA_DIR) : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_ROOT, 'university-db.json');

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
  notifications: PortalNotification[];
  peerThreads: PeerDiscussionThread[];
  peerMessages: PeerDiscussionMessage[];
}

// Active Server-Sent Events subscribers for real-time notification push
const sseClients = new Set<Response>();

function broadcastNotification(notification: PortalNotification) {
  const data = JSON.stringify(notification);
  for (const client of sseClients) {
    try {
      client.write(`event: notification\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
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
      if (!parsed.notifications || parsed.notifications.length === 0) {
        parsed.notifications = INITIAL_NOTIFICATIONS;
      }
      if (!parsed.peerThreads || parsed.peerThreads.length === 0) {
        parsed.peerThreads = INITIAL_PEER_THREADS;
      }
      if (!parsed.peerMessages || parsed.peerMessages.length === 0) {
        parsed.peerMessages = INITIAL_PEER_MESSAGES;
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read db file, loading initial demo seeds:', err);
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
    notifications: INITIAL_NOTIFICATIONS,
    peerThreads: INITIAL_PEER_THREADS,
    peerMessages: INITIAL_PEER_MESSAGES,
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
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

let db = loadDatabase();

const app = express();
app.use(express.json());
 
// Public website media are persisted independently of seeded ERP demonstration data.
// Mounted persistent storage is required before production publication.
const MEDIA_FILE = path.join(DATA_ROOT, 'public-videos.json');
const MEDIA_UPLOAD_DIR = path.join(DATA_ROOT, 'public-media-uploads');
const MEDIA_CATEGORIES = ['campus', 'academics', 'events', 'student-life', 'other'] as const;
function validVideo(value: unknown): value is PublicVideo {
  if (!value || typeof value !== 'object') return false;
  const v = value as PublicVideo;
  return typeof v.id === 'string' && /^[a-zA-Z0-9_-]{1,90}$/.test(v.id) &&
    typeof v.title === 'string' && v.title.length > 0 && v.title.length <= 160 &&
    typeof v.subtitle === 'string' && v.subtitle.length <= 240 &&
    typeof v.src === 'string' && (v.src === '' || safeMediaPath(v.src)) &&
    typeof v.poster === 'string' && (v.poster === '' || safeMediaPath(v.poster)) &&
    (v.status === 'draft' || v.status === 'published') &&
    typeof v.featured === 'boolean' && typeof v.order === 'number' &&
    Number.isSafeInteger(v.order) && v.order >= 0 &&
    MEDIA_CATEGORIES.includes(v.category);
}
function safeMediaPath(value: string): boolean {
  return /^\/(assets|uploads)\/[a-zA-Z0-9_./-]+$/.test(value) &&
    !value.includes('..') && !value.includes('//');
}
function readPublicVideos(): PublicVideo[] {
  try {
    if (!fs.existsSync(MEDIA_FILE)) return DEFAULT_PUBLIC_VIDEOS;
    const items = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf8')) as unknown;
    // Migrate the original two-video registry without discarding customizations.
    if (!Array.isArray(items)) return DEFAULT_PUBLIC_VIDEOS;
    return items.map((value, index) => {
      const original = DEFAULT_PUBLIC_VIDEOS.find(video => video.id === value?.id);
      return {
        ...original, ...value,
        category: MEDIA_CATEGORIES.includes(value?.category) ? value.category : 'other',
        status: value?.status === 'draft' ? 'draft' : 'published',
        featured: typeof value?.featured === 'boolean' ? value.featured : true,
        order: Number.isSafeInteger(value?.order) && value.order >= 0 ? value.order : index,
      };
    }).filter(validVideo);
  } catch {
    return DEFAULT_PUBLIC_VIDEOS;
  }
}
function savePublicVideos(videos: PublicVideo[]) {
  fs.mkdirSync(path.dirname(MEDIA_FILE), { recursive: true });
  const temporaryPath = MEDIA_FILE + '.' + randomUUID() + '.tmp';
  fs.writeFileSync(temporaryPath, JSON.stringify(videos, null, 2), 'utf8');
  fs.renameSync(temporaryPath, MEDIA_FILE);
}
app.get('/api/public-media/videos', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ videos: readPublicVideos()
    .filter(video => video.status === 'published' && video.src)
    .sort((a,b) => a.order - b.order) });
});
app.use('/uploads/public-videos', express.static(MEDIA_UPLOAD_DIR, {
  dotfiles: 'deny', index: false, fallthrough: false, maxAge: '1h',
}));

 
// Isolated secure login controls only the public-website media console.
// All other ERP endpoints remain closed until full university RBAC is implemented.
app.use('/api/auth', mediaAuthRouter);
app.use('/api/admin/public-media', requireMediaAdministrator);

// SECURITY HOLD: This prototype has no verified credential store, session validation,
// or role-based authorization. Fail closed on restricted ERP endpoints until a
// separately tested authentication/authorization implementation is introduced.
// The public application form and read-only academic calendar remain available.
app.use('/api', (req: Request, res: Response, next) => {
  const publicCalendar =
    req.method === 'GET' &&
    (req.path === '/calendar/events' || req.path === '/calendar/export.ics');
  const publicApplication = req.method === 'POST' && req.path === '/applications';
  const mediaAdmin = req.path.startsWith('/admin/public-media/') ||
    req.path === '/admin/public-media';
  if (publicCalendar || publicApplication || mediaAdmin) return next();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({
    success: false,
    error: 'Restricted university ERP services are unavailable until secure authentication is configured.',
  });
});


// Helper to record audit logs
function recordAudit(
  user: { id?: string; name?: string; role?: string },
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  req: Request
) {
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

// Only website-media administrator sessions pass the authorization middleware above.
// The unrelated university ERP APIs remain fail-closed.
app.get('/api/admin/public-media/videos', (_req: Request, res: Response) =>
  res.json({ videos: readPublicVideos() }));

app.post('/api/admin/public-media/videos', (req: Request, res: Response) => {
  const { title, subtitle = '', category = 'other' } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || title.length > 160 ||
      typeof subtitle !== 'string' || subtitle.length > 240 ||
      !MEDIA_CATEGORIES.includes(category))
    return res.status(400).json({ error: 'Invalid video metadata.' });
  const videos = readPublicVideos();
  const video: PublicVideo = {
    id: randomUUID(), title: title.trim(), subtitle, category, status: 'draft',
    featured: false, order: videos.length, src: '', poster: '',
    badge: 'University Video', label: title.trim(),
  };
  videos.push(video);
  savePublicVideos(videos);
  return res.status(201).json({ success: true, video, videos });
});

app.patch('/api/admin/public-media/videos/:id', (req: Request, res: Response) => {
  const videos = readPublicVideos();
  const index = videos.findIndex(v => v.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Unknown video.' });
  const original = videos[index];
  const changes = req.body || {};
  const next: PublicVideo = {
    ...original,
    title: changes.title ?? original.title,
    subtitle: changes.subtitle ?? original.subtitle,
    poster: changes.poster ?? original.poster,
    category: changes.category ?? original.category,
    status: changes.status ?? original.status,
    featured: changes.featured ?? original.featured,
    order: changes.order ?? original.order,
  };
  if (!validVideo(next) || (next.status === 'published' && !next.src))
    return res.status(400).json({ error: 'Invalid video data or missing MP4.' });
  videos[index] = next;
  savePublicVideos(videos);
  return res.json({ success: true, videos });
});

app.post('/api/admin/public-media/videos/reorder', (req: Request, res: Response) => {
  const ids: unknown = req.body?.ids;
  const videos = readPublicVideos();
  if (!Array.isArray(ids) || ids.length !== videos.length ||
      new Set(ids).size !== videos.length ||
      ids.some(id => typeof id !== 'string' || !videos.some(v => v.id === id)))
    return res.status(400).json({ error: 'Order must contain each library video exactly once.' });
  const sorted = ids.map((id, order) => ({ ...videos.find(v => v.id === id)!, order }));
  savePublicVideos(sorted);
  return res.json({ success: true, videos: sorted });
});

app.delete('/api/admin/public-media/videos/:id', (req: Request, res: Response) => {
  const videos = readPublicVideos();
  if (!videos.some(v => v.id === req.params.id)) return res.status(404).json({ error: 'Unknown video.' });
  // Remove the library entry, not the underlying media file: other references
  // and backups must be reviewed before a separate cleanup operation.
  const remaining = videos.filter(v => v.id !== req.params.id);
  savePublicVideos(remaining);
  return res.json({ success: true, videos: remaining });
});

app.post('/api/admin/public-media/videos/:id/upload',
  express.raw({ type: 'video/mp4', limit: '50mb' }),
  (req: Request, res: Response) => {
    const id = req.params.id;
    const videos = readPublicVideos();
    if (!videos.some(v => v.id === id)) return res.status(404).json({ error: 'Unknown video.' });
    const bytes = req.body;
    const validation = checkMp4Upload(bytes);
    if (!validation.ok) return res.status(415).json({ error: validation.message });
    const name = randomUUID() + '.mp4';
    const destination = path.join(MEDIA_UPLOAD_DIR, name);
    try {
      fs.mkdirSync(MEDIA_UPLOAD_DIR, { recursive: true });
      fs.writeFileSync(destination, bytes, { flag: 'wx' });
      const updated = videos.map(v => v.id === id
        ? { ...v, src: '/uploads/public-videos/' + name }
        : v);
      savePublicVideos(updated);
      return res.json({ success: true, videos: updated });
    } catch (error) {
      // Do not leave an unreferenced MP4 behind when the library update fails.
      try { fs.unlinkSync(destination); } catch { /* No new upload to remove. */ }
      console.error('Failed to persist website video upload:', error);
      return res.status(500).json({ error: 'Unable to save video. Existing library unchanged.' });
    }
  }
);

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */
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

  const icsData = generateIcsCalendar(filtered, "Harvest Intercontinental American University Senate Calendar");

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="hiau-academic-calendar-2026-2027.ics"');
  return res.send(icsData);
});


/* ==========================================================================
   PORTAL NOTIFICATIONS & REAL-TIME STREAM (SSE)
   ========================================================================== */
app.get('/api/notifications', (req: Request, res: Response) => {
  const { category, unreadOnly } = req.query;
  let list = [...db.notifications];

  if (category && category !== 'all') {
    list = list.filter((n) => n.category === category);
  }
  if (unreadOnly === 'true') {
    list = list.filter((n) => !n.read);
  }

  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return res.json({
    success: true,
    count: list.length,
    unreadCount: db.notifications.filter((n) => !n.read).length,
    notifications: list,
  });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.notifications.find((n) => n.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  target.read = true;
  saveDatabase(db);
  return res.json({
    success: true,
    notification: target,
    unreadCount: db.notifications.filter((n) => !n.read).length,
  });
});

app.post('/api/notifications/mark-all-read', (_req: Request, res: Response) => {
  db.notifications.forEach((n) => {
    n.read = true;
  });
  saveDatabase(db);
  return res.json({ success: true, unreadCount: 0 });
});

app.post('/api/notifications', (req: Request, res: Response) => {
  const { title, message, category, priority, targetTab, targetAction, badge } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const newNotif: PortalNotification = {
    id: `notif-${Date.now()}`,
    title,
    message,
    category: category || 'alert',
    priority: priority || 'normal',
    timestamp: new Date().toISOString(),
    read: false,
    targetTab,
    targetAction,
    badge,
  };

  db.notifications.unshift(newNotif);
  saveDatabase(db);
  broadcastNotification(newNotif);

  return res.status(201).json({
    success: true,
    notification: newNotif,
    unreadCount: db.notifications.filter((n) => !n.read).length,
  });
});

// SSE endpoint for real-time notification push
app.get('/api/notifications/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  res.write(
    `event: connected\ndata: ${JSON.stringify({
      status: 'connected',
      unreadCount: db.notifications.filter((n) => !n.read).length,
    })}\n\n`
  );

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/* ==========================================================================
   TASK MANAGEMENT DASHBOARD & ANALYTICS ENDPOINTS
   ========================================================================== */
app.get('/api/tasks', (req: Request, res: Response) => {
  const { category, priority, status, department, search, urgentOnly, priorityFlagged } = req.query;

  let results = [...db.tasks];

  if (urgentOnly === 'true') {
    results = results.filter((t) => t.priority === 'urgent' || t.priority === 'high' || !!t.isPriorityFlagged);
  }
  if (priorityFlagged === 'true') {
    results = results.filter((t) => !!t.isPriorityFlagged);
  }
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

  const taskNotif: PortalNotification = {
    id: `notif-${Date.now()}`,
    title: newTask.category === 'facilities_maintenance' ? `Facility Repair Ticket Logged` : `New Task Assigned: ${newTask.title}`,
    message: `${newTask.assigneeName} (${newTask.department}) • Priority: ${newTask.priority.toUpperCase()}`,
    category: newTask.category === 'facilities_maintenance' ? 'facility' : 'task',
    priority: newTask.priority === 'urgent' ? 'critical' : newTask.priority === 'high' ? 'high' : 'normal',
    timestamp: new Date().toISOString(),
    read: false,
    targetTab: 'tasks',
    targetAction: newTask.id,
    badge: newTask.category === 'facilities_maintenance' ? 'Work Order' : 'Task',
  };
  db.notifications.unshift(taskNotif);
  broadcastNotification(taskNotif);

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

  // If newly flagged as High Priority, broadcast urgent alert
  if (req.body.isPriorityFlagged && !existing.isPriorityFlagged) {
    const flagNotif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: `High Priority Flag: ${updated.title}`,
      message: `${updated.department} • Flagged by ${updated.priorityFlaggedBy || 'Faculty'} (SLA: ${updated.slaDays}d)`,
      category: 'task',
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false,
      targetTab: 'tasks',
      targetAction: updated.id,
      badge: 'Urgent Flag',
    };
    db.notifications.unshift(flagNotif);
    broadcastNotification(flagNotif);
  }

  db.tasks[index] = updated;
  saveDatabase(db);

  recordAudit(
    { name: updated.assigneeName, role: updated.assigneeRole },
    req.body.isPriorityFlagged !== undefined ? 'TASK_PRIORITY_FLAGGED' : 'TASK_STATUS_UPDATED',
    'UniversityTask',
    updated.id,
    `Updated task "${updated.title}" [Priority: ${updated.priority}, Flagged: ${!!updated.isPriorityFlagged}]`,
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
  const student = db.student.id === id ? db.student : db.student;
  const regs = db.registrations.filter((r) => r.studentId === student.id);
  const fin = db.financialAccount;

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
    phone: phone || '+231 770 000 000',
    programDesired,
    faculty: faculty || 'College of Engineering & Technology',
    wassceIndex: wassceIndex || '0010999999',
    wassceCoreSubjects: Array.isArray(wassceCoreSubjects)
      ? wassceCoreSubjects
      : [
          { subject: 'English Language', grade: 'B3' },
          { subject: 'Mathematics', grade: 'B2' },
        ],
    applicationDate: new Date().toISOString(),
    status: 'under_review',
    scoringTotal: 75,
    applicationFeePaid: true,
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

  // Get registrations for this section
  const sectionRegs = db.registrations.filter((r) => r.sectionId === sectionId && r.status === 'registered');

  const roster = sectionRegs.map((reg) => ({
    registrationId: reg.id,
    studentId: reg.studentId,
    studentNumber: db.student.studentNumber,
    studentName: db.student.fullName,
    courseCode: reg.courseCode,
    credits: reg.credits,
    score: reg.score || 85,
    grade: reg.grade || scoreToLetterGrade(reg.score || 85),
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

  const numericScore = Number(score);
  const grade = letterGrade || scoreToLetterGrade(numericScore);

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
   ACADEMIC PEER MESSAGING & STUDY GROUP THREADS ENDPOINTS
   ========================================================================== */
app.get('/api/peer-discussions/threads', (req: Request, res: Response) => {
  const { materialId, courseCode, search } = req.query;
  let threads = db.peerThreads || INITIAL_PEER_THREADS;

  if (materialId && typeof materialId === 'string' && materialId !== 'all') {
    threads = threads.filter((t) => t.materialId === materialId);
  }
  if (courseCode && typeof courseCode === 'string' && courseCode !== 'all') {
    threads = threads.filter((t) => t.courseCode.toLowerCase() === courseCode.toLowerCase());
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase();
    threads = threads.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // Sort pinned first, then by lastActivity descending
  threads.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  return res.json({ success: true, threads });
});

app.post('/api/peer-discussions/threads', (req: Request, res: Response) => {
  const { materialId, courseCode, materialTitle, title, description, creatorId, creatorName } = req.body;

  if (!materialId || !courseCode || !title) {
    return res.status(400).json({ error: 'materialId, courseCode, and title are required' });
  }

  const newThread: PeerDiscussionThread = {
    id: `thread-${Date.now()}`,
    materialId,
    courseCode,
    materialTitle: materialTitle || 'Course Material',
    title,
    description: description || '',
    createdAt: new Date().toISOString(),
    creatorId: creatorId || db.student.id,
    creatorName: creatorName || db.student.fullName,
    messagesCount: 1,
    participants: [creatorName || db.student.fullName],
    lastActivity: new Date().toISOString(),
    isPinned: false,
  };

  if (!db.peerThreads) db.peerThreads = [];
  db.peerThreads.unshift(newThread);

  // If initial message provided, save it
  if (req.body.initialMessage) {
    const initMsg: PeerDiscussionMessage = {
      id: `msg-p-${Date.now()}`,
      materialId,
      threadId: newThread.id,
      authorId: creatorId || db.student.id,
      authorName: creatorName || db.student.fullName,
      authorRole: 'Peer Student',
      authorAvatar: (creatorName || db.student.fullName).split(' ').map((n: string) => n[0]).join('').slice(0, 2),
      timestamp: new Date().toISOString(),
      content: req.body.initialMessage,
      tag: req.body.tag || 'question',
      likes: 1,
      likedBy: [creatorId || db.student.id],
    };
    if (!db.peerMessages) db.peerMessages = [];
    db.peerMessages.push(initMsg);
  }

  // Notify classmates
  const threadNotif: PortalNotification = {
    id: `notif-${Date.now()}`,
    title: `New Peer Discussion: ${newThread.title}`,
    message: `${newThread.courseCode} • Started by ${newThread.creatorName}`,
    category: 'academic',
    priority: 'normal',
    timestamp: new Date().toISOString(),
    read: false,
    targetTab: 'materials',
    targetAction: newThread.id,
    badge: 'Study Group',
  };
  db.notifications.unshift(threadNotif);
  broadcastNotification(threadNotif);

  saveDatabase(db);
  return res.status(201).json({ success: true, thread: newThread });
});

app.get('/api/peer-discussions/messages', (req: Request, res: Response) => {
  const { threadId, materialId } = req.query;
  let messages = db.peerMessages || INITIAL_PEER_MESSAGES;

  if (threadId && typeof threadId === 'string') {
    messages = messages.filter((m) => m.threadId === threadId);
  } else if (materialId && typeof materialId === 'string') {
    messages = messages.filter((m) => m.materialId === materialId);
  }

  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return res.json({ success: true, messages });
});

app.post('/api/peer-discussions/messages', (req: Request, res: Response) => {
  const { materialId, threadId, authorId, authorName, authorRole, content, tag } = req.body;

  if (!threadId || !content || !content.trim()) {
    return res.status(400).json({ error: 'threadId and content are required' });
  }

  const thread = (db.peerThreads || []).find((t) => t.id === threadId);
  const resolvedAuthorName = authorName || db.student.fullName;

  const newMsg: PeerDiscussionMessage = {
    id: `msg-p-${Date.now()}`,
    materialId: materialId || (thread ? thread.materialId : 'mat-csc301-wk2'),
    threadId,
    authorId: authorId || db.student.id,
    authorName: resolvedAuthorName,
    authorRole: authorRole || 'Peer Student',
    authorAvatar: resolvedAuthorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
    timestamp: new Date().toISOString(),
    content: content.trim(),
    tag: tag || 'solution_tip',
    likes: 0,
    likedBy: [],
  };

  if (!db.peerMessages) db.peerMessages = [];
  db.peerMessages.push(newMsg);

  if (thread) {
    thread.messagesCount = (thread.messagesCount || 0) + 1;
    thread.lastActivity = new Date().toISOString();
    if (!thread.participants.includes(resolvedAuthorName)) {
      thread.participants.push(resolvedAuthorName);
    }
  }

  saveDatabase(db);
  return res.status(201).json({ success: true, message: newMsg });
});

app.post('/api/peer-discussions/messages/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const msg = (db.peerMessages || []).find((m) => m.id === id);

  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const userId = studentId || db.student.id;
  if (!msg.likedBy) msg.likedBy = [];

  const alreadyLiked = msg.likedBy.includes(userId);
  if (alreadyLiked) {
    msg.likedBy = msg.likedBy.filter((uid) => uid !== userId);
    msg.likes = Math.max(0, msg.likes - 1);
  } else {
    msg.likedBy.push(userId);
    msg.likes = (msg.likes || 0) + 1;
  }

  saveDatabase(db);
  return res.json({ success: true, likes: msg.likes, isLiked: !alreadyLiked });
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
  const { userId } = req.query;
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
    notifications: INITIAL_NOTIFICATIONS,
    peerThreads: INITIAL_PEER_THREADS,
    peerMessages: INITIAL_PEER_MESSAGES,
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

if (process.env.HIAU_DISABLE_AUTOSTART !== '1') startServer();

export { app };
