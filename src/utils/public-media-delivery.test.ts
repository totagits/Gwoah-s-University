import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

const requiredAssets=[
  {file:'assets/aistudio/image_bfcc4a11.png',kind:'png',minBytes:1000},
  {file:'assets/aistudio/image_20261105_121706_f720baa0.mp4',kind:'mp4',minBytes:20000},
  {file:'assets/aistudio/image_20261105_102657_b174d32f.mp4',kind:'mp4',minBytes:20000},
] as const;

const isMedia=(file:string,kind:'png'|'mp4')=>{
  const fd=fs.openSync(file,'r');
  try{
    const header=Buffer.alloc(12);
    const count=fs.readSync(fd,header,0,12,0);
    if(count<12)return false;
    if(kind==='png')return header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    return header.toString('ascii',4,8)==='ftyp';
  }finally{fs.closeSync(fd);}
};

test('WEB-01: HIAU header seal and two homepage videos contain real media bytes',()=>{
  for(const asset of requiredAssets){
    const file=path.join(process.cwd(),'public',asset.file);
    assert.ok(fs.existsSync(file),`Missing public asset: ${asset.file}`);
    assert.ok(fs.statSync(file).size>asset.minBytes,
      `Asset looks empty or like an LFS pointer: ${asset.file}`);
    assert.ok(isMedia(file,asset.kind),`Invalid media signature: ${asset.file}`);
  }
});

test('WEB-01: production build includes the original HIAU media assets',()=>{
  if(!fs.existsSync(path.join(process.cwd(),'dist','index.html')))return;
  for(const asset of requiredAssets){
    const file=path.join(process.cwd(),'dist',asset.file);
    assert.ok(fs.existsSync(file),`Built application omitted ${asset.file}`);
    assert.ok(fs.statSync(file).size>asset.minBytes,`Truncated built asset: ${asset.file}`);
    assert.ok(isMedia(file,asset.kind),`Corrupted built asset: ${asset.file}`);
  }
});

test('WEB-01: video route uses public bundled assets with protected published overrides',()=>{
  const server=fs.readFileSync(new URL('../../server/publicWebsiteMedia.ts',import.meta.url),'utf8');
  assert.match(server,/slot:'hero-campus'.*image_20261105_121706_f720baa0\.mp4/);
  assert.match(server,/slot:'hero-classroom'.*image_20261105_102657_b174d32f\.mp4/);
  assert.match(server,/sendMedia\(req,res,mediaPath\(directory,published\),true\)/);
  assert.match(server,/sendMedia\(req,res,file,true\)/);
  assert.doesNotMatch(server,/res\.redirect\(302,item\.defaultSrc\)/);
  assert.ok(server.includes("app.get('/api/public/media-status'"));
  assert.ok(server.includes("app.get('/assets/aistudio/image_bfcc4a11.png'"));
  const identity=fs.readFileSync(new URL('../../server/identity.ts',import.meta.url),'utf8');
  assert.ok(identity.includes("endpoint === '/api/public/media-status'"));
});
