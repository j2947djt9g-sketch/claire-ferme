const CACHE="clair-ferme-0.3.0";
const CORE=["./mono.css?v=0.3.0","./launch.css?v=0.3.0","./pasture.css?v=0.3.0","./src/launch.js?v=0.3.0","./src/scenes.mjs","./","./index.html","./styles.css?v=0.3.0","./src/app.mjs?v=0.3.0","./src/domain.mjs","./src/pwa.mjs","./assets/pia-flat.png","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("clair-ferme-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
 if(request.method!=="GET"||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put("./",response.clone());}return response;}).catch(async()=>await caches.match("./")||Response.error()));return;
 }
 event.respondWith(caches.match(request).then(cached=>{
  const refresh=fetch(request).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;});
  if(cached){event.waitUntil(refresh.catch(()=>{}));return cached;}return refresh;
 }));
});
