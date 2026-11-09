/**
 * Pre-approval quality gate for manually entered College of Science curriculum data.
 * Reports actual entered records only. No source-PDF totals are inferred or silently adjusted.
 */
export type CurriculumProgram = {
  code:string;name:string;required_half:number;general_half:number;college_half:number;
  major_half:number;minor_half:number;elective_half:number;notes:string;
};
export type CurriculumCourse = {
  code:string;title:string;category:string;credits_half:number;year:number;
  semester:number;prerequisite_codes:string;source_page:string;
};
export type CurriculumFinding = {
  severity:'error'|'warning';
  code:string;
  detail:string;
};
const categories=['general','college','major','minor','elective'] as const;
const creditKeys={general:'general_half',college:'college_half',major:'major_half',minor:'minor_half',elective:'elective_half'} as const;
const label=(name:string)=>name.charAt(0).toUpperCase()+name.slice(1);
const norm=(s:string)=>s.trim().toUpperCase().replace(/\s+/g,' ');
const splitPrerequisites=(s:string)=>s.split(/[,;\n]+/g).map(norm).filter(Boolean);

/** Returns deterministic, actionable validation evidence; never mutates data. */
export function validateCurriculum(program:CurriculumProgram,courses:CurriculumCourse[]) {
  const findings:CurriculumFinding[]=[];
  const error=(code:string,detail:string)=>findings.push({severity:'error',code,detail});
  const warning=(code:string,detail:string)=>findings.push({severity:'warning',code,detail});
  if(!courses.length)error('NO_COURSES','Enter the complete year-by-year course sequence.');
  if(program.code.startsWith('REF-'))
    error('UNVERIFIED_PROGRAM_CODE','Replace the provisional REF- program code with the official university code.');
  if(program.notes.includes('SOURCE_REVIEW_REQUIRED'))
    error('UNRESOLVED_SOURCE','Resolve the source-PDF discrepancies and update the review notes before approval.');
  const parts=categories.reduce((sum,category)=>sum+Number(program[creditKeys[category]]||0),0);
  if(parts!==program.required_half)
    error('PROGRAM_TOTAL_MISMATCH',`Category requirements add to ${parts/2} credits; stated total is ${program.required_half/2}.`);
  const totals:Record<string,{required:number;listed:number}>={};
  for(const cat of categories){
    const listed=courses.filter(c=>c.category===cat).reduce((sum,c)=>sum+c.credits_half,0);
    const required=program[creditKeys[cat]];
    totals[cat]={required:required/2,listed:listed/2};
    if(cat==='minor'||cat==='elective'){
      if(required>0 && listed===0)error('MISSING_'+cat.toUpperCase()+'_OPTIONS',
        `Enter verified ${cat} course options for the ${required/2}-credit requirement.`);
      else if(required>0 && listed<required)warning('INSUFFICIENT_'+cat.toUpperCase()+'_OPTIONS',
        `Only ${listed/2} credits of ${cat} options are entered for a ${required/2}-credit requirement.`);
    }else if(listed!==required){
      error('CREDIT_MISMATCH_'+cat.toUpperCase(),
        `${label(cat)} courses total ${listed/2} credits; required ${required/2}. Enter or correct the missing course entries.`);
    }
  }
  const byCode=new Map<string,CurriculumCourse[]>();
  for(const course of courses){
    const code=norm(course.code);
    byCode.set(code,[...(byCode.get(code)||[]),course]);
    if(!course.title.trim())error('MISSING_COURSE_TITLE',`Course ${code} has no official title.`);
    if(!Number.isInteger(course.credits_half)||course.credits_half<=0)
      error('INVALID_COURSE_CREDITS',`Course ${code} has invalid credits.`);
    if(!course.source_page.trim())warning('MISSING_SOURCE_PAGE',`Course ${code} has no documentary page citation.`);
  }
  for(const [code,entries] of byCode){
    if(entries.length>1)error('DUPLICATE_COURSE_CODE',
      `Course code ${code} is repeated in this program. Review aliases, cross-listings, and semesters.`);
  }
  // Each prerequisite must match another unique course in the same planned
  // curriculum and be scheduled in an earlier term. External requirements
  // need an explicit verified course entry or separate policy model.
  const edges=new Map<string,string[]>();
  for(const course of courses){
    const code=norm(course.code);
    const prereqs=splitPrerequisites(course.prerequisite_codes||'');
    edges.set(code,prereqs);
    for(const prerequisite of prereqs){
      if(prerequisite===code){
        error('SELF_PREREQUISITE',`Course ${code} cannot require itself.`);
        continue;
      }
      const matches=byCode.get(prerequisite)||[];
      if(matches.length===0){
        error('UNKNOWN_PREREQUISITE',`Course ${code} requires ${prerequisite}, which is not in the program's verified course list.`);
      }else if(matches.length>1){
        error('AMBIGUOUS_PREREQUISITE',`Course ${code} refers to duplicate prerequisite code ${prerequisite}.`);
      }else{
        const earlier=matches[0].year*4+matches[0].semester;
        const current=course.year*4+course.semester;
        if(earlier>=current){
          error('PREREQUISITE_ORDER',`Course ${code} is scheduled before or alongside its prerequisite ${prerequisite}.`);
        }
      }
    }
  }
  const visited=new Set<string>(),active=new Set<string>(),cycles=new Set<string>();
  const visit=(course:string)=>{
    if(active.has(course)){cycles.add(course);return;}
    if(visited.has(course))return;
    active.add(course);
    for(const dep of edges.get(course)||[])if(edges.has(dep))visit(dep);
    active.delete(course);visited.add(course);
  };
  for(const code of edges.keys())visit(code);
  if(cycles.size)error('PREREQUISITE_CYCLE',
    `Prerequisite dependency loop detected involving: ${[...cycles].join(', ')}.`);
  return {ready:!findings.some(f=>f.severity==='error'),courseCount:courses.length,
    totals,findings,errorCount:findings.filter(f=>f.severity==='error').length,
    warningCount:findings.filter(f=>f.severity==='warning').length};
}
