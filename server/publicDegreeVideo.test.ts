import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

test('public degree video autoplays muted and offers narration with safe fallback',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const degree=fs.readFileSync(path.join(root,'src/components/public/PublicDegreeDetail.tsx'),'utf8');
  const player=fs.readFileSync(path.join(root,'src/components/public/PublicDegreeVideo.tsx'),'utf8');
  assert.match(degree,/<PublicDegreeVideo key=\{route\} route=\{route\} source=\{degreeVideoSource\}/);
  assert.match(player,/<video ref=\{videoRef\} key=\{route\} controls autoPlay muted playsInline/);
  assert.match(player,/<source src=\{source\} type="video\/mp4"\/>/);
  assert.match(player,/Turn on narration/);
  assert.match(player,/aria-pressed=\{soundOn\}/);
  assert.match(player,/video\.muted=false/);
  assert.match(player,/video\.muted=true/);
  assert.match(player,/onError=\{\(\)=>setMediaError\(true\)\}/);
  assert.match(player,/role="alert"/);
  assert.match(player,/Play video/);
});
