const C="natcho-jmt-5.0.7-jmt.1";
const A=["./","./index.html","./manifest.json","./icon-180.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
function netFirst(req){
  return new Promise(resolve=>{
    let settled=false;
    const timer=setTimeout(()=>{ if(!settled){settled=true;
      caches.match(req).then(r=>resolve(r||caches.match("./index.html")));} },3500);
    fetch(req).then(net=>{
      clearTimeout(timer);
      if(net&&net.ok){ const cp=net.clone(); caches.open(C).then(c=>{c.put(req,cp);}); }
      if(!settled){settled=true; resolve(net);}
    }).catch(()=>{ clearTimeout(timer);
      if(!settled){settled=true;
        caches.match(req).then(r=>resolve(r||caches.match("./index.html")));} });
  });
}
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.pathname.endsWith("/version.json")){ e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(e.request))); return; }
  const nav=(e.request.mode==="navigate")||u.pathname.endsWith("/index.html")||u.pathname.endsWith("/");
  if(nav){ e.respondWith(netFirst(e.request)); return; }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{
    if(net&&net.ok){ const cp=net.clone(); caches.open(C).then(c=>c.put(e.request,cp)); }
    return net;
  })));
});