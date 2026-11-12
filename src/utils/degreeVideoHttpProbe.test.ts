import test from 'node:test';
import assert from 'node:assert/strict';
import {probeDegreeVideo} from './degreeVideoHttpProbe';
import {createDegreeVideoAuditCsv} from './degreeVideoAudit';

const endpoint='/api/public/video/business--bachelor-of-business-administration-in-accounting';
const response=(status:number,contentType:string,bytes:string):Response=>
  ({status,ok:status>=200&&status<300,
    headers:{get:(key:string)=>key==='content-type'?contentType:key==='content-length'?bytes:null}} as Response);

test('WEB-GATE probes distinguish actual MP4 response, HTTP 404 and invalid media',async()=>{
 let options:RequestInit|undefined;
 const ok=await probeDegreeVideo(endpoint,async (_url,opts)=>{
   options=opts;
   return response(200,'video/mp4','450');
 });
 assert.equal(ok.status,'reachable');
 assert.equal(options?.method,'HEAD');
 assert.equal(options?.credentials,'same-origin');
 assert.ok(ok.checkedAt.includes('T'));
 const missing=await probeDegreeVideo(endpoint,async()=>response(404,'text/html','0'));
 assert.equal(missing.status,'unavailable');
 const wrongMime=await probeDegreeVideo(endpoint,async()=>response(200,'text/html','512'));
 assert.equal(wrongMime.status,'invalid-response');
 const short=await probeDegreeVideo(endpoint,async()=>response(200,'video/mp4','0'));
 assert.equal(short.status,'invalid-response');
 const offline=await probeDegreeVideo(endpoint,async()=>{throw Error('network down');});
 assert.equal(offline.status,'network-error');
 const wrongUrl=await probeDegreeVideo('https://other.example/private');
 assert.equal(wrongUrl.status,'invalid-response');
});
test('WEB-GATE 19-degree CSV retains actual HTTP evidence without claiming video playback',()=>{
 const rows=createDegreeVideoAuditCsv([{
  slot:'business--accounting',label:'Accounting',defaultSrc:'/assets/degree-clips/test.mp4',
  publicSrc:endpoint,version:1,mediaSource:'published',publicAvailable:true
 }],{'business--accounting':{
  status:'reachable',httpStatus:200,checkedAt:'2026-11-12T10:00:00.000Z',
  detail:'MP4 endpoint responded to HEAD; browser playback must still be verified.'
 }});
 assert.match(rows,/HTTP reachability result/);
 assert.match(rows,/reachable/);
 assert.match(rows,/2026-11-12T10:00:00.000Z/);
 assert.match(rows,/Not tested/);
});
