const REVISION_KEY='hiau:pwa:deployed-commit';
let reloadRequested=false;

export const isDedicatedPwaPath=(pathname:string)=>
  /^\/(?:student|staff)(?:\/|$)/.test(pathname);

const readDeployedCommit=async()=>{
  const response=await fetch('/api/health',{cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok)return null;
  const data=await response.json().catch(()=>null);
  return typeof data?.commit==='string'&&/^[0-9a-f]{40,64}$/i.test(data.commit)
    ? data.commit.toLowerCase():null;
};

const reloadForRevision=(commit:string)=>{
  if(reloadRequested)return;
  const previous=sessionStorage.getItem(REVISION_KEY);
  sessionStorage.setItem(REVISION_KEY,commit);
  if(previous&&previous!==commit){
    reloadRequested=true;
    window.location.reload();
  }
};

export async function checkPwaRevision(){
  if(!isDedicatedPwaPath(window.location.pathname))return;
  try{
    const commit=await readDeployedCommit();
    if(commit)reloadForRevision(commit);
  }catch{
    // Offline/temporary staging outage must not break the current session.
  }
}

export async function registerPwaUpdates(){
  if(!('serviceWorker' in navigator)||!window.isSecureContext)return;

  try{
    const registration=await navigator.serviceWorker.register('/sw.js',{
      scope:'/',updateViaCache:'none',
    });

    if(isDedicatedPwaPath(window.location.pathname)){
      // Check the worker itself whenever an installed PWA returns to focus.
      const refresh=()=>{
        if(document.visibilityState==='visible'){
          void registration.update().catch(()=>undefined);
          void checkPwaRevision();
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(reloadRequested)return;
        // A changed worker taking control means the app shell should be
        // refreshed. The guard prevents controller-change reload loops.
        reloadRequested=true;
        window.location.reload();
      });

      window.addEventListener('focus',refresh);
      window.addEventListener('online',refresh);
      document.addEventListener('visibilitychange',refresh);

      // Seed the currently running revision after the app has loaded.
      await checkPwaRevision();
    }
  }catch(error){
    console.warn('HIAU PWA registration unavailable',error);
  }
}
