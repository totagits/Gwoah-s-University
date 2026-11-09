import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {BLEST_COLLEGES,degreeSlug,resolvePublicDegree} from '../components/public/PublicColleges';

test('every public academic degree card has unique direct-link detail route',()=>{
  const routes=new Set<string>();
  const all=BLEST_COLLEGES.flatMap(college=>college.programs.map(program=>({
    college,program,route:college.id+'--'+degreeSlug(program.name),
  })));
  assert.equal(all.length,19);
  for(const {college,program,route} of all){
    assert.equal(routes.has(route),false,`Duplicate degree detail route: ${route}`);
    routes.add(route);
    assert.equal(resolvePublicDegree(route)?.program.name,program.name);
    assert.equal(resolvePublicDegree(route)?.college.id,college.id);
  }
  assert.equal(resolvePublicDegree('unknown--degree'),null);
});

test('all degree cards have their own original spoken explainer script',()=>{
  const scripts=JSON.parse(readFileSync('scripts/hiau-degree-video-content.json','utf8'));
  const keys=new Set<string>((scripts.degrees as {college:string;name:string}[])
    .map(item=>item.college+'--'+degreeSlug(item.name)));
  const routes=BLEST_COLLEGES.flatMap(college=>
    college.programs.map(program=>college.id+'--'+degreeSlug(program.name)));
  assert.equal(keys.size,19);
  for(const route of routes) assert.equal(keys.has(route),true,`Missing video narration for ${route}`);
});
