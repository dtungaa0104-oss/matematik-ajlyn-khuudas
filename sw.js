/* Интернэтгүй ажиллах: сайтын файлуудыг төхөөрөмж дээр хадгална.
   Интернэттэй үед файлыг үргэлж сүлжээнээс авч хадгалсныг шинэчилнэ, интернэтгүй үед хадгалснаас өгнө.
   Тиймээс сайтаа шинэчлэхэд VERSION-ийг өөрчлөх шаардлагагүй. */
const VERSION = 'ajh-v1';
const CORE = [
  './', 'index.html', 'css/style.css', 'favicon.svg', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/config.js', 'js/figures.js', 'js/generators.js', 'js/methods.js', 'js/mathfmt.js', 'js/app.js', 'js/board.js',
  'js/motivate.js', 'js/extras.js', 'js/drill.js', 'js/results.js',
  'vendor/katex/katex.min.js', 'vendor/katex/katex.min.css', 'vendor/qrcode.js', 'vendor/html2pdf.bundle.min.js',
   'vendor/katex/fonts/KaTeX_AMS-Regular.woff2',   'vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',   'vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',   'vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',   'vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',   'vendor/katex/fonts/KaTeX_Main-Bold.woff2',   'vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',   'vendor/katex/fonts/KaTeX_Main-Italic.woff2',   'vendor/katex/fonts/KaTeX_Main-Regular.woff2',   'vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',   'vendor/katex/fonts/KaTeX_Math-Italic.woff2',   'vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',   'vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',   'vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',   'vendor/katex/fonts/KaTeX_Script-Regular.woff2',   'vendor/katex/fonts/KaTeX_Size1-Regular.woff2',   'vendor/katex/fonts/KaTeX_Size2-Regular.woff2',   'vendor/katex/fonts/KaTeX_Size3-Regular.woff2',   'vendor/katex/fonts/KaTeX_Size4-Regular.woff2',   'vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2', 
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!same && !font) return;                       // Apps Script болон бусад хаягт хүрэхгүй
  if(same && url.pathname.endsWith('/js/config.js')){ // багшийн тохиргоо: эхлээд сүлжээнээс
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; }).catch(() => caches.match(req)));
    return;
  }
  if(req.mode === 'navigate'){                       // хуудас: эхлээд сүлжээнээс, байхгүй бол хадгалснаас
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html', {ignoreSearch: true}).then(r => r || caches.match('./'))));
    return;
  }
  if(font){                                          // үсгийн хэлбэр: хадгалснаас
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })));
    return;
  }
  // Сайтын файлууд: интернэттэй үед үргэлж шинэ хувилбар, интернэтгүй үед хадгалсан хувилбар
  e.respondWith(fetch(req).then(r => { if(r && r.ok){ const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; })
    .catch(() => caches.match(req, {ignoreSearch: true})));
});
