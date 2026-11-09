import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCurriculum,type CurriculumCourse,type CurriculumProgram} from './curriculumValidation';

const program:CurriculumProgram={
  code:'BS-TEST',name:'Bachelor of Science in Verified Coursework',
  required_half:18,general_half:6,college_half:6,major_half:6,minor_half:0,elective_half:0,
  notes:'Approved academic source verified by department.',
};
const rows:CurriculumCourse[]=[
  {code:'ENGL 101',title:'English I',category:'general',credits_half:6,year:1,semester:1,prerequisite_codes:'',source_page:'2'},
  {code:'ITCB 201',title:'Computing Fundamentals',category:'college',credits_half:6,year:1,semester:2,prerequisite_codes:'ENGL 101',source_page:'3'},
  {code:'ITCB 301',title:'Advanced Computing',category:'major',credits_half:6,year:2,semester:1,prerequisite_codes:'ITCB 201',source_page:'4'},
];
test('curriculum readiness passes a complete, ordered and sourced sequence',()=>{
  const r=validateCurriculum(program,rows);
  assert.equal(r.ready,true);
  assert.equal(r.errorCount,0);
  assert.equal(r.warningCount,0);
  assert.equal(r.courseCount,3);
});
test('missing courses, provisional PDF records and credit discrepancies remain blocked',()=>{
  const draft:CurriculumProgram={...program,code:'REF-BS-TEST',notes:'SOURCE_REVIEW_REQUIRED',required_half:20};
  const result=validateCurriculum(draft,rows.slice(0,1));
  assert.equal(result.ready,false);
  assert.ok(result.findings.some(x=>x.code==='UNVERIFIED_PROGRAM_CODE'));
  assert.ok(result.findings.some(x=>x.code==='UNRESOLVED_SOURCE'));
  assert.ok(result.findings.some(x=>x.code==='PROGRAM_TOTAL_MISMATCH'));
  assert.ok(result.findings.some(x=>x.code==='CREDIT_MISMATCH_MAJOR'));
});
test('duplicate codes across semesters, unknown prerequisites and ordering errors are reported',()=>{
  const invalid:CurriculumCourse[]=[
    ...rows,
    {...rows[0],year:2,semester:2},
    {...rows[1],prerequisite_codes:'ITCB 301, MATH 999',source_page:''},
  ];
  const result=validateCurriculum(program,invalid);
  assert.equal(result.ready,false);
  for(const code of ['DUPLICATE_COURSE_CODE','PREREQUISITE_ORDER','UNKNOWN_PREREQUISITE','MISSING_SOURCE_PAGE'])
    assert.ok(result.findings.some(x=>x.code===code),code);
});
test('circular dependencies are rejected even if other scheduling problems exist',()=>{
  const cyclic:CurriculumCourse[]=rows.map(row=>({...row}));
  cyclic[0].prerequisite_codes='ITCB 301';
  cyclic[2].prerequisite_codes='ENGL 101';
  const result=validateCurriculum(program,cyclic);
  assert.equal(result.ready,false);
  assert.ok(result.findings.some(x=>x.code==='PREREQUISITE_CYCLE'));
});
