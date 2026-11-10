import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { BLEST_COLLEGES, degreeSlug, resolvePublicDegree } from '../components/public/PublicColleges';
import explainers from '../../scripts/hiau-degree-video-content.json';

// Structural tests only: real page media playback and institutional approval
// are separately verified during staging browser acceptance.
test('all nineteen degree routes are unique, reversible and cataloged', () => {
  assert.equal(BLEST_COLLEGES.length, 5, 'Five colleges expected in public catalog');
  const routes = new Set<string>();
  const degrees = BLEST_COLLEGES.flatMap(college =>
    college.programs.map(program => ({college,program})));
  assert.equal(degrees.length, 19, 'Academic directory count has changed; review public copy');
  for (const {college,program} of degrees) {
    assert.ok(program.name.trim() && program.degreeType.trim() && program.duration.trim() && program.focus.trim(),
      'Incomplete program description: ' + program.name);
    const route = college.id + '--' + degreeSlug(program.name);
    assert.ok(!routes.has(route), 'Duplicate degree deep-link: ' + route);
    routes.add(route);
    assert.equal(resolvePublicDegree(route)?.program.name, program.name);
    assert.equal(resolvePublicDegree(route)?.college.id, college.id);
  }
  assert.equal(resolvePublicDegree('not-a-real-degree'), null);
});

test('narrated educational content aligns with public degree directory', () => {
  const keys = new Set(BLEST_COLLEGES.flatMap(college =>
    college.programs.map(program => college.id + ':' + program.name)));
  const recorded = new Set<string>();
  for (const explainer of explainers.degrees) {
    const key = explainer.college + ':' + explainer.name;
    assert.ok(keys.has(key), 'Narration references unknown degree: '+ key);
    assert.ok(!recorded.has(key), 'Duplicate narration metadata: ' + key);
    recorded.add(key);
    assert.ok(explainer.learn.trim() && explainer.today.trim() && explainer.careers.trim(),
      'Incomplete explainer for ' + key);
  }
  for (const key of keys) assert.ok(recorded.has(key), 'Missing public explainer: ' + key);
});

test('university-supplied introductory degree clips are present and nonempty', () => {
  const paths = [
    'image_20261108_223153.mp4',
    'image_20261108_232357_1.mp4',
    'image_20261108_233524.mp4',
    'image_20261109_002629_2.mp4',
  ];
  for (const filename of paths) {
    const video = path.join(process.cwd(), 'public', 'assets', 'degree-clips', filename);
    assert.ok(existsSync(video), 'University-supplied degree MP4 absent: ' + filename);
    assert.ok(statSync(video).size > 1024, 'University-supplied degree MP4 empty: ' + filename);
  }
});
