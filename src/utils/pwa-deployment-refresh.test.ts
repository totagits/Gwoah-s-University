import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('installed Student/Staff PWAs detect deployment revision changes and reload stale app shells',()=>{
  const main=readFileSync(new URL('../main.tsx',import.meta.url),'utf8');
  const guard=readFileSync(new URL('../pwa/updateGuard.ts',import.meta.url),'utf8');
  assert.match(main,/registerPwaUpdates/);
  assert.match(guard,/\/api\/health/);
  assert.match(guard,/cache:'no-store'/);
  assert.match(guard,/sessionStorage\.getItem\(REVISION_KEY\)/);
  assert.match(guard,/window\.location\.reload\(\)/);
  assert.match(guard,/serviceWorker\.addEventListener\('controllerchange'/);
  assert.match(guard,/window\.addEventListener\('focus'/);
  assert.match(guard,/document\.addEventListener\('visibilitychange'/);
  assert.ok(guard.includes('/^\\/(?:student|staff)(?:\\/|$)/'), 'dedicated PWA path guard must cover only student/staff routes');
});

test('updated service worker refreshes only dedicated app windows and never caches authenticated pages',()=>{
  const worker=readFileSync(new URL('../../public/sw.js',import.meta.url),'utf8');
  assert.match(worker,/hiau-public-offline-v2/);
  assert.match(worker,/self\.clients\.matchAll/);
  assert.match(worker,/client\.navigate\(client\.url\)/);
  assert.match(worker,/student\|staff/);
  assert.match(worker,/req\.mode!=='navigate'/);
  assert.match(worker,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker,/fetch\(req\)\.catch\(\(\)=>caches\.match\(OFFLINE_URL\)\)/);
});

test('server continues sending no-store headers for installed app routes and service-worker metadata',()=>{
  const server=readFileSync(new URL('../../server.ts',import.meta.url),'utf8');
  assert.match(server,/req\.path === '\/sw\.js'/);
  assert.match(server,/req\.path\.startsWith\('\/staff\/'\)/);
  assert.match(server,/req\.path\.startsWith\('\/student\/'\)/);
  assert.match(server,/Cache-Control', 'no-store, max-age=0'/);
});
