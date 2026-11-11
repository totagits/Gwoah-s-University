import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('WEB-01: campus video shows an existing local still while initial frames load',()=>{
  const hero=fs.readFileSync(new URL('../components/public/PublicHero.tsx',import.meta.url),'utf8');
  const filename='image_29eb5504.png';
  const local=path.join(process.cwd(),'public','assets','aistudio',filename);
  assert.ok(fs.existsSync(local),'Campus fallback still must be an actual tracked asset');
  assert.ok(fs.statSync(local).size>1024,'Campus still must contain image data');
  assert.match(hero,/poster=\{currentVideo\.id === 'hero-campus'/);
  assert.match(hero,/\/assets\/aistudio\/image_29eb5504\.png/);
  assert.match(hero,/onError=\{\(\)=>setVideoError/);
  assert.match(hero,/onEnded=\{\(\)=>switchVideo\(activeVideoIndex\+1\)\}/);
  assert.match(hero,/aria-label=\{isActuallyPlaying \? 'Pause video' : 'Play video'\}/);
  assert.ok(!hero.includes('poster="/assets/aistudio/image_29eb5504.png"'),
    'Campus photo must not be falsely presented as a preview for every other video');
});
