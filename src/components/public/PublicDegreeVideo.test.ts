import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

test('public degree video is autoplaying muted inline with viewer controls, without changing hero',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
  const degree=fs.readFileSync(path.join(root,'src/components/public/PublicDegreeDetail.tsx'),'utf8');
  assert.match(degree,/<video key=\{route\} controls autoPlay muted preload="auto" playsInline/);
  assert.match(degree,/speaker control to hear the narration/);
  assert.match(degree,/<source src=\{degreeVideoSource\} type="video\/mp4"\/>/);
});
