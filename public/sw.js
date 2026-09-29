const VERSION='v5';
const CACHE='anatomia-3d-'+VERSION;
const APP_SHELL=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(key=>key.startsWith('anatomia-3d-')&&key!==CACHE).map(key=>caches.delete(key))
    )).then(()=>self.clients.claim())
  );
});

async function cacheResponse(request,response){
  if(response?.ok&&new URL(request.url).origin===self.location.origin){
    const cache=await caches.open(CACHE);
    await cache.put(request,response.clone());
  }
  return response;
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>cacheResponse(new Request('./index.html'),response))
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>cacheResponse(event.request,response))
      .catch(()=>caches.match(event.request).then(cached=>cached||new Response('Recurso no disponible sin conexión',{status:503})))
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
