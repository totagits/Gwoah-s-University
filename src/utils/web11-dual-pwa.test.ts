import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name:string)=>readFileSync(new URL(name,import.meta.url),'utf8');
const student=JSON.parse(read('../../public/student.webmanifest'));
const staff=JSON.parse(read('../../public/staff.webmanifest'));
const html=read('../../index.html'),worker=read('../../public/sw.js');
const app=read('../App.tsx'),launcher=read('../components/public/PublicInstallApp.tsx');
const entry=read('../components/portal/DedicatedAppEntry.tsx');
const tour=read('../components/public/PublicVirtualTour.tsx');
test('WEB-11 student and staff have separate install identities and launch scopes',()=>{
 assert.notEqual(student.id,staff.id);
 assert.equal(student.id,'/student/');
 assert.equal(staff.id,'/staff/');
 assert.equal(student.scope,'/student/');
 assert.equal(staff.scope,'/staff/');
 assert.match(student.start_url,/^\/student\/\?portal=1/);
 assert.match(staff.start_url,/^\/staff\/\?portal=1/);
 assert.match(html,/student\.webmanifest|app \+ '\.webmanifest'/);
 assert.match(launcher,/href="\/student\/"/);
 assert.doesNotMatch(launcher,/href="\/staff\/"/);
 for(const m of [student,staff]){
  assert.equal(m.display,'standalone');
  assert.ok(m.icons.some((icon:any)=>icon.sizes==='192x192'&&icon.type==='image/png'));
  assert.ok(m.icons.some((icon:any)=>icon.sizes==='512x512'&&icon.type==='image/png'));
 }
 assert.match(read('../../package.json'),/generate-pwa-icons\.mjs/);
});
test('WEB-11 installed applications keep credentials and role checks mandatory',()=>{
 assert.match(app,/appKind==='student'\?role==='student'/);
 assert.match(app,/role!=='student'&&role!=='alumni'/);
 assert.match(app,/canUseInstalledApp\(session\.user\.role\)/);
 assert.match(app,/canUseInstalledApp\(user\.role\)/);
 assert.match(app,/canUseInstalledApp\(currentUser\.role\)/);
 assert.match(entry,/isStudent\?currentUser\.role==='student'/);
 assert.match(entry,/Secure sign in/);
 assert.match(entry,/This account is not authorized/);
 assert.match(read('../../server/identity.ts'),/actor\.role/);
});
test('WEB-11 service worker never caches ERP, student records or authenticated pages',()=>{
 assert.match(worker,/OFFLINE_URL='\/offline\.html'/);
 assert.match(worker,/req\.mode!=='navigate'/);
 assert.match(worker,/url\.pathname\.startsWith\('\/api\/'\)/);
 assert.match(worker,/Network-only navigation/);
 assert.doesNotMatch(worker,/cache\.put\(/);
 assert.match(worker,/fetch\(req\)\.catch/);
});
test('WEB-11 staff access is not advertised through public campus tour or navbar',()=>{
 assert.doesNotMatch(tour,/Campus Facilities — Staff Sign In|onRequestFacilitiesLogin/);
 assert.doesNotMatch(launcher,/href="\/staff\/"/);
});
