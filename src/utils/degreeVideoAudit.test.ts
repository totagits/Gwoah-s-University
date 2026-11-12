import test from 'node:test';
import assert from 'node:assert/strict';
import {createDegreeVideoAuditCsv} from './degreeVideoAudit';
import degreeExplainers from '../../scripts/hiau-degree-video-content.json';

test('WEB-GATE export creates exactly one row for each of 19 current degree programs',()=>{
 const slots=degreeExplainers.degrees.map((degree)=>{
  const slug=degree.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
   .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return {slot:degree.college+'--'+slug,label:degree.name,
   defaultSrc:'/assets/degree-clips/'+degree.college+'--'+slug+'.mp4',
   publicSrc:'/api/public/video/'+degree.college+'--'+slug,
   defaultAvailable:false,version:0};
 });
 assert.equal(slots.length,19);
 const csv=createDegreeVideoAuditCsv(slots);
 const lines=csv.replace(/^\uFEFF/,'').trimEnd().split('\r\n');
 assert.equal(lines.length,20,'1 header plus 19 academic degrees');
 assert.match(lines[0],/Official program information verified/);
 assert.match(csv,/Not tested/);
 assert.match(csv,/Not verified/);
 assert.doesNotMatch(csv,/Student Number|Tuition Balance/);
});
test('WEB-GATE export excludes home carousel and neutralizes CSV formula injections',()=>{
 const csv=createDegreeVideoAuditCsv([
  {slot:'hero-campus',label:'Campus',defaultSrc:'x',publicSrc:'x',version:0},
  {slot:'degree--test',label:'=HYPERLINK("evil")',defaultSrc:'x',publicSrc:'x',version:0}
 ]);
 assert.doesNotMatch(csv,/Campus/);
 assert.match(csv,/'=HYPERLINK/);
 assert.match(csv,/Not tested/);
});
