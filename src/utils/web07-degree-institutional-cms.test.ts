import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(s:string)=>readFileSync(new URL(s,import.meta.url),'utf8');
const backend=read('../../server/websiteCms.ts');
const detail=read('../components/public/PublicDegreeDetail.tsx');
const about=read('../components/public/PublicAbout.tsx');
const consoleCode=read('../components/portal/WebsiteCmsConsole.tsx');
const catalog=JSON.parse(read('../../scripts/hiau-degree-video-content.json'));

test('WEB-07: all 19 degree pages have validated overview, relevance and career slots',()=>{
 assert.equal(catalog.degrees.length,19);
 assert.match(backend,/degreeExplainers\.degrees\.map/);
 assert.match(backend,/degreeFields=\['overview','relevance','careers'\]/);
 assert.match(backend,/degreeContentSlots=degreeRoutes\.flatMap/);
 for(const field of ['overview','relevance','careers'])
   assert.match(detail,new RegExp('degree\.\\$\\{route\\}\.'+field));
 assert.match(backend,/Another published item already controls this page field/);
});
test('WEB-07: HIAU institution identity is CMS-managed without unverified blank page',()=>{
 for(const slot of ['vision','mission','motto','institutional-history']){
   assert.match(backend,new RegExp("'"+slot+"'"));
   assert.match(about,new RegExp('slot="'+slot+'" fallback='));
   assert.match(consoleCode,new RegExp("id:'"+slot+"'"));
 }
 assert.match(about,/section="about"/);
 assert.match(detail,/fallback=/);
});
test('WEB-07: CMS offers 19-degree publication fields while curriculum and route source remain stable',()=>{
 assert.match(consoleCode,/degreeExplainers\.degrees\.flatMap/);
 assert.match(consoleCode,/degree\.name\+' — '\+label/);
 assert.match(detail,/resolvePublicDegree\(route\)/);
 assert.match(detail,/\/api\/public\/degree-curriculum/);
 assert.match(detail,/<PublicDegreeVideo/);
});
