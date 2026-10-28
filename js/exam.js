/* ЭЕШ-ийн бүтэцтэй сорил (албан ёсны ЭЕШ биш, бэлтгэлийн дасгал).
   Бүтэц: 1-р хэсэг 36 сонгох даалгавар (12 агуулга × мэдлэг 1, чадвар 2, хэрэглээ 3 оноо = 72), 2-р хэсэг 4 задгай бодлого (2 + 2 + 3 оноо = 28). Нийт 100 оноо, 100 минут.
   Сорил бүр seed-ээс бүрэн тогтоно: #e-54321 холбоосоор бүх сурагч ижил сорил авна. Дүнг «E-54321» кодоор багшид илгээнэ. */
(function(){
  if(typeof S === 'undefined' || !window.WS) return;
  const MIN = 100;
  const STR = [
    ['Тоо, зэрэг, язгуур, логарифм', ['irr9', 'surd9', 'rexp10', 'nroot10', 'std10', 'log12', 'logp12']],
    ['Алгебрын илэрхийлэл', ['alg9', 'afrac9', 'fact10', 'afrac10', 'poly12', 'pdiv12']],
    ['Тэгшитгэл, тэнцэтгэл биш', ['quad10', 'biq10', 'rat9', 'sys9', 'qineq11', 'lineq10', 'abseq12', 'expeq10', 'loge12']],
    ['Функц', ['func10', 'quadf10', 'hyp10', 'inv11', 'comp11', 'parity11', 'mono11']],
    ['Дараалал, прогресс', ['ap11', 'gp11', 'seq11']],
    ['Тригонометр', ['trig180', 'rad11', 'tval11', 'ident11', 'trigf12']],
    ['Уламжлал', ['der11', 'dpow11', 'drule11', 'chain11', 'tline11', 'extr11', 'dexp12', 'dln12', 'dtrig12']],
    ['Интеграл', ['int11', 'defint11', 'area11', 'iexp12']],
    ['Магадлал, статистик', ['perm10', 'comp10', 'cprob9', 'mean11', 'disp11', 'ev12', 'quart10']],
    ['Хавтгайн геометр', ['cosrule10', 'triarea10', 'insc10', 'circ9', 'arc10', 'simtri', 'pyth8']],
    ['Вектор, координат', ['vecop10', 'dot10', 'line10', 'circle10', 'dist3d11', 'vec3d11']],
    ['Огторгуйн биет', ['solid10', 'solid9', 'sect10']]
  ];
  const P2 = [[2, 3], [6], [9, 10], [8, 4]];   // 2-р хэсгийн бодлого бүрийн агуулга (STR-ийн индекс)
  const LOC = {}; W.GRADES.forEach(g => W.topicsOf(g).forEach((t, i) => { LOC[t.id] = {g, t: i + 1, title: t.title}; }));
  function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const cache = {};
  /* Сорил үүсгэх: seed → 48 даалгавар (36 сонгох + 4 × 3 задгай) */
  function make(seed){
    if(cache[seed]) return cache[seed];
    const r = rng(seed * 2654435761), pick = a => a[Math.floor(r() * a.length)];
    const one = (ids, l, n, form, k) => { const order = ids.slice().sort(() => r() - .5);
      for(const id of order){ const L = LOC[id]; if(!L) continue; const s = 1000 + ((seed * 31 + k * 977 + l * 7919) % 97000); const it = W.makeSheet(L.g, L.t, l, n, s, form); if(it.length === n) return {id, L, items: it}; } return null; };
    const items = [];
    [1, 2, 3].forEach(l => STR.forEach(([name, ids], si) => { const x = one(ids, l, 1, 1, si * 10 + l); if(x) items.push(Object.assign(x.items[0], {part: 1, str: si, pts: l, lvl: l, g: x.L.g, t: x.L.t})); }));
    P2.forEach((opts, k) => { const si = pick(opts), ids = STR[si][1].slice().sort(() => r() - .5);
      for(const id of ids){ const L = LOC[id]; if(!L) continue; const s = 2000 + ((seed * 17 + k * 131) % 97000);
        const a = W.makeSheet(L.g, L.t, 2, 1, s, 0), b = W.makeSheet(L.g, L.t, 3, 2, s + 1, 0);
        if(a.length === 1 && b.length === 2){ [[a[0], 2, 2, 'а'], [b[0], 2, 3, 'б'], [b[1], 3, 3, 'в']].forEach(([p, pts, lvl, sub]) => items.push(Object.assign(p, {part: 2, prob: k, sub, str: si, pts, lvl, g: L.g, t: L.t}))); break; } } });
    return (cache[seed] = items);
  }
  const label = (X, i) => { const p = X[i]; return p.part === 1 ? String(i + 1) : (37 + p.prob) + p.sub; };
  function score(X, ans){
    const res = X.map((p, i) => { const a = ans[i]; if(a == null || a === '') return null; return p.mc ? a === p.ci : W.check(p, a) === true; });
    const pts = X.reduce((s, p, i) => s + (res[i] === true ? p.pts : 0), 0), p1 = X.reduce((s, p, i) => s + (p.part === 1 && res[i] === true ? p.pts : 0), 0);
    const strands = STR.map(([name], si) => { const idx = X.map((p, i) => p.str === si ? i : -1).filter(i => i >= 0); return {si, name, max: idx.reduce((s, i) => s + X[i].pts, 0), got: idx.reduce((s, i) => s + (res[i] === true ? X[i].pts : 0), 0), idx}; });
    return {res, pts, p1, p2: pts - p1, strands};
  }

  /* ---------- хадгалалт ---------- */
  const norm = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const who = () => [($('stName') || {}).value, ($('stClass') || {}).value].map(norm).join('|');
  const rj = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch(e){ return d; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const tag = () => (typeof linkTag === 'function' ? linkTag() : '');
  const base = () => location.pathname + location.search;

  /* ---------- Сорилын дэлгэц ---------- */
  const E = {seed: 0, X: null, ans: {}, t0: 0, timed: true, done: false, tick: null, sc: null, fixed: false};
  function shell(){
    let el = document.getElementById('exam');
    if(!el){ el = document.createElement('section'); el.id = 'exam'; el.className = 'exam'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'exTitle'); document.body.appendChild(el); }
    document.body.classList.add('exam-open'); return el;
  }
  const save = () => wj('ws_exam', {seed: E.seed, ans: E.ans, t0: E.t0, timed: E.timed, done: E.done, who: who()});
  function intro(seed, fixed){
    const st = rj('ws_exam', null);
    if(st && !st.done && st.who === who() && (!fixed || st.seed === seed) && st.t0){ Object.assign(E, {seed: st.seed, ans: st.ans || {}, t0: st.t0, timed: st.timed, done: false, fixed}); E.X = make(E.seed); run(); return; }
    Object.assign(E, {seed: seed || 1000 + Math.floor(Math.random() * 98000), ans: {}, t0: 0, timed: true, done: false, fixed: !!fixed}); E.X = null;
    const hist = (rj('ws_examh', {})[who()] || []).slice(-5).reverse();
    shell().innerHTML = `<div class="ex-in"><div class="ex-top"><h2 id="exTitle">ЭЕШ-ийн бүтэцтэй сорил</h2><button class="btn ghost" type="button" data-exclose>Хаах</button></div>
      <p>Элсэлтийн ерөнхий шалгалтын математикийн хичээлийн бүтэцтэй адил сорил. Албан ёсны ЭЕШ биш тул оноог 200–800 оноонд хөрвүүлэхгүй, 100 онооноос хэдийг авсныг болон аль агуулгаас оноо алдсаныг харуулна.</p>
      <table class="rtable ex-struct"><thead><tr><th>Хэсэг</th><th>Даалгавар</th><th class="num">Оноо</th></tr></thead><tbody>
        <tr><td>1-р хэсэг</td><td>36 сонгох даалгавар: 12 агуулга тус бүрээс мэдлэг (1 оноо), чадвар (2), хэрэглээ (3)</td><td class="num">72</td></tr>
        <tr><td>2-р хэсэг</td><td>4 задгай бодлого, тус бүр 3 дэд асуулттай (2 + 2 + 3 оноо). Хариугаа тоогоор бичнэ.</td><td class="num">28</td></tr>
        <tr><td colspan="2"><b>Нийт</b> · ${MIN} минут</td><td class="num"><b>100</b></td></tr></tbody></table>
      <p class="small">Жинхэнэ шалгалтад 5 сонголт байдаг бол энд 4 сонголттой. Хариу тань энэ төхөөрөмж дээр хадгалагдах тул хуудас хаагдсан ч үргэлжлүүлж болно.</p>
      <div class="co-who"><label class="f">Нэр, овог<input id="exName" maxlength="40" value="${esc($('stName').value)}" placeholder="Жишээ: Б. Сараа"></label><label class="f">Анги, бүлэг<input id="exClass" maxlength="12" value="${esc($('stClass').value)}" placeholder="12а"></label></div>
      <label class="check"><input type="checkbox" id="exTimed" checked> ${MIN} минутын хугацаатай (жинхэнэ шалгалт шиг)</label>
      ${E.fixed ? `<p class="small">Багшийн өгсөн сорил · дугаар ${E.seed}</p>` : ''}
      <button class="btn co-go" type="button" id="exStart">Сорил эхлэх</button>
      ${hist.length ? `<h3>Өмнөх сорилууд</h3><ul class="ex-hist">${hist.map(h => `<li><b>${h.s}</b> / 100 <small>${esc(h.d)} · 1-р хэсэг ${h.p1}/72 · 2-р хэсэг ${h.p2}/28</small></li>`).join('')}</ul>` : ''}</div>`;
  }
  function syncWho(){ const n = document.getElementById('exName'), c = document.getElementById('exClass'); if(!n) return; $('stName').value = n.value; $('stClass').value = c.value; try { localStorage.setItem('ws_student', JSON.stringify({n: n.value, c: c.value})); } catch(e){} }
  const left = () => E.timed ? Math.max(0, MIN * 60 - Math.floor((Date.now() - E.t0) / 1000)) : null;
  function run(){
    E.X = make(E.seed); const X = E.X;
    const qMC = (p, i) => `<li class="ex-q" id="exq${i}"><span class="p-n">${label(X, i)}.</span><div><div class="p-q">${Mx(p.q)} <span class="ex-pts">${p.pts} оноо</span></div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}
      <div class="p-mc${p.mc.some(o => o.replace(/<[^>]+>/g, '').length > 9) ? ' long' : ''}" role="group" aria-label="${label(X, i)}-р даалгавар">${p.mc.map((o, k) => `<button type="button" class="opt" data-exi="${i}" data-k="${k}" aria-pressed="${E.ans[i] === k}"><b>${LETTER[k]}</b><span>${Mx(o)}</span></button>`).join('')}</div></div></li>`;
    const qOpen = (p, i) => `<div class="ex-sub" id="exq${i}"><div class="p-q"><b>${p.sub})</b> ${Mx(p.q)} <span class="ex-pts">${p.pts} оноо</span></div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}<div class="p-inrow"><input class="ex-ans" data-exin="${i}" value="${esc(E.ans[i] || '')}" aria-label="${label(X, i)} хариу" autocomplete="off" spellcheck="false"></div>${p.note && !(X[i + 1] && X[i + 1].part === 2 && X[i + 1].prob === p.prob && X[i + 1].note === p.note) ? `<p class="small">${Mx(esc(p.note))}</p>` : ''}</div>`;
    const p1 = X.map((p, i) => p.part === 1 ? qMC(p, i) : '').join('');
    const p2 = [0, 1, 2, 3].map(k => { const idx = X.map((p, i) => p.part === 2 && p.prob === k ? i : -1).filter(i => i >= 0); if(!idx.length) return ''; const tp = LOC[W.topicsOf(X[idx[0]].g)[X[idx[0]].t - 1].id];
      return `<li class="ex-q ex-prob"><span class="p-n">${37 + k}.</span><div><div class="small ex-topic">${Mx(esc(tp.title))} · 7 оноо</div>${idx.map(i => qOpen(X[i], i)).join('')}</div></li>`; }).join('');
    shell().innerHTML = `<div class="ex-in run"><div class="ex-bar"><b id="exTitle">ЭЕШ сорил</b><span id="exTime" class="ex-time" role="timer"></span><span id="exCnt"></span><button class="btn" type="button" id="exSubmit">Дуусгах</button></div>
      <nav class="ex-nav" aria-label="Даалгавар руу очих">${X.map((p, i) => `<a href="#exq${i}" data-exjump="${i}" class="${E.ans[i] != null && E.ans[i] !== '' ? 'on' : ''}">${label(X, i)}</a>`).join('')}</nav>
      <article class="paper ex-paper"><h3 class="p-sec">1-р хэсэг. Сонгох даалгавар (72 оноо)</h3><ol class="ex-list">${p1}</ol>
      <h3 class="p-sec">2-р хэсэг. Задгай даалгавар (28 оноо)</h3><p class="small">Хариуг тоогоор (бутархай бол 3/4, язгуур бол √2 гэх мэт) бичнэ.</p><ol class="ex-list">${p2}</ol>
      <div class="row"><button class="btn" type="button" id="exSubmit2">Сорил дуусгаж дүнгээ харах</button></div></article></div>`;
    counter(); clearInterval(E.tick); E.tick = setInterval(tickT, 1000); tickT();
  }
  function counter(){ const n = E.X.filter((p, i) => E.ans[i] != null && E.ans[i] !== '').length, c = document.getElementById('exCnt'); if(c) c.textContent = `${n} / ${E.X.length} хариулсан`; }
  function tickT(){ const el = document.getElementById('exTime'); if(!el){ clearInterval(E.tick); return; } const s = left(); if(s == null){ el.textContent = 'Хугацаагүй'; return; } el.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('low', s < 600); if(s <= 0) submit(true); }
  function submit(timeUp){
    if(E.done) return;
    const blank = E.X.filter((p, i) => E.ans[i] == null || E.ans[i] === '').length;
    if(!timeUp && blank && !confirm(`${blank} даалгавар хариулаагүй байна. Сорилоо дуусгах уу?`)) return;
    E.done = true; clearInterval(E.tick); save();
    const sc = E.sc = score(E.X, E.ans), d = new Date(), ds = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const H = rj('ws_examh', {}), h = H[who()] || []; h.push({seed: E.seed, s: sc.pts, p1: sc.p1, p2: sc.p2, d: ds}); H[who()] = h.slice(-30); wj('ws_examh', H);
    // багшид илгээх
    const name = $('stName').value.trim(); let sent = false;
    if(name && typeof window.queueResult === 'function' && window.resultsURL && resultsURL()){
      window.queueResult({code: 'E-' + E.seed, grade: 12, topic: 'ЭЕШ-ийн бүтэцтэй сорил', level: 'ЭЕШ', form: '36 сонгох + 4 задгай', name, group: $('stClass').value.trim(), score: sc.pts, total: 100,
        minutes: Math.round((Date.now() - E.t0) / 6000) / 10, missed: E.X.map((p, i) => sc.res[i] === true ? null : label(E.X, i)).filter(Boolean).join(', '),
        detail: sc.res.map(x => x === true ? '1' : x === false ? '0' : '-').join(''), answers: (timeUp ? '[Хугацаа дууссан] ' : '') + E.X.map((p, i) => `${label(E.X, i)}) ${p.mc ? (E.ans[i] == null ? '—' : LETTER[E.ans[i]]) : (E.ans[i] || '—')}`).join('; ')});
      sent = true;
    }
    result(timeUp, sent);
  }
  function result(timeUp, sent){
    const X = E.X, sc = E.sc, weak = sc.strands.filter(s => s.max).sort((a, b) => a.got / a.max - b.got / b.max).slice(0, 3);
    const practice = s => { const miss = s.idx.filter(i => sc.res[i] !== true), p = X[miss[0] != null ? miss[0] : s.idx[0]]; return `${base()}#a-${p.g}-${p.t}-${Math.min(3, p.lvl)}${tag()}`; };
    const rows = sc.strands.filter(s => s.max).map(s => { const pc = Math.round(s.got / s.max * 100); return `<tr><td>${esc(s.name)}</td><td class="num">${s.got} / ${s.max}</td><td><div class="ex-sbar"><span style="width:${pc}%"></span></div></td><td class="num ${pc < 50 ? 'bad' : pc >= 80 ? 'ok' : ''}">${pc}%</td></tr>`; }).join('');
    const review = X.map((p, i) => sc.res[i] === true ? '' : `<li><b>${label(X, i)}.</b> ${Mx(p.q)}<div class="small">Таны хариу: ${p.mc ? (E.ans[i] == null ? '—' : LETTER[E.ans[i]]) : esc(E.ans[i] || '—')} · Зөв хариу: <b>${p.mc ? LETTER[p.ci] + ') ' + Mx(p.mc[p.ci]) : Mx(p.show)}</b></div>${p.sol && p.sol.length ? `<details class="sol"><summary>Бодолтыг харах</summary><div class="sol-body"><ol class="sol-s">${p.sol.map(x => `<li>${Mx(x)}</li>`).join('')}</ol></div></details>` : ''}</li>`).join('');
    shell().innerHTML = `<div class="ex-in"><div class="ex-top"><h2 id="exTitle">${timeUp ? 'Хугацаа дууслаа' : 'Сорилын дүн'}</h2><button class="btn ghost" type="button" data-exclose>Хаах</button></div>
      <div class="ex-score"><div><b>${sc.pts}</b><span>/ 100 оноо</span></div><div><b>${sc.p1}</b><span>/ 72 · 1-р хэсэг</span></div><div><b>${sc.p2}</b><span>/ 28 · 2-р хэсэг</span></div></div>
      <p class="small">${sent ? 'Дүн тань багшид илгээгдэж байна. ' : ''}Энэ оноо нь 100 онооны түүхий оноо. ЭЕШ-ийн 200–800 оноо тухайн жилийн бүх шалгуулагчийн дүнгээс хамаарч тооцогддог тул энд хөрвүүлэхгүй.</p>
      <h3>Агуулга бүрийн дүн</h3><div class="tbl-wrap"><table class="rtable ex-st"><thead><tr><th>Агуулга</th><th class="num">Оноо</th><th></th><th class="num">%</th></tr></thead><tbody>${rows}</tbody></table></div>
      <h3>Юуг давтах вэ</h3><ul class="ex-weak">${weak.map(s => `<li><span><b>${esc(s.name)}</b> · ${s.got}/${s.max} оноо</span><a class="btn" href="${practice(s)}" data-go>Дасан зохицох дасгал</a></li>`).join('')}</ul>
      ${review ? `<h3>Алдсан, хариулаагүй даалгавар</h3><ol class="ex-review">${review}</ol>` : '<p class="status ok">Бүх даалгаврыг зөв бодлоо. Гайхалтай!</p>'}
      <div class="row"><a class="btn" href="${base()}#e${tag()}" data-go>Шинэ сорил</a>${window.COACH ? `<a class="btn ghost" href="${COACH.homeURL(12)}" data-go>Миний сурах зам</a>` : ''}</div></div>`;
  }
  function close(){ clearInterval(E.tick); const el = document.getElementById('exam'); if(el) el.remove(); document.body.classList.remove('exam-open'); if(/^#e(-|@|$)/.test(location.hash)) history.replaceState(null, '', base()); }

  document.addEventListener('click', e => {
    if(!document.getElementById('exam')) return;
    if(e.target.closest('[data-exclose]')){ close(); return; }
    if(e.target.closest('#exStart')){ syncWho(); E.timed = document.getElementById('exTimed').checked; E.t0 = Date.now(); E.ans = {}; save(); run(); window.scrollTo(0, 0); document.getElementById('exam').scrollTo(0, 0); return; }
    if(e.target.closest('#exSubmit, #exSubmit2')){ submit(false); return; }
    const o = e.target.closest('[data-exi]'); if(o && !E.done){ const i = +o.dataset.exi, k = +o.dataset.k; E.ans[i] = E.ans[i] === k ? null : k; save();
      o.parentNode.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === E.ans[i]))); const nv = document.querySelector(`[data-exjump="${i}"]`); if(nv) nv.classList.toggle('on', E.ans[i] != null); counter(); return; }
    const j = e.target.closest('[data-exjump]'); if(j){ e.preventDefault(); const t = document.getElementById('exq' + j.dataset.exjump); if(t) t.scrollIntoView({block: 'center'}); }
  });
  document.addEventListener('input', e => { const i = e.target.dataset && e.target.dataset.exin; if(i == null || E.done) return; E.ans[+i] = e.target.value; save(); const nv = document.querySelector(`[data-exjump="${i}"]`); if(nv) nv.classList.toggle('on', e.target.value.trim() !== ''); counter(); });
  window.EXAM = {make, score, STR, item: i => E.X && E.X[i], label, open: (seed, fixed) => intro(seed, fixed)};

  /* Багш: ангид нэг ижил сорил өгөх холбоос */
  const sp = document.getElementById('sharePanel');
  if(sp && !S.student && !/^#(e|me|a)(-|@|$)/.test(location.hash)){
    const box = document.createElement('div'); box.className = 'daily-box';
    box.innerHTML = `<h3>ЭЕШ-ийн бүтэцтэй сорил</h3><p class="small" style="margin:0">36 сонгох + 4 задгай, 100 оноо, 100 минут. Холбоосоор бүх сурагч ижил сорил авч, дүн нь «Дүн» хэсэгт агуулга бүрээр гарна.</p>
      <button class="btn ghost wide" id="exCopy" type="button">Сорилын холбоос хуулах</button><div class="status" id="exStatus" hidden></div>`;
    sp.appendChild(box);
    document.getElementById('exCopy').addEventListener('click', async () => { const sd = 1000 + Math.floor(Math.random() * 98000), url = location.href.split('#')[0] + '#e-' + sd + tag(), ok = await copyText(url);
      shareSay('exStatus', ok ? `Сорилын холбоос (дугаар ${sd}) хуулагдлаа: ${url}` : 'Хуулж чадсангүй: ' + url, ok ? 'ok' : 'err'); });
  }
  const m = (location.hash || '').match(/^#e(?:-(\d{1,6}))?(?:@([A-Za-z0-9_-]{20,140}))?$/);
  if(m){
    if(m[2]){ linkSid = m[2]; try { localStorage.setItem('ws_sid', linkSid); } catch(e){} }
    else { try { const s = localStorage.getItem('ws_sid'); if(s && !linkSid) linkSid = s; } catch(e){} }
    try { const v = JSON.parse(localStorage.getItem('ws_student') || '{}'); if(!$('stName').value) $('stName').value = v.n || ''; if(!$('stClass').value) $('stClass').value = v.c || ''; } catch(e){}
    intro(m[1] ? +m[1] : 0, !!m[1]);
  }
})();
