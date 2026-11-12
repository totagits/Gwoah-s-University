import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

// Build-stage copies only: original Git media remains untouched.
// Re-encode the two 2026 homepage clips into browser-compatible, fast-start,
// bitrate-limited video. Fail the deployment build rather than publish broken media.
const media=[
  ['image_20261105_121706_f720baa0.mp4','hero-campus-poster.jpg'],
  ['image_20261105_102657_b174d32f.mp4','hero-classroom-poster.jpg'],
];
const ffmpeg=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
if(ffmpeg.status!==0)throw new Error('ffmpeg unavailable in build stage; cannot optimize hero videos.');
for(const [name,posterName] of media){
  const input=path.join(process.cwd(),'public','assets','aistudio',name);
  if(!fs.existsSync(input))throw new Error('Required homepage video missing: '+name);
  const temp=input+'.optimized.mp4';
  try{
    const args=[
      '-hide_banner','-loglevel','error','-nostdin','-y','-i',input,
      '-map','0:v:0','-map','0:a:0?','-sn','-dn',
      '-vf',"scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      '-r','24','-c:v','libx264','-preset','veryfast','-crf','27',
      '-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p',
      '-c:a','aac','-b:a','96k','-ac','2',
      '-movflags','+faststart','-f','mp4',temp
    ];
    console.log('[hero-optimize] Processing',name,'originalMiB',(fs.statSync(input).size/1048576).toFixed(2));
    const run=spawnSync('ffmpeg',args,{encoding:'utf8',timeout:12*60*1000,maxBuffer:1024*1024*4});
    if(run.error||run.status!==0)throw new Error('ffmpeg failed: '+String(run.error?.message||run.stderr).slice(-1000));
    if(!fs.existsSync(temp)||fs.statSync(temp).size<1024)throw new Error('Missing or empty optimized output');
    fs.renameSync(temp,input);
    // Produce a real first-frame poster using the optimized clip in the
    // build container. This avoids displaying a blank purple canvas while
    // the initial MP4 request is waiting for metadata.
    const poster=path.join(path.dirname(input),posterName);
    const posterTemp=poster+'.tmp.jpg';
    try{
      const thumb=spawnSync('ffmpeg',[
        '-hide_banner','-loglevel','error','-nostdin','-y',
        '-ss','0.2','-i',input,'-frames:v','1',
        '-vf',"scale='min(960,iw)':-2",'-q:v','4',
        posterTemp,
      ],{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
      if(thumb.error||thumb.status!==0||!fs.existsSync(posterTemp)||fs.statSync(posterTemp).size<1000)
        throw new Error('Failed to create homepage poster: '+posterName);
      fs.renameSync(posterTemp,poster);
      console.log('[hero-optimize] Poster ready',posterName,fs.statSync(poster).size,'bytes');
    }finally{if(fs.existsSync(posterTemp))fs.unlinkSync(posterTemp);}
    console.log('[hero-optimize] Ready',name,'webMiB',(fs.statSync(input).size/1048576).toFixed(2),'codec=h264/yuv420p+aac faststart=yes');
  }finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
