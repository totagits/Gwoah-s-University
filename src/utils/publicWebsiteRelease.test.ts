import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BLEST_COLLEGES,degreeSlug} from '../components/public/PublicColleges';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const read=(p:string)=>fs.readFileSync(path.join(root,p),'utf8');
test('public campus media and all nineteen degree explainers are packaged for deployment',()=>{
  const publicAssets=path.join(root,'public');
  for(const source of [
    '/assets/aistudio/image_20261105_121706_f720baa0.mp4',
    '/assets/aistudio/image_20261105_102657_b174d32f.mp4',
  ])assert.ok(fs.statSync(path.join(publicAssets,source.slice(1))).size>1000,source);
  const details=read('src/components/public/PublicDegreeDetail.tsx');
  const uploaded=[...details.matchAll(/src:'(\/assets\/degree-clips\/[^']+\.mp4)'/g)].map(x=>x[1]);
  for(const college of BLEST_COLLEGES)for(const degree of college.programs){
    const route=college.id+'--'+degreeSlug(degree.name);
    const filepath=path.join(publicAssets,'assets','degree-clips',route+'.mp4');
    assert.ok(fs.statSync(filepath).size>1000,'Missing degree explainer '+route);
  }
  for(const file of uploaded)assert.ok(fs.statSync(path.join(publicAssets,file.slice(1))).size>1000,'Missing uploaded clip '+file);
});
test('public website supplies all destination sections and protects private ERP route',()=>{
  const app=read('src/App.tsx');
  for(const section of ['hero','about','tour','colleges','admissions','calendar','dei']){
    const componentFiles=fs.readdirSync(path.join(root,'src','components','public'))
      .filter(file=>file.endsWith('.tsx'));
    assert.ok(componentFiles.some(file=>read('src/components/public/'+file).includes('id="'+section+'"'))||
      section==='hero'&&app.includes('<PublicHero'),'Missing public section '+section);
  }
  assert.ok(app.includes("viewMode === 'portal' && currentUser"),'ERP must not mount for anonymous visitor');
});
