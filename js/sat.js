/* «SAT» таб: «Цахимаар бөглөх / Хэвлэх харагдац / Дүн»-гийн хажууд.
   Оноо1600 (SAT бэлтгэлийн сайт) руу шилжих холбоосууд, мөн энэ сайт дахь 5-р шатны (6–7: Англи гүүр, 8–12: SAT) сэдвүүд.
   Холбоос: …/#sat. Сайтын хаягийг SAT_SITE-д (эсвэл js/config.js-ийн APP_CONFIG.SAT_URL-д) бичнэ. */
(function(){
  if(typeof S === 'undefined') return;
  const SAT_SITE = 'https://sat-yuuz.onrender.com';   // «Оноо1600 · SAT бэлтгэл»
  const site = () => String((window.APP_CONFIG || {}).SAT_URL || SAT_SITE || '').trim().replace(/[#?].*$/, '').replace(/\/+$/, '');
  const ok = () => /^https:\/\//.test(site());
  const LINKS = [
    ['', 'Оноо1600 нүүр хуудас', 'SAT-ийн бүтэц, жишиг дасгал, үгсийн сан, томьёо — бүгд нэг дор.'],
    ['/#practice', 'Жишиг дасгал', 'Math ба Reading & Writing-ийн асуултууд, хүндрэлээр нь сонгож, монгол тайлбартай.'],
    ['/tips', 'SAT-д бэлдэх зөвлөгөө', 'Шалгалтын бүтэц, 3 сарын бэлтгэлийн хуваарь, хэсэг бүрийн арга барил.'],
    ['/student', 'Сурагчийн хуудас', 'Багшийн өгсөн ангийн кодоор нэвтэрч, 2 модультай тест, алдааны дэвтэр, явцаа харна.'],
    ['/teacher', 'Багшийн хуудас', 'Анги үүсгэж, SAT-ийн даалгавар өгөх, ангийн шинжилгээ харах.']
  ];
  /* SAT шатыг давсан сурагчийн «Бүтэн SAT тест» товч (сурагчийн горимд ч ажиллана) */
  document.addEventListener('click', e => { if(e.target.closest('[data-sat]') && ok()) window.open(site() + '/#practice', '_blank', 'noopener'); });
  window.SAT = {site, open: () => { S.mode = 'sat'; render(); }};
  if(S.student) return;
  const ext = (path, text, cls) => `<a class="${cls || ''}" href="${esc(site() + path)}" target="_blank" rel="noopener">${text}</a>`;
  function panelHTML(){
    const g = S.grade, sat = g >= 8, tps = W.topicsOf(g).map((t, i) => ({t, i: i + 1})).filter(x => x.t.sat);
    const topicList = tps.length ? `<ul class="sat-topics">${tps.map(x => `<li><span>${Mx(esc(x.t.title))}</span><button class="btn ghost" type="button" data-satgo="${x.i}">${sat ? 'SAT' : 'Англи'} хуудас үүсгэх</button></li>`).join('')}</ul>` : '<p class="small">Энэ ангид 5-р шаттай сэдэв алга.</p>';
    return `<article class="paper sat-tab">
      <div class="sat-hero"><div><h2 class="p-topic">SAT — олон улсын шалгалтад бэлдэх</h2>
        <p>SAT нь АНУ болон дэлхийн олон их сургуулийн элсэлтэд шаардлагатай шалгалт. Математик (Math), англи хэл (Reading &amp; Writing) гэсэн хоёр хэсэгтэй, 400–1600 оноотой. Шалгалтын бүтэц, бэлтгэлийн зөвлөгөө, жишиг дасгалыг <b>Оноо1600</b> сайтаас үнэгүй авна.</p></div>
        ${ok() ? ext('', 'Оноо1600 сайт руу очих ↗', 'btn sat-go') : '<p class="status">SAT сайтын хаяг тохируулаагүй байна (js/sat.js).</p>'}</div>
      ${ok() ? `<div class="sat-links">${LINKS.map(([p, t, d]) => `<div class="sat-link">${ext(p, t + ' ↗')}<p class="small">${d}</p></div>`).join('')}</div>` : ''}
      <div class="sat-mock"><div><b>SAT Math жишиг тест</b><p class="small">Жинхэнэ SAT-ийн Math хэсгийн бүтэц: 2 дасан зохицох модуль × 22 асуулт × 35 минут. Цахимаар эсвэл PDF-ээр өгнө.</p></div><button class="btn" type="button" data-satm>Тест нээх</button></div>
      <h3>Энэ сайт дахь англи хэлний шат</h3>
      <ol class="sat-path"><li><b>6–7-р анги — Англи гүүр.</b> Сэдвийн гурван түвшнийг давсан сурагчид ижил сэдвийн богино бодлого англи хэлээр, монгол тусламжтайгаар гарна. Англи нэр томьёонд дасна.</li>
        <li><b>8–12-р анги — SAT шат.</b> Хэрэглээ түвшний дараа SAT-ийн хэлбэр, хүндрэлтэй бодлого (8–9: PSAT 8/9, 10: PSAT 10, 11–12: SAT).</li>
        <li><b>Дараа нь — Оноо1600.</b> Бүтэн SAT-ийн бэлтгэл: англи хэлний хэсэг, 2 модультай тест, үгсийн сан.</li></ol>
      <h3>${g}-р анги: ${sat ? 'SAT шаттай' : 'Англи гүүртэй'} сэдвүүд</h3>
      <p class="small">Сурагчид Хэрэглээ түвшнийг 80%-иас дээш давахад автоматаар нээгдэнэ. Багш энд шууд үүсгэж, холбоосоор өгч болно. Анги солих бол зүүн талын «Анги» хэсгээс сонгоно.</p>
      ${topicList}</article>`;
  }
  /* Таб нэмэх */
  const bar = document.querySelector('.tabbar'), res = document.getElementById('tabResults');
  if(bar && !document.getElementById('tabSat')){ const b = document.createElement('button'); b.className = 'tab'; b.id = 'tabSat'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false'); b.textContent = 'SAT'; bar.appendChild(b); }
  const r0 = window.render;
  window.render = function(){
    const out = r0.apply(this, arguments), on = S.mode === 'sat', t = document.getElementById('tabSat');
    if(t) t.setAttribute('aria-selected', String(on));
    document.body.classList.toggle('satmode', on);
    if(on){ $('sheet').innerHTML = panelHTML(); $('score').hidden = true; }
    return out;
  };
  document.addEventListener('click', e => {
    if(e.target.closest('#tabSat')){ S.mode = 'sat'; render(); if(location.hash !== '#sat') history.replaceState(null, '', location.pathname + location.search + '#sat'); return; }
    if(e.target.closest('#tabOnline, #tabPrint, #tabResults') && location.hash === '#sat') history.replaceState(null, '', location.pathname + location.search);
    const g = e.target.closest('[data-satgo]'); if(g){ S.topic = +g.dataset.satgo; S.level = 5; S.mc = 4; S.op = 2; S.legacy = null; S.mode = 'online'; history.replaceState(null, '', location.pathname + location.search); build(); window.scrollTo(0, 0); return; }
  });
  if(location.hash === '#sat'){ S.mode = 'sat'; render(); }
})();
