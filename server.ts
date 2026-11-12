import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Operations } from './server/operations';
import { installIdentity } from './server/identity';
import { installPlatform } from './server/platform';
import { installWorkspaces } from './server/workspaces';
import {installStudentPlanning} from './server/studentPlanning';
import {installStudentAssistance} from './server/studentAssistance';
import { installCurriculumStudio } from './server/curriculum';
import {installPublicWebsiteMedia} from './server/publicWebsiteMedia';
import { installPublicAdmissions } from './server/publicAdmissions';
import {installPublicStaffProfiles} from './server/publicStaffProfiles';
import {installCampusContent} from './server/campusContent';
import {installWebsiteCms} from './server/websiteCms';
import {installPublicNewsEvents} from './server/publicNewsEvents';
import { installLiveAnalytics } from './server/liveAnalytics';
import { installDirectMessages } from './server/directMessages';

const root = path.dirname(fileURLToPath(import.meta.url));
const directory = process.env.DATA_DIR || path.join(root, 'data');
const operations = new Operations(directory);
operations.migrateLegacy();
let users = operations.users();
const app = express();
app.use((req, res, next) => {
  if (/^\/api\/auth\//.test(req.path) || (req.path === '/api/applications' && req.method === 'POST'))
    return express.json({ limit: req.path === '/api/applications' ? '12kb' : '64kb' })(req, res, next);
  next();
});
const identity = installIdentity(app, {
  directory,
  users: () => users,
  save: () => {
    operations.saveUsers(users);
    users = operations.users();
  },
});
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', version: '0.4.0', schemaVersion: 1 }),
);
installPublicAdmissions(app, operations);
installWorkspaces(app, operations);
installStudentPlanning(app,operations);
installStudentAssistance(app,operations);
installCurriculumStudio(app, operations);
installPublicWebsiteMedia(app, operations, directory);
installPublicStaffProfiles(app, operations, directory);
installCampusContent(app, operations, directory);
installWebsiteCms(app, operations);
installPublicNewsEvents(app, operations, directory);
installLiveAnalytics(app, operations);
installDirectMessages(app, operations);
const emptyCampus = () => ({
  documents: [],
  bookings: [],
  plans: [],
  meetings: [],
});
const campus = {
  snapshot: () => {
    const row = operations.one(
      "SELECT value FROM settings WHERE key='campus_state'",
    );
    return row ? JSON.parse(row.value) : emptyCampus();
  },
  restore: (data: any) => {
    operations.run(
      "INSERT INTO settings VALUES('campus_state',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      JSON.stringify(data),
    );
  },
  recordActivity: (user: string, title: string) =>
    operations.audit(user, 'RESOURCE_ACTIVITY', 'resources', null, { title }),
};
installPlatform(app, {
  directory,
  campus,
  identity,
  database: () => operations.exportSnapshot(),
  restore: (data) => operations.importSnapshot(data),
});
app.use('/api', (_req, res) =>
  res.status(404).json({ error: 'API endpoint not found.' }),
);
app.use((error: any, _req: any, res: any, _next: any) =>
  res
    .status(500)
    .json({ error: 'The server could not complete this operation.' }),
);
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Installed Staff/Student PWA navigations must fetch the current app shell,
    // not a cached institutional ERP route from an earlier deployment.
    app.use((req, res, next) => {
      if (req.method === 'GET' &&
          (req.path === '/sw.js' || req.path.endsWith('.webmanifest') ||
           req.path === '/staff' || req.path.startsWith('/staff/') ||
           req.path === '/student' || req.path.startsWith('/student/'))) {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
      }
      next();
    });
    app.use(express.static(path.join(root, 'dist')));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.sendFile(path.join(root, 'dist', 'index.html'));
    });
  }
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () =>
    console.log('University operations listening on port ' + port),
  );
}
start();
