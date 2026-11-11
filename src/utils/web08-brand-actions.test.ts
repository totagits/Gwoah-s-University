import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
test('WEB-08 branded primary actions retain white text in accessibility theme',()=>{
 const css=read('../index.css');
 assert.match(css,/\[data-theme="light"\] button\.hiau-brand-action/);
 assert.match(css,/color: #ffffff !important/);
 for(const component of ['PortalLoginModal','WebsiteCmsConsole','WebsiteNewsEventsConsole','CampusContentConsole']){
  const source=read('../components/portal/'+component+'.tsx');
  assert.match(source,/hiau-brand-action/);
 }
});
test('WEB-08 permanent deletion is distinguishable from unpublishing',()=>{
 const source=read('../components/portal/WebsiteNewsEventsConsole.tsx');
 assert.match(source,/To remove it from the public site but keep it as a draft, choose Unpublish instead/);
});
