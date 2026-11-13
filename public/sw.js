/* HIAU public PWA worker.
 * Never cache authenticated HTML, API responses, student records or media.
 * The only offline document is a neutral static help page.
 */
const OFFLINE_CACHE='hiau-public-offline-v2';
const OFFLINE_URL='/offline.html';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(OFFLINE_CACHE).then(cache=>cache.add(OFFLINE_URL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  await caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==OFFLINE_CACHE).map(key=>caches.delete(key))));
  await self.clients.claim();
  // A newly activated worker means the installed Student/Staff PWA may still
  // be executing an older in-memory JS bundle. Refresh only those dedicated
  // app routes; never force-refresh the public university website.
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(windows.map(client=>{
   try{
    const url=new URL(client.url);
    if(url.origin===self.location.origin&&/^\/(?:student|staff)(?:\/|$)/.test(url.pathname))
      return client.navigate(client.url);
   }catch{}
   return undefined;
  }));
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.mode!=='navigate'||req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.searchParams.has('portal')
    ||url.searchParams.has('activate'))return;
 // Network-only navigation. No university web page or private API response
 // is persisted by the PWA; only the generic offline fallback is cached.
 event.respondWith(fetch(req).catch(()=>caches.match(OFFLINE_URL)));
});
self.addEventListener('push',event=>{
 let data={title:'HIAU',body:'You have a new university update.',url:'/'};
 try{if(event.data)data={...data,...event.data.json()};}catch{}
 const url=typeof data.url==='string'&&data.url.startsWith('/')&&!data.url.startsWith('//')?data.url:'/';
 event.waitUntil(self.registration.showNotification(data.title,{
  body:data.body,tag:'hiau-updates',data:{url}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=event.notification.data?.url||'/';
 event.waitUntil(clients.openWindow(url));
});
