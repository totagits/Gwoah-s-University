import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public admissions client submits every required intake field', () => {
  const source = readFileSync(
    new URL('../components/public/PublicAdmissions.tsx', import.meta.url), 'utf8');
  const block = source.match(/const payload = \{([\s\S]*?)\n      \};/);
  assert.ok(block, 'public admissions submission payload must exist');
  for (const name of [
    'applicantName','email','phone','programDesired','faculty','county',
    'wassceIndex','applyingForScholarship','wassceCoreSubjects',
  ]) {
    assert.match(block[1], new RegExp('\\b' + name + '\\b'),
      'Missing required application payload field: ' + name);
  }
  assert.match(source, /setSubmissionSuccess\(res\.application\.applicationNumber\)/,
    'Only a confirmed server receipt can be displayed as submitted');
  assert.match(source, /if \(res\.success\)/);
  for (const subject of ['Mathematics', 'English Language', 'Core Elective']) {
    assert.ok(block[1].includes(subject), 'Missing exam subject ' + subject);
  }
});
