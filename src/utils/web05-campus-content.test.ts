import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p:string)=>readFileSync(new URL(p,import.meta.url),'utf8');
const server=read('../../server/campusContent.ts');
const consoleCode=read('../components/portal/CampusContentConsole.tsx');
const publicPage=read('../components/public/PublicCampusContent.tsx');
const navbar=read('../components/public/PublicNavbar.tsx');
const app=read('../App.tsx');

test('WEB-05 campus public endpoints expose approved items only',()=>{
 assert.match(server,/status==='published'&&x\.verified/);
 assert.match(server,/entry\.status!=='published'\|\|!entry\.verified/);
 assert.match(server,/actorOf\(res\)\?\.role==='super_admin'/);
 assert.match(server,/CAMPUS_CONTENT_PUBLISH/);
 assert.match(server,/CAMPUS_CONTENT_UNPUBLISH/);
 assert.match(server,/CAMPUS_CONTENT_DELETE/);
 assert.match(server,/CAMPUS_PHOTO_REPLACE/);
 assert.match(server,/DELETE_CAMPUS_CONTENT/);
});
test('WEB-05 console can create edit publish unpublish delete and replace photos',()=>{
 for(const term of ['Save draft','Publish','Unpublish','Delete','Upload / replace official photograph','Open Website Video Library'])
  assert.ok(consoleCode.includes(term),term);
 assert.match(consoleCode,/verified:e\.target\.checked/);
 assert.match(consoleCode,/currentUser\.role!=='super_admin'/);
});
test('WEB-05 public campus placeholders do not claim unverified photos or videos',()=>{
 assert.match(publicPage,/HIAU content placeholder/);
 assert.match(publicPage,/items\.filter\(x=>x\.category===group\.id\)/);
 assert.match(publicPage,/\/api\/public\/campus-content/);
});
test('WEB-05 Campus Tour remains primary and About links target distinct campus sections',()=>{
 assert.match(navbar,/label: 'Campus Overview'.*campus-campus/);
 assert.match(navbar,/label: 'Facilities & Infrastructure'.*campus-facilities/);
 assert.match(navbar,/label: 'Campus Life & Community'.*campus-community/);
 assert.doesNotMatch(navbar,/label: 'Campus Tour', action: \(\) => onNavigateSection\('tour'\)/);
 assert.match(app,/<PublicCampusContent \/>/);
 assert.match(app,/<CampusContentConsole /);
});
