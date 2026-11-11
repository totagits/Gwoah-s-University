import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const backend=read('../../server/websiteCms.ts');
const consoleCode=read('../components/portal/WebsiteCmsConsole.tsx');
const inline=read('../components/public/ManagedText.tsx');
const general=read('../components/public/PublicCmsSection.tsx');
test('WEB-07 allows only predefined public field placements and prevents duplicate published slot control',()=>{
 assert.match(backend,/export const managedSlots=/);
 assert.match(backend,/managedSlots as Record/);
 assert.match(backend,/Another published item already controls this page field/);
 assert.match(backend,/other\.published\?\.slot===item\.draft\?\.slot/);
});
test('WEB-07 managed text keeps original copy as fallback',()=>{
 assert.match(inline,/item\?\.body\|\|fallback/);
 assert.match(inline,/fetch\('\/api\/public\/site-content'/);
 assert.match(general,/!item\.slot/);
});
test('WEB-07 page copy field selection is editable without source changes',()=>{
 assert.match(consoleCode,/Placement on existing page/);
 assert.match(consoleCode,/Homepage hero heading/);
 assert.match(consoleCode,/Academics introduction/);
 assert.match(consoleCode,/Admissions page heading/);
 for(const [file,section] of [
  ['PublicHero.tsx','home'],['PublicAbout.tsx','about'],
  ['PublicColleges.tsx','academics'],['PublicAdmissions.tsx','admissions']
 ]){
  const source=read('../components/public/'+file);
  assert.match(source,new RegExp('ManagedText section="'+section+'"'));
 }
});
