import fs from 'node:fs';
import path from 'node:path';

// Read only top-level MP4 atom headers. No user media is uploaded or changed.
const names=[
  'image_20261105_121706_f720baa0.mp4',
  'image_20261105_102657_b174d32f.mp4',
];
let errors=0;
for(const [i,name] of names.entries()){
  const file=path.join(process.cwd(),'public','assets','aistudio',name);
  if(!fs.existsSync(file)){console.warn('[hero-video]',i+1,'bundled file missing',file);errors++;continue;}
  const fd=fs.openSync(file,'r');
  try {
    const stat=fs.fstatSync(fd),atoms=[];
    let pos=0;
    while(pos+8<=stat.size&&atoms.length<1000){
      const h=Buffer.alloc(16);
      fs.readSync(fd,h,0,Math.min(16,stat.size-pos),pos);
      const type=h.toString('latin1',4,8);
      let size=h.readUInt32BE(0),hdr=8;
      if(size===1){size=Number(h.readBigUInt64BE(8));hdr=16;}
      else if(size===0)size=stat.size-pos;
      if(!Number.isSafeInteger(size)||size<hdr||pos+size>stat.size)break;
      atoms.push({type,offset:pos,size});
      pos+=size;
    }
    const moov=atoms.find(a=>a.type==='moov');
    const mdat=atoms.find(a=>a.type==='mdat');
    const faststart=Boolean(moov&&mdat&&moov.offset<mdat.offset);
    console.log('[hero-video]',JSON.stringify({slot:i===0?'hero-campus':'hero-classroom',bytes:stat.size,MiB:Math.round(stat.size/1048576*100)/100,faststart,moovOffset:moov?.offset??null,mdatOffset:mdat?.offset??null,atoms:atoms.slice(0,8).map(x=>x.type)}));
    if(!moov||!mdat||!faststart)console.warn('[hero-video] Startup optimization recommended: ffmpeg -i INPUT -c copy -movflags +faststart OUTPUT (inspect codecs separately).');
  }finally{fs.closeSync(fd);}
}
if(errors)console.warn('[hero-video] Some bundled files missing; deployment may use published replacements.');
