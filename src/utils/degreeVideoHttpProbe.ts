export type VideoHttpResult={
 status:'reachable'|'unavailable'|'invalid-response'|'network-error';
 httpStatus:number|null;
 checkedAt:string;
 detail:string;
};
// This only verifies HTTP media delivery, not video decode, audio or accessibility.
export async function probeDegreeVideo(
 url:string,
 requester:typeof fetch=fetch
):Promise<VideoHttpResult>{
 const checkedAt=new Date().toISOString();
 if(!/^\/api\/public\/video\/[a-z0-9_-]+$/.test(url))
   return {status:'invalid-response',httpStatus:null,checkedAt,detail:'Unexpected media endpoint.'};
 try{
   const response=await requester(url,{method:'HEAD',cache:'no-store',credentials:'same-origin'});
   const type=(response.headers.get('content-type')||'').toLowerCase();
   const size=Number(response.headers.get('content-length')||'0');
   if(response.status===404)return {status:'unavailable',httpStatus:404,checkedAt,detail:'No published or bundled video file.'};
   if(!response.ok||!type.startsWith('video/mp4')||!Number.isSafeInteger(size)||size<12)
     return {status:'invalid-response',httpStatus:response.status,checkedAt,
       detail:'Unexpected HTTP response, MIME type or content length.'};
   return {status:'reachable',httpStatus:response.status,checkedAt,
     detail:'MP4 endpoint responded to HEAD; browser playback must still be verified.'};
 }catch{
   return {status:'network-error',httpStatus:null,checkedAt,detail:'Request failed or the server could not be reached.'};
 }
}
