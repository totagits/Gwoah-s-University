self.addEventListener('push', event => {
  let data={title:'Gwoah’s University',body:'Your portal has new updates.',url:'/?portal=1'};
  try { if(event.data)data={...data,...event.data.json()}; } catch {}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,tag:'gwoah-portal-updates',data:{url:'/?portal=1'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow('/?portal=1'));});
