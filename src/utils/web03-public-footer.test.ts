import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const footer=source('../components/public/PublicFooter.tsx');
const targets=[
  {section:'colleges',file:'../components/public/PublicColleges.tsx'},
  {section:'admissions',file:'../components/public/PublicAdmissions.tsx'},
  {section:'tour',file:'../components/public/PublicVirtualTour.tsx'},
  {section:'dei',file:'../components/public/PublicDEI.tsx'},
  {section:'about',file:'../components/public/PublicAbout.tsx'},
];
test('WEB-03: footer navigation targets correspond to mounted public sections',()=>{
  for(const {section,file} of targets){
    assert.ok(footer.includes("target: '"+section+"'")||footer.includes("onNavigateSection('"+section+"')"));
    assert.ok(source(file).includes('id="'+section+'"'),'Missing destination for '+section);
  }
});
test('WEB-03: contact actions use valid phone/email link forms, not placeholder hrefs',()=>{
  const phones=[...footer.matchAll(/href: 'tel:([^']+)'/g)].map(m=>m[1]);
  assert.equal(phones.length,4);
  for(const number of phones)assert.match(number,/^\+[1-9]\d{7,14}$/);
  assert.match(footer,/href=\{`mailto:\$\{email\}`\}/);
  assert.doesNotMatch(footer,/href=["']#["']/);
});
test('WEB-03: broken seal remains legible, links have explicit keyboard focus',()=>{
  assert.match(footer,/onError=\{\(\) => setSealUnavailable\(true\)\}/);
  assert.match(footer,/aria-label="HIAU university identity"/);
  assert.ok((footer.match(/focus-visible:outline-2/g)||[]).length>=5);
  assert.match(footer,/md:grid-cols/);
  assert.match(footer,/xl:grid-cols/);
});
