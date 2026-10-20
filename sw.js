const CACHE='saber-pratica-v1';
const CORE=["./", "index.html", "capa.jpg", "manifest.webmanifest", "icon-192.png", "icon-512.png", "maskable-512.png"];
const AUDIO=["texto-01.mp3", "texto-02.mp3", "texto-03.mp3", "texto-04.mp3", "texto-05.mp3", "texto-06.mp3", "texto-07.mp3", "texto-08.mp3", "texto-09.mp3", "texto-10.mp3", "texto-11.mp3", "texto-12.mp3", "texto-13.mp3", "texto-14.mp3", "texto-15.mp3", "texto-16.mp3", "texto-17.mp3", "texto-18.mp3", "texto-19.mp3", "texto-20.mp3"];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);await Promise.all(AUDIO.map(u=>c.add(u).catch(()=>{})));self.skipWaiting();})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})())});
async function rangeResponse(req,res){
  const h=req.headers.get('range'); if(!h||res.status!==200) return res;
  const m=/bytes=(\d*)-(\d*)/.exec(h); if(!m) return res;
  const buf=await res.arrayBuffer(); const size=buf.byteLength;
  let s=m[1]===''?size-parseInt(m[2],10):parseInt(m[1],10); let e=(m[1]===''||m[2]==='')?size-1:parseInt(m[2],10);
  e=Math.min(e,size-1);
  return new Response(buf.slice(s,e+1),{status:206,statusText:'Partial Content',headers:{'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+size,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){ // fontes Google: guardar quando houver rede
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req);const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone());return r}).catch(()=>hit);return hit||net;}));return;}
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    let res=await c.match(req,{ignoreSearch:true});
    if(!res){try{res=await fetch(req.url.split('#')[0]);if(res.ok&&res.status===200)c.put(req.url.split('#')[0],res.clone());}catch(err){res=await c.match('index.html');}}
    return rangeResponse(req,res);
  })());
});
