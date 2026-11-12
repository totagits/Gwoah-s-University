import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Operations} from './operations';
import {getPublicVideoAvailability} from './publicWebsiteMedia';

test('WEB-GATE: media resolver distinguishes absent fallback, approved CMS MP4 and unknown slot',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-video-status-'));
 const store=new Operations(dir);
 try{
  // A brand-new CMS slot has NO bundled fallback regardless of which video
  // files the production build copied into dist/.
  const missing='hero-extra-'+randomUUID();
  store.run('INSERT INTO settings(key,value) VALUES(?,?)','public-media:hero-extras',
    JSON.stringify([{slot:missing,label:'Test empty video slot',defaultSrc:'',order:0}]));
  assert.deepEqual(getPublicVideoAvailability(store,dir,missing),
    {available:false,source:'missing',file:null});
  assert.equal(getPublicVideoAvailability(store,dir,'not-a-program').source,'unknown');
  const filename=randomUUID()+'.mp4';
  fs.mkdirSync(path.join(dir,'public-media'),{recursive:true});
  fs.writeFileSync(path.join(dir,'public-media',filename),Buffer.from('0000ftypmp42'));
  store.run('INSERT INTO settings(key,value) VALUES(?,?)','public-media:'+missing,
    JSON.stringify({published:filename,version:1}));
  const published=getPublicVideoAvailability(store,dir,missing);
  assert.equal(published.available,true);
  assert.equal(published.source,'published');
  assert.ok(published.file&&fs.existsSync(published.file));
  fs.writeFileSync(path.join(dir,'public-media',filename),Buffer.from('not-an-mp4-file'));
  const corrupted=getPublicVideoAvailability(store,dir,missing);
  assert.equal(corrupted.available,false,'Corrupted media must never be treated as playable');
  assert.equal(corrupted.source,'invalid');
  fs.writeFileSync(path.join(dir,'public-media',filename),Buffer.from('0000ftypmp42'));
  assert.equal(getPublicVideoAvailability(store,dir,missing).available,true);
  fs.unlinkSync(path.join(dir,'public-media',filename));
  assert.equal(getPublicVideoAvailability(store,dir,missing).available,false,
    'Stale database publication must not be counted as playable video');
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
