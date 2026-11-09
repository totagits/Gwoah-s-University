/**
 * HIAU College of Science, Technology, and Allied Health:
 * evidence-only reference candidates from user-provided 26-page PDF.
 * These are NOT official program codes and NOT approved admissions curricula.
 * Prefix REF explicitly prevents mistaking provisional IDs for university codes.
 * Every candidate carries a mandatory review hold; no automatic publishing.
 */
export type ReferenceCourse = {
  code: string; title: string; credits: number; year: number; semester: number;
  category: 'general'|'college'|'major'|'minor'|'elective'; page: string;
};
export type ReferenceProgram = {
  code:string; name:string;credential:string;page:string;
  general:number;college:number;major:number;minor:number;elective:number;
  total:number;notes:string;courses:ReferenceCourse[];
};
const base='SOURCE_REVIEW_REQUIRED: Provisional source-based entry only. Program code REF-* is NOT an official HIAU program code. Registrar must resolve credit and course-code conflicts; verify accreditation, offerings and official catalog before requesting approval.';
const prefix='College of Science, Technology, and Allied Health';
export const COLLEGE_SCIENCE_SOURCE_TITLE='College of Science.pdf';
export const COLLEGE_SCIENCE_COLLEGE=prefix;
export const COLLEGE_SCIENCE_REFERENCES:readonly ReferenceProgram[]=[
  {
    code:'REF-HIAU-BS-IT',name:'Bachelor of Science in Information Technology',
    credential:'Bachelor of Science',page:'1, 3, 5–7',
    general:44,college:26,major:39,minor:12,elective:12,total:133,
    notes:base+' Page 1 totals 133; page 3 states 129 and page 5 gives 131. Page 3 says ITCB 404 is Information Assurance and Security while Science and Technology identifies ITCB 404 as an internship. The course sample below is incomplete; do not approve.',
    courses:[
      {code:'ENGL 101',title:'Essentials of Grammar I',credits:3,year:1,semester:1,category:'general',page:'6'},
      {code:'ENGL 102',title:'Essentials of Grammar II',credits:3,year:1,semester:2,category:'general',page:'6'},
      {code:'ITCB 201',title:'IT Fundamentals',credits:3,year:2,semester:1,category:'college',page:'6'},
      {code:'ITCB 202',title:'Computer Programming',credits:3,year:2,semester:2,category:'college',page:'6'},
      {code:'ITCB 203',title:'Human Computer Interaction',credits:3,year:2,semester:1,category:'college',page:'6'},
      {code:'ITCB 204',title:'Web Systems and Technologies',credits:3,year:2,semester:2,category:'major',page:'6'},
      {code:'ITCB 401',title:'Networking',credits:3,year:4,semester:1,category:'major',page:'7'},
      {code:'ITCB 402',title:'System Administration and Maintenance',credits:3,year:4,semester:2,category:'major',page:'7'},
      {code:'ITCB 405',title:'IT Capstone',credits:3,year:4,semester:1,category:'major',page:'7'},
      {code:'ITCB 406',title:'Information Technology Internship',credits:3,year:4,semester:2,category:'major',page:'7'},
    ],
  },
  {
    code:'REF-HIAU-BS-ENVS',name:'Bachelor of Science in Environmental Science',
    credential:'Bachelor of Science',page:'1, 4–5, 8',
    general:44,college:26,major:44,minor:12,elective:12,total:138,
    notes:base+' Page 1 totals 138 versus detailed degree plan 135 on page 8. Some environmental and general-science codes vary between the overview, Table 3C, and year sequence. Course sample incomplete.',
    courses:[
      {code:'ENVR 201',title:'Environmental Science I Lecture',credits:3,year:2,semester:1,category:'major',page:'8'},
      {code:'ENVR 201L',title:'Environmental Science I Lab',credits:1,year:2,semester:1,category:'major',page:'8'},
      {code:'ENVR 202',title:'Environmental Science II Lecture',credits:3,year:2,semester:2,category:'major',page:'8'},
      {code:'ENVR 203',title:'Global Development and Sustainability I',credits:3,year:2,semester:1,category:'major',page:'8'},
      {code:'ENVR 204',title:'Global Development and Sustainability II',credits:3,year:2,semester:2,category:'major',page:'8'},
      {code:'ENVR 407',title:'Environmental Research',credits:3,year:4,semester:1,category:'major',page:'8'},
      {code:'ENVR 408',title:'Environmental Senior Research Paper',credits:3,year:4,semester:2,category:'major',page:'8'},
    ],
  },
  {
    code:'REF-HIAU-BS-SCT',name:'Bachelor of Science in Science and Technology',
    credential:'Bachelor of Science',page:'1, 3, 5–6',
    general:44,college:26,major:43,minor:12,elective:12,total:137,
    notes:base+' Page 1 totals 137, Table 3A on page 3 states 133, and detailed schedule on page 5 states 129. Course sample incomplete.',
    courses:[
      {code:'ENGL 101',title:'Essentials of Grammar I',credits:3,year:1,semester:1,category:'general',page:'5'},
      {code:'ENGL 102',title:'Essentials of Grammar II',credits:3,year:1,semester:2,category:'general',page:'5'},
      {code:'ITCB 201',title:'IT Fundamentals',credits:3,year:2,semester:1,category:'college',page:'5'},
      {code:'ITCB 202',title:'Computer Programming',credits:3,year:2,semester:2,category:'college',page:'5'},
      {code:'MATH 402',title:'Introduction to Biostatistics',credits:3,year:4,semester:2,category:'major',page:'6'},
      {code:'ENVR 407',title:'Environmental Research',credits:3,year:4,semester:1,category:'major',page:'6'},
    ],
  },
  {
    code:'REF-HIAU-BS-CIV',name:'Bachelor of Science in Civil Engineering',
    credential:'Bachelor of Science',page:'9–13',
    general:44,college:36,major:90,minor:0,elective:9,total:179,
    notes:base+' HIAU stakeholder confirmed on 2026-11-08 that Civil Engineering requires 179 total credits. Category breakdown 44 general + 36 college + 90 major + 9 electives = 179. The original PDF states 177 on page 9 and has a 90/91 content-hour discrepancy on page 10; retain both discrepancies for the Registrar audit. The 179-credit decision is recorded, but full curriculum sequence and degree availability are not yet verified.',
    courses:[
      {code:'HCEN 101',title:'Engineering Orientation',credits:3,year:1,semester:1,category:'college',page:'12'},
      {code:'HCEN 102',title:'Foundations of Engineering',credits:3,year:1,semester:2,category:'college',page:'12'},
      {code:'HCEN 205',title:'Mechanics (Statics) I',credits:3,year:2,semester:1,category:'major',page:'12'},
      {code:'HCEN 206',title:'Mechanics (Dynamics) II',credits:3,year:2,semester:2,category:'major',page:'12'},
    ],
  },
  {
    code:'REF-HIAU-BS-ELEC',name:'Bachelor of Science in Electrical Engineering',
    credential:'Bachelor of Science',page:'14–17',
    general:44,college:36,major:93,minor:0,elective:9,total:182,
    notes:base+' Source pages 14–17 report 182 hours and a 44/36/93/9 split. Course list incomplete; electrical-course codes conflict within source (e.g., HEEN 301 used for two subjects). Program availability unverified.',
    courses:[
      {code:'HEEN 101',title:'MATLAB Programming',credits:3,year:1,semester:1,category:'major',page:'16'},
      {code:'HEEN 201',title:'Circuit I & Lab.',credits:4,year:2,semester:1,category:'major',page:'16'},
      {code:'HEEN 202',title:'Circuit II & Lab.',credits:4,year:2,semester:2,category:'major',page:'16'},
    ],
  },
  {
    code:'REF-HIAU-BS-NURS',name:'Bachelor of Science in Nursing',
    credential:'Bachelor of Science',page:'1, 17–20',
    general:44,college:26,major:54,minor:0,elective:12,total:136,
    notes:base+' Listed as a later intended offering on page 2. Independent confirmation of authorization and actual availability required. Course sample incomplete.',
    courses:[
      {code:'NURS 201',title:'Called to Care',credits:1,year:2,semester:1,category:'college',page:'18'},
      {code:'NURS 203',title:'Principle of Psychology',credits:2,year:2,semester:1,category:'college',page:'18'},
      {code:'NURS 208',title:'Nutrition',credits:2,year:2,semester:1,category:'major',page:'18'},
    ],
  },
  {
    code:'REF-HIAU-BS-LABS',name:'Bachelor of Science in Laboratory Science',
    credential:'Bachelor of Science',page:'1, 20–23',
    general:44,college:26,major:54,minor:0,elective:12,total:136,
    notes:base+' Source also uses Medical Laboratory Services terminology on page 22; exact degree title must be verified. Listed as later intended offering. Sample incomplete.',
    courses:[
      {code:'LABS 201',title:'Principles of Chemistry I',credits:3,year:2,semester:1,category:'college',page:'22–23'},
      {code:'LABS 202',title:'Principles of Chemistry II',credits:3,year:2,semester:2,category:'college',page:'22–23'},
      {code:'LABS 201L',title:'Principles of Chemistry I Lab',credits:1,year:2,semester:1,category:'college',page:'22–23'},
    ],
  },
  {
    code:'REF-HIAU-BS-HADM',name:'Bachelor of Science in Health Administration',
    credential:'Bachelor of Science',page:'1, 24–26',
    general:44,college:26,major:54,minor:0,elective:12,total:136,
    notes:base+' Source page 24 contains conflicting Bachelor of Science and Bachelor of Arts wording. Later intended offering. Course sample incomplete.',
    courses:[
      {code:'HLAD 301',title:'Aging: Implications for Health Professionals',credits:3,year:3,semester:1,category:'major',page:'25'},
      {code:'HILAD 302',title:'Healthcare System and Professional Practice',credits:3,year:3,semester:2,category:'major',page:'25'},
    ],
  },
];
