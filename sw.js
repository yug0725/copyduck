// 오프라인에서도 화면이 열리게 하는 캐시. 표현 데이터(data.js)는 항상 새 것을 먼저 받아 온다.
const CACHE = "yte-v2";
const SHELL = ["./", "index.html", "data.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // 유튜브 등 외부는 건드리지 않음
  // 새 버전 우선, 인터넷이 없으면 저장본
  e.respondWith(
    fetch(e.request, {cache: "no-cache"}).then(r => {  // 브라우저 캐시 말고 서버에 새 버전 확인
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
