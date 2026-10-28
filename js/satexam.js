/* SAT Math жишиг тест — Digital SAT-ийн Math хэсгийн бүтцээр (албан ёсны тест биш).
   2 модуль × 22 асуулт × 35 минут. Хэсэг: Algebra 15, Advanced Math 15, Problem-Solving & Data Analysis 7, Geometry & Trigonometry 7 (нийт 44).
   Модуль бүрт 6 нь хариугаа бичих (student-produced response), 16 нь 4 сонголттой; 2 нь оноонд тооцогдохгүй туршилтын асуулт (pretest).
   1-р модульд 20 тоологдох асуултаас 12+ зөв бол 2-р модуль хүнд, эс бол хялбар. Оноо (200–800) ойролцоо үнэлгээ.
   Холбоос: #st-54321 (ижил дугаар → ижил тест). Дүн «S-54321» кодоор багшид очно. */
(function(){
  if(typeof S === 'undefined' || !window.WS || !WS.SATGEN || !WS.H || !WS.H.addChoices) return;
  const G = WS.SATGEN, H = WS.H, MIN = 35, NQ = 22, ROUTE = 12;
  const DOMS = {alg: 'Algebra', adv: 'Advanced Math', psda: 'Problem-Solving & Data Analysis', geo: 'Geometry & Trigonometry'};
  const DOM_MN = {alg: 'Алгебр', adv: 'Ахисан математик', psda: 'Бодлого ба өгөгдөл', geo: 'Геометр ба тригонометр'};
  const COUNT = {1: {alg: 8, adv: 7, psda: 4, geo: 3}, 2: {alg: 7, adv: 8, psda: 3, geo: 4}};
  const DIFF = {m1: [7, 8, 7], hard: [3, 7, 12], easy: [10, 9, 3], paper: [6, 9, 7]};   // [хялбар, дунд, хүнд]
  const cache = {};
  /* Модуль үүсгэх: seed + хувилбар (m1 | hard | easy | paper) → 22 даалгавар */
  function module(seed, v){
    const key = seed + v; if(cache[key]) return cache[key];
    const salt = {m1: 11, hard: 23, easy: 37, paper: 53}[v], rng = H.mulberry32(seed * 2654435761 + salt * 7919), r = H.R(rng), crng = H.mulberry32(seed * 97 + salt * 131 + 5);
    const shuffle = a => { for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const cnt = COUNT[v === 'm1' ? 1 : 2], doms = shuffle(Object.keys(cnt).flatMap(d => Array(cnt[d]).fill(d)));
    const diffs = DIFF[v].flatMap((n, k) => Array(n).fill(k + 1));   // хялбараас хүнд рүү
    const items = [], seen = new Set();
    doms.forEach((d, i) => {
      let p = null;
      for(let t = 0; t < 30 && !p; t++){ const sk = r.pick(G.DOM[d]); r.forceB = diffs[i]; const q = G.S[sk](r, 11); r.forceB = 0; if(q && !seen.has(q.q)){ p = Object.assign(q, {skill: sk}); seen.add(q.q); } }
      if(p) items.push(Object.assign(p, {dom: d, diff: diffs[i]}));
    });
    const spr = new Set(shuffle(items.map((p, i) => i).filter(i => items[i].type === 'num')).slice(0, 6));
    const pre = new Set(shuffle(items.map((p, i) => i)).slice(0, 2));
    items.forEach((p, i) => { p.spr = spr.has(i); p.pre = pre.has(i); if(!p.spr) H.addChoices(p, crng);
      p.q = H.polish(p.q); p.show = H.polish(p.show); if(p.mc) p.mc = p.mc.map(H.polish); if(p.sol) p.sol = p.sol.map(H.polish); });
    return (cache[key] = items);
  }
  const route = c1 => c1 >= ROUTE ? 'hard' : 'easy';
  const isRight = (p, a) => a == null || a === '' ? null : p.mc ? a === p.ci : WS.check(p, a) === true;
  /* Ойролцоо оноо: 2-р модулийн хүндрэл ба нийт зөв (тоологдох 40-өөс) */
  function scaled(c1, c2, path){
    const raw = c1 + c2, s = path === 'hard' ? 330 + raw * 11.75 : 200 + raw * 10.5;
    const v = Math.max(200, Math.min(800, Math.round(s / 10) * 10));
    return {v, lo: Math.max(200, v - 30), hi: Math.min(800, v + 30)};
  }
  function grade(seed, path, a1, a2){
    const M1 = module(seed, 'm1'), M2 = module(seed, path);
    const r1 = M1.map((p, i) => isRight(p, a1[i])), r2 = M2.map((p, i) => isRight(p, a2[i]));
    const c1 = M1.filter((p, i) => !p.pre && r1[i] === true).length, c2 = M2.filter((p, i) => !p.pre && r2[i] === true).length;
    const all = [...M1.map((p, i) => [p, r1[i]]), ...M2.map((p, i) => [p, r2[i]])];
    const dom = Object.keys(DOMS).map(d => { const xs = all.filter(([p]) => p.dom === d); return {d, n: xs.length, ok: xs.filter(([, x]) => x === true).length}; });
    return {M1, M2, r1, r2, c1, c2, total: all.filter(([, x]) => x === true).length, sc: scaled(c1, c2, path), dom};
  }

  /* ---------- хадгалалт ---------- */
  const norm = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const who = () => [($('stName') || {}).value, ($('stClass') || {}).value].map(norm).join('|');
  const rj = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch(e){ return d; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const tag = () => (typeof linkTag === 'function' ? linkTag() : '');
  const base = () => location.pathname + location.search;

  /* ---------- Сурагчийн тест (Bluebook маягийн) ---------- */
  let X = null, tick = null;
  const save = () => wj('ws_satx', X);
  function shell(){
    let el = document.getElementById('satx');
    if(!el){ el = document.createElement('section'); el.id = 'satx'; el.className = 'exam satx'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'sxTitle'); el.setAttribute('lang', 'en'); document.body.appendChild(el); }
    document.body.classList.add('exam-open'); return el;
  }
  function close(){ clearInterval(tick); const el = document.getElementById('satx'); if(el) el.remove(); document.body.classList.remove('exam-open'); if(/^#st(-|@|$)/.test(location.hash)) history.replaceState(null, '', base()); }
  function intro(seed, fixed){
    const st = rj('ws_satx', null);
    if(st && st.stage !== 'done' && st.stage !== 'intro' && st.who === who() && (!fixed || st.seed === seed)){ X = st; resume(); return; }
    X = {seed: seed || 1000 + Math.floor(Math.random() * 98000), stage: 'intro', path: '', a1: {}, a2: {}, m1: {}, m2: {}, t1: 0, t2: 0, cur: 0, who: who(), fixed: !!fixed};
    const hist = (rj('ws_satxh', {})[who()] || []).slice(-5).reverse();
    shell().innerHTML = `<div class="ex-in" lang="mn"><div class="ex-top"><h2 id="sxTitle">SAT Math жишиг тест</h2><button class="btn ghost" type="button" data-sxclose>Хаах</button></div>
      <p>Digital SAT-ийн <b>Math</b> хэсгийн бүтэцтэй ижил жишиг тест. Асуултууд англи хэлээр, SAT-ийн хэлбэрээр шинээр зохиогдсон (албан ёсны асуулт биш).</p>
      <table class="rtable ex-struct"><thead><tr><th></th><th>Асуулт</th><th>Хугацаа</th></tr></thead><tbody>
        <tr><td>Module 1</td><td>22 (хялбар, дунд, хүнд холимог)</td><td>35 минут</td></tr>
        <tr><td>Module 2</td><td>22 (1-р модулийн дүнгээс хамаарч хүнд эсвэл хялбар)</td><td>35 минут</td></tr>
        <tr><td><b>Нийт</b></td><td><b>44</b></td><td><b>70 минут</b></td></tr></tbody></table>
      <ul class="sx-facts"><li>Хэсгүүд: Algebra 15, Advanced Math 15, Problem-Solving &amp; Data Analysis 7, Geometry &amp; Trigonometry 7.</li>
        <li>Ихэнх нь 4 сонголттой. Модуль бүрт 6 асуултын хариуг өөрөө бичнэ (бутархай 3/4, аравтын 0.75 болно).</li>
        <li>Жинхэнэ шалгалт шиг модуль бүрийн 2 асуулт оноонд тооцогдохгүй, аль нь болохыг мэдэгдэхгүй.</li>
        <li>Desmos тооны машин, томьёоны хуудас (Reference) ашиглаж болно. Буруу хариултад оноо хасахгүй тул бүх асуултад хариулна.</li>
        <li>Оноо (200–800) нь ойролцоо үнэлгээ. Албан ёсны тестийг Bluebook дээр өгнө.</li></ul>
      <div class="co-who"><label class="f">Нэр, овог<input id="sxName" maxlength="40" value="${esc($('stName').value)}" placeholder="Жишээ: Б. Сараа"></label><label class="f">Анги, бүлэг<input id="sxClass" maxlength="12" value="${esc($('stClass').value)}" placeholder="11а"></label></div>
      ${X.fixed ? `<p class="small">Багшийн өгсөн тест · дугаар ${X.seed}</p>` : ''}
      <button class="btn co-go" type="button" id="sxStart">Module 1 эхлэх</button>
      ${hist.length ? `<h3>Өмнөх тестүүд</h3><ul class="ex-hist">${hist.map(h => `<li><b>${h.v}</b> <small>${esc(h.d)} · ${h.ok}/44 зөв · Module 2: ${h.path === 'hard' ? 'хүнд' : 'хялбар'}</small></li>`).join('')}</ul>` : ''}</div>`;
  }
  const mod = () => X.stage === 'm1' ? module(X.seed, 'm1') : module(X.seed, X.path);
  const ans = () => X.stage === 'm1' ? X.a1 : X.a2, marks = () => X.stage === 'm1' ? X.m1 : X.m2;
  const left = () => { const t0 = X.stage === 'm1' ? X.t1 : X.t2; return Math.max(0, MIN * 60 - Math.floor((Date.now() - t0) / 1000)); };
  function resume(){ if(X.stage === 'm1' || X.stage === 'm2') run(); else if(X.stage === 'break') brk(); else if(X.stage === 'done') result(); }
  function run(){
    const items = mod(), i = Math.min(X.cur, items.length - 1), p = items[i], a = ans()[i], mk = !!marks()[i];
    const area = p.mc ? `<div class="p-mc sx-mc" role="group" aria-label="Answer choices">${p.mc.map((o, k) => `<button type="button" class="opt" data-sxk="${k}" aria-pressed="${a === k}"><b>${'ABCD'[k]}</b><span>${Mx(o)}</span></button>`).join('')}</div>`
      : `<div class="sx-spr"><label class="small" for="sxIn">Student-produced response · Хариугаа бичнэ</label><div class="p-inrow"><input id="sxIn" class="sx-ans" value="${esc(a || '')}" autocomplete="off" spellcheck="false" inputmode="decimal"></div><p class="small">Answer preview: <b id="sxPrev">${a ? prevTex(a) : '—'}</b></p></div>`;
    shell().innerHTML = `<div class="sx-run">
      <div class="sx-bar"><b id="sxTitle">Section 2: Math · Module ${X.stage === 'm1' ? 1 : 2}</b><span id="sxTime" class="ex-time" role="timer"></span>
        <span class="sx-tools"><a class="btn ghost" href="https://www.desmos.com/calculator" target="_blank" rel="noopener">Calculator</a><button class="btn ghost" type="button" data-sxref>Reference</button></span></div>
      <div class="sx-q"><div class="sx-qhead"><span class="sx-num">${i + 1}</span><button type="button" class="sx-mark${mk ? ' on' : ''}" data-sxmark aria-pressed="${mk}">${mk ? '★' : '☆'} Mark for Review</button><button type="button" class="linkbtn small" data-sxhelp lang="mn">Монгол тусламж</button></div>
        <div class="sx-help" hidden lang="mn"><p>${Mx(esc(p.mn || ''))}</p><p class="sat-gl">${(p.gl || []).map(([e, m]) => `<span><b lang="en">${esc(e)}</b> — ${esc(m)}</span>`).join('')}</p></div>
        <div class="p-q sx-text">${Mx(p.q)}</div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}${area}</div>
      <div class="sx-foot"><button class="btn ghost" type="button" data-sxnav="-1" ${i ? '' : 'disabled'}>Back</button>
        <button class="btn ghost sx-qbtn" type="button" data-sxgrid>Question ${i + 1} of ${items.length} ▾</button>
        ${i < items.length - 1 ? `<button class="btn" type="button" data-sxnav="1">Next</button>` : `<button class="btn" type="button" data-sxend>${X.stage === 'm1' ? 'Finish Module 1' : 'Finish Test'}</button>`}</div>
      <div class="sx-grid" id="sxGrid" hidden><p class="small" lang="mn">Хариулсан: ${Object.values(ans()).filter(v => v != null && v !== '').length} / ${items.length} · ★ тэмдэглэсэн</p><div>${items.map((q, k) => { const v = ans()[k]; return `<button type="button" data-sxgo="${k}" class="${v != null && v !== '' ? 'on' : ''}${k === i ? ' cur' : ''}${marks()[k] ? ' mk' : ''}">${k + 1}</button>`; }).join('')}</div>
        <button class="btn" type="button" data-sxend lang="mn">${X.stage === 'm1' ? '1-р модулийг дуусгах' : 'Тестийг дуусгах'}</button></div>
      <div class="sx-ref" id="sxRef" hidden>${REF}</div></div>`;
    clearInterval(tick); tick = setInterval(tickT, 1000); tickT();
  }
  const prevTex = v => { try { const t = String(v).trim().replace(/−/g, '-').replace(/√(\d+(?:\.\d+)?)/g, '\\sqrt{$1}').replace(/^(-?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/, '$1\\frac{$2}{$3}'); return window.katex ? katex.renderToString(t, {throwOnError: false}) : esc(v); } catch(e){ return esc(v); } };
  const REF = `<h3>Reference</h3><ul><li>Circle: A = πr², C = 2πr</li><li>Rectangle: A = ℓw · Triangle: A = ½bh</li><li>Pythagorean theorem: c² = a² + b²</li><li>Special right triangles: 30°-60°-90° → x, x√3, 2x · 45°-45°-90° → s, s, s√2</li><li>Rectangular prism: V = ℓwh · Cylinder: V = πr²h</li><li>Sphere: V = (4/3)πr³ · Cone: V = (1/3)πr²h · Pyramid: V = (1/3)ℓwh</li><li>The number of degrees of arc in a circle is 360. The number of radians of arc in a circle is 2π. The sum of the measures of the angles of a triangle is 180°.</li></ul><button class="btn ghost" type="button" data-sxref>Close</button>`;
  function tickT(){ const el = document.getElementById('sxTime'); if(!el){ clearInterval(tick); return; } const s = left(); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('low', s < 300); if(s <= 0) endModule(true); }
  function endModule(timeUp){
    clearInterval(tick);
    if(X.stage === 'm1'){ const M1 = module(X.seed, 'm1'), c1 = M1.filter((p, i) => !p.pre && isRight(p, X.a1[i]) === true).length; X.path = route(c1); X.stage = 'break'; X.cur = 0; save(); brk(timeUp); return; }
    X.stage = 'done'; save(); finish(timeUp);
  }
  function brk(timeUp){
    shell().innerHTML = `<div class="ex-in" lang="mn"><h2 id="sxTitle">${timeUp ? 'Module 1-ийн хугацаа дууслаа' : 'Module 1 дууслаа'}</h2>
      <p>Жинхэнэ шалгалт шиг 1-р модулийн хариултыг өөрчлөх боломжгүй. Module 2-т 22 асуулт, 35 минут байна. Бэлэн болмогц эхлүүлнэ үү.</p>
      <button class="btn co-go" type="button" id="sxStart2">Module 2 эхлэх</button></div>`;
  }
  function finish(timeUp){
    const g = grade(X.seed, X.path, X.a1, X.a2), d = new Date(), ds = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const H2 = rj('ws_satxh', {}), h = H2[who()] || []; h.push({seed: X.seed, v: g.sc.v, ok: g.total, path: X.path, d: ds}); H2[who()] = h.slice(-30); wj('ws_satxh', H2);
    const name = $('stName').value.trim();
    if(name && typeof window.queueResult === 'function' && window.resultsURL && resultsURL()){
      const lab = (p, a) => p.mc ? (a == null ? '—' : 'ABCD'[a]) : (a || '—');
      window.queueResult({code: 'S-' + X.seed, grade: 11, topic: 'SAT Math жишиг тест', level: 'SAT', form: '2 модуль × 22', name, group: $('stClass').value.trim(), score: g.sc.v, total: 800,
        minutes: Math.round(((X.t2 ? Date.now() - X.t2 : 0) + Math.min(Date.now() - X.t1, MIN * 60000)) / 6000) / 10,
        missed: [...g.r1.map((x, i) => x === true ? null : 'M1-' + (i + 1)), ...g.r2.map((x, i) => x === true ? null : 'M2-' + (i + 1))].filter(Boolean).join(', '),
        detail: [...g.r1, ...g.r2].map(x => x === true ? '1' : x === false ? '0' : '-').join(''),
        answers: `[Module 2: ${X.path === 'hard' ? 'хүнд' : 'хялбар'}] [Зөв: ${g.total}/44] ` + g.M1.map((p, i) => `M1-${i + 1}) ${lab(p, X.a1[i])}`).concat(g.M2.map((p, i) => `M2-${i + 1}) ${lab(p, X.a2[i])}`)).join('; ')});
      X.sent = true; save();
    }
    result(timeUp);
  }
  function result(timeUp){
    const g = grade(X.seed, X.path, X.a1, X.a2), weak = g.dom.slice().sort((a, b) => a.ok / a.n - b.ok / b.n);
    const practice = d => { const miss = [...g.M1.map((p, i) => [p, g.r1[i]]), ...g.M2.map((p, i) => [p, g.r2[i]])].filter(([p, x]) => p.dom === d && x !== true).map(([p]) => p.skill);
      const sk = miss[0] || G.DOM[d][0], ids = Object.keys(G.MAP).filter(id => G.MAP[id] === sk);
      let t = null; for(const gr of [11, 10, 12, 9, 8]){ const k = W.topicsOf(gr).findIndex(x => ids.includes(x.id)); if(k >= 0){ t = {g: gr, t: k + 1}; break; } }
      return t ? `${base()}#s-${t.g}-${t.t}-5-4+2-${1000 + Math.floor(Math.random() * 98000)}${tag()}` : null; };
    const review = (M, R, A, m) => M.map((p, i) => R[i] === true ? '' : `<li><b>Module ${m}, Q${i + 1}</b> <span class="small">${DOMS[p.dom]}</span><div class="sx-rq">${Mx(p.q)}</div>
      <div class="small">Таны хариу: ${p.mc ? (A[i] == null ? '—' : 'ABCD'[A[i]]) : esc(A[i] || '—')} · Зөв хариу: <b>${p.mc ? 'ABCD'[p.ci] + ') ' + Mx(p.mc[p.ci]) : Mx(p.show)}</b></div>
      <details class="sol"><summary>Монгол тайлбар, бодолт</summary><div class="sol-body"><p>${Mx(esc(p.mn || ''))}</p>${p.sol && p.sol.length ? `<ol class="sol-s">${p.sol.map(x => `<li>${Mx(x)}</li>`).join('')}</ol>` : ''}</div></details></li>`).join('');
    shell().innerHTML = `<div class="ex-in" lang="mn"><div class="ex-top"><h2 id="sxTitle">${timeUp ? 'Хугацаа дууслаа' : 'SAT Math жишиг тестийн дүн'}</h2><button class="btn ghost" type="button" data-sxclose>Хаах</button></div>
      <div class="ex-score"><div><b>${g.sc.lo}–${g.sc.hi}</b><span>ойролцоо Math оноо (200–800)</span></div><div><b>${g.total}</b><span>/ 44 зөв</span></div><div><b>${X.path === 'hard' ? 'Хүнд' : 'Хялбар'}</b><span>Module 2 (1-р модульд ${g.c1}/20 тоологдох зөв)</span></div></div>
      <p class="small">Оноо нь албан ёсны биш: жинхэнэ SAT асуулт бүрийн статистик жингээр тооцдог. Энэ тест нь бүтэц, хурд, сул талаа мэдэхэд зориулагдсан. ${X.path === 'easy' ? 'Хүнд 2-р модульд орохын тулд 1-р модульд илүү нарийн ажиллаарай — өндөр оноо түүнээс эхэлнэ.' : 'Хүнд 2-р модульд орсон нь өндөр оноо авах нөхцөл. Сайн байна!'}</p>
      <h3>Хэсэг бүрийн дүн</h3><div class="tbl-wrap"><table class="rtable ex-st"><thead><tr><th>Domain</th><th class="num">Зөв</th><th></th><th class="num">%</th></tr></thead><tbody>${g.dom.map(x => { const pc = Math.round(x.ok / x.n * 100); return `<tr><td>${DOMS[x.d]} <span class="small">(${DOM_MN[x.d]})</span></td><td class="num">${x.ok} / ${x.n}</td><td><div class="ex-sbar"><span style="width:${pc}%"></span></div></td><td class="num ${pc < 50 ? 'bad' : pc >= 80 ? 'ok' : ''}">${pc}%</td></tr>`; }).join('')}</tbody></table></div>
      <h3>Юуг давтах вэ</h3><ul class="ex-weak">${weak.slice(0, 2).map(x => { const u = practice(x.d); return `<li><span><b>${DOMS[x.d]}</b> · ${x.ok}/${x.n}</span>${u ? `<a class="btn" href="${u}" data-go>SAT шатны дасгал</a>` : ''}</li>`; }).join('')}</ul>
      ${review(g.M1, g.r1, X.a1, 1) + review(g.M2, g.r2, X.a2, 2) ? `<h3>Алдсан, хариулаагүй асуултууд</h3><ol class="ex-review">${review(g.M1, g.r1, X.a1, 1)}${review(g.M2, g.r2, X.a2, 2)}</ol>` : '<p class="status ok">Бүх асуултыг зөв бодлоо!</p>'}
      <div class="row"><a class="btn" href="${base()}#st${tag()}" data-go>Шинэ тест</a>${window.SAT && SAT.site && SAT.site() ? `<a class="btn ghost" href="${esc(SAT.site())}" target="_blank" rel="noopener">Оноо1600 ↗</a>` : ''}</div></div>`;
  }
  function syncWho(){ const n = document.getElementById('sxName'), c = document.getElementById('sxClass'); if(!n) return; $('stName').value = n.value; $('stClass').value = c.value; X.who = who(); try { localStorage.setItem('ws_student', JSON.stringify({n: n.value, c: c.value})); } catch(e){} }
  document.addEventListener('click', e => {
    if(!document.getElementById('satx') || !X) return;
    const t = e.target;
    if(t.closest('[data-sxclose]')){ close(); return; }
    if(t.closest('#sxStart')){ syncWho(); X.stage = 'm1'; X.t1 = Date.now(); X.cur = 0; save(); run(); return; }
    if(t.closest('#sxStart2')){ X.stage = 'm2'; X.t2 = Date.now(); X.cur = 0; save(); run(); return; }
    if(X.stage !== 'm1' && X.stage !== 'm2') return;
    const k = t.closest('[data-sxk]'); if(k){ const v = +k.dataset.sxk; ans()[X.cur] = ans()[X.cur] === v ? null : v; save(); k.parentNode.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.sxk === ans()[X.cur]))); return; }
    const nv = t.closest('[data-sxnav]'); if(nv){ X.cur = Math.max(0, Math.min(NQ - 1, X.cur + +nv.dataset.sxnav)); save(); run(); return; }
    const go = t.closest('[data-sxgo]'); if(go){ X.cur = +go.dataset.sxgo; save(); run(); return; }
    if(t.closest('[data-sxgrid]')){ const g = document.getElementById('sxGrid'); g.hidden = !g.hidden; return; }
    if(t.closest('[data-sxref]')){ const r = document.getElementById('sxRef'); r.hidden = !r.hidden; return; }
    if(t.closest('[data-sxhelp]')){ const h = document.querySelector('.sx-help'); h.hidden = !h.hidden; return; }
    if(t.closest('[data-sxmark]')){ marks()[X.cur] = !marks()[X.cur]; save(); run(); return; }
    if(t.closest('[data-sxend]')){ const blank = mod().filter((p, i) => ans()[i] == null || ans()[i] === '').length; if(blank && !confirm(`${blank} асуултад хариулаагүй байна. ${X.stage === 'm1' ? '1-р модулийг' : 'Тестийг'} дуусгах уу?`)) return; endModule(false); }
  });
  document.addEventListener('input', e => { if(e.target.id !== 'sxIn' || !X) return; ans()[X.cur] = e.target.value; save(); const pv = document.getElementById('sxPrev'); if(pv) pv.innerHTML = e.target.value.trim() ? prevTex(e.target.value) : '—'; });
  document.addEventListener('keydown', e => { if(e.target.id === 'sxIn' && e.key === 'Enter'){ e.preventDefault(); const n = document.querySelector('[data-sxnav="1"]'); if(n) n.click(); } });
  window.SATX = {module, grade, scaled, route, DOMS, item: i => X && mod()[i], get cur(){ return X ? X.cur : 0; }, open: (seed, fixed) => intro(seed, fixed)};

  /* ---------- Багш: «Анги» хэсэгт ЭЕШ-ийн ард «SAT» ---------- */
  if(!S.student && typeof window.controls === 'function' && typeof window.render === 'function'){
    const T = {on: false, seed: 0, key: false, v: 'paper'};
    try { const v = JSON.parse(localStorage.getItem('ws_satm') || '{}'); T.on = !!v.on && !/^#(w|s|sr|d|e|st|me|a)-/.test(location.hash); T.seed = +v.seed || 0; T.key = !!v.key; } catch(e){}
    if(!T.seed) T.seed = 1000 + Math.floor(Math.random() * 98000);
    const keep = () => { try { localStorage.setItem('ws_satm', JSON.stringify({on: T.on, seed: T.seed, key: T.key})); } catch(e){} };
    const link = () => location.href.split('#')[0] + '#st-' + T.seed + tag();
    const c0 = window.controls;
    window.controls = function(){ const r = c0.apply(this, arguments), g = document.getElementById('grades');
      if(g){ if(T.on) g.querySelectorAll('[data-g], [data-esh]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        if(!g.querySelector('[data-satm]')) g.insertAdjacentHTML('beforeend', `<button class="chip chip-esh chip-sat" type="button" data-satm aria-pressed="${T.on}" title="SAT Math жишиг тест (2 модуль × 22 асуулт)">SAT</button>`); }
      return r; };
    const r0 = window.render;
    window.render = function(){
      const out = r0.apply(this, arguments), on = T.on && S.mode !== 'results' && S.mode !== 'sat';
      document.body.classList.toggle('satm-mode', on);
      if(on){ document.body.classList.remove('esh-mode'); $('sheet').innerHTML = paperHTML(); $('score').hidden = true; panel(); }
      return out;
    };
    function panel(){
      let p = document.getElementById('satmPanel');
      if(!p){ p = document.createElement('section'); p.className = 'panel'; p.id = 'satmPanel'; const first = document.querySelector('aside .panel'); first.parentNode.insertBefore(p, first.nextSibling); }
      p.innerHTML = `<h2>SAT Math жишиг тест</h2>
        <p class="small" style="margin:0">Digital SAT-ийн Math хэсгийн бүтэц: 2 модуль × 22 асуулт × 35 минут. Algebra 15, Advanced Math 15, Problem-Solving &amp; Data Analysis 7, Geometry &amp; Trigonometry 7. 2-р модуль 1-р модулийн дүнгээр хүнд эсвэл хялбар болно. Англи хэлээр, монгол тусламжтай.</p>
        <div class="row small">Тестийн дугаар: <span class="code">S-${T.seed}</span></div>
        <button class="btn ghost wide" type="button" id="satmNew">Шинэ хувилбар үүсгэх</button>
        <label class="f" for="satmLink">Сурагчийн холбоос (цахимаар, дасан зохицох)<input type="text" id="satmLink" readonly value="${esc(link())}"></label>
        <button class="btn wide" type="button" id="satmCopy">Холбоос хуулах</button>
        <div class="qr" id="satmQr" role="img" aria-label="Тестийн холбоосын QR код"></div>
        <button class="btn ghost wide" type="button" data-satmtry>Сурагчийн харагдацаар туршиж үзэх</button>
        <label class="check"><input type="checkbox" id="satmKey"${T.key ? ' checked' : ''}> Хариултын түлхүүр харуулах</label>
        <button class="btn ghost wide" type="button" id="satmPdf">PDF татаж хэвлэх</button>
        <div class="status" id="satmStatus" hidden></div>
        <p class="small" style="margin:0">Цаасан хувилбар дасан зохицохгүй: Module 1 ба дунд хүндрэлтэй Module 2. Цахимаар өгвөл жинхэнэ шалгалт шиг 2-р модуль автоматаар сонгогдоно.</p>`;
      if(window.qrcode){ try { const q = qrcode(0, 'M'); q.addData(link()); q.make(); document.getElementById('satmQr').innerHTML = q.createSvgTag({cellSize: 4, margin: 2, scalable: true}); } catch(e){} }
    }
    const say = (t, c) => { const st = document.getElementById('satmStatus'); if(!st) return; st.hidden = false; st.className = 'status ' + (c || ''); st.textContent = t; };
    function paperHTML(only){
      const school = (($('school') || {}).value || '').trim();
      const part = (M, m) => `<li class="p-sec">Module ${m}<small>22 questions · 35 minutes${m === 2 ? ' · paper version (medium)' : ''}</small></li>` + M.map((p, i) => `<li class="ws-item${p.mc ? ' mc' : ''}"><span class="p-n">${i + 1}.</span><div class="p-q">${Mx(p.q)}</div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}
        ${p.mc ? `<div class="p-opts${p.mc.some(o => o.replace(/<[^>]+>/g, '').length > 9) ? ' long' : ''}">${p.mc.map((o, k) => `<span><b>${'ABCD'[k]}</b><span class="ov">${Mx(o)}</span></span>`).join('')}</div>` : '<div class="p-ans">Answer:<i></i></div>'}</li>`).join('');
      const M1 = module(T.seed, 'm1'), M2 = module(T.seed, 'paper');
      const key = `<section class="paper key"><h3>Answer key · S-${T.seed}</h3><ol class="key-list">${[...M1.map((p, i) => ['M1-' + (i + 1), p]), ...M2.map((p, i) => ['M2-' + (i + 1), p])].map(([l, p]) => `<li><span>${l}.</span>${p.mc ? `<b style="font-family:var(--sans)">${'ABCD'[p.ci]}</b>&nbsp;<span class="ov">${Mx(p.mc[p.ci])}</span>` : `<span class="ov">${Mx(p.show)}</span>`}</li>`).join('')}</ol></section>`;
      if(only === 'key') return key;
      return `<article class="paper esh-paper" lang="en"><div class="p-head"><div class="p-school">${esc(school || 'Математикийн ажлын хуудас')}</div><div class="p-grade">SAT Math · practice</div>
        <h2 class="p-topic">SAT Math Practice Test</h2><div class="p-meta">2 modules · 44 questions · 70 minutes · Test S-${T.seed} · Not an official SAT</div>
        <div class="p-fields"><span>Name:<i></i></span><span>Class:<i></i></span><span>Date:<i></i></span><span>Correct:<i></i>/44</span></div></div>
        <p class="p-instr"><b>Directions.</b> For multiple-choice questions, circle the letter of the best answer. For student-produced responses, write your answer on the line. You may use a calculator. <span lang="mn">(Сонгох асуултад зөв үсгийг дугуйлна, бусдад хариугаа зураасан дээр бичнэ. Тооны машин ашиглаж болно.)</span></p>
        <ol class="p-items">${part(M1, 1)}${part(M2, 2)}</ol><div class="p-foot"><span>${esc(school)}</span><span>S-${T.seed}</span></div></article>${T.key && only !== 'paper' ? '<div class="paper-key">' + key + '</div>' : ''}`;
    }
    async function pdf(){
      if(!window.html2pdf){ say('PDF бэлтгэх хэрэгсэл ачаалагдаагүй байна. Хуудсыг дахин ачаалаад оролдоно уу.', 'err'); return; }
      const btn = document.getElementById('satmPdf'), box = document.getElementById('exportBox'), sx = window.scrollX, sy = window.scrollY; btn.disabled = true; say('PDF бэлтгэж байна…');
      try {
        box.innerHTML = paperHTML('paper') + (T.key ? '<div class="html2pdf__page-break"></div>' + paperHTML('key') : '');
        if(document.fonts && document.fonts.ready) await document.fonts.ready; window.scrollTo(0, 0); if(typeof fixSvgForCanvas === 'function') fixSvgForCanvas(box);
        const name = `sat-math-S-${T.seed}.pdf`;
        const blob = await window.html2pdf().set({margin: [12, 12, 14, 12], filename: name, image: {type: 'jpeg', quality: 0.96}, html2canvas: {scale: 2, backgroundColor: '#FFFFFF', useCORS: true, scrollX: 0, scrollY: 0}, jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}, pagebreak: {mode: ['css', 'legacy'], avoid: ['.ws-item', '.key-list li']}}).from(box).outputPdf('blob');
        if(typeof downloads !== 'undefined' && downloads) await downloads.save({filename: name, data: blob});
        else { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
        say('PDF бэлэн боллоо.', 'ok');
      } catch(e){ say('PDF үүсгэж чадсангүй. Дахин оролдоно уу.', 'err'); }
      finally { btn.disabled = false; box.innerHTML = ''; window.scrollTo(sx, sy); }
    }
    document.addEventListener('click', e => { if(e.target.closest('[data-g], [data-esh]') && T.on){ T.on = false; keep(); document.body.classList.remove('satm-mode'); } }, true);
    document.addEventListener('click', async e => {
      if(e.target.closest('[data-satm]')){ T.on = true; keep(); if(S.mode === 'results' || S.mode === 'sat') S.mode = 'online'; if(location.hash === '#sat') history.replaceState(null, '', base()); render(); window.scrollTo(0, 0); return; }
      if(!T.on) return;
      if(e.target.closest('#satmNew')){ T.seed = 1000 + Math.floor(Math.random() * 98000); keep(); render(); return; }
      if(e.target.closest('#satmCopy')){ const ok = await copyText(link()); say(ok ? 'Тестийн холбоос хуулагдлаа.' : 'Хуулж чадсангүй: ' + link(), ok ? 'ok' : 'err'); return; }
      if(e.target.closest('[data-satmtry]')){ intro(T.seed, true); return; }
      if(e.target.closest('#satmPdf')) pdf();
    });
    document.addEventListener('change', e => { if(e.target.id === 'satmKey'){ T.key = e.target.checked; keep(); render(); } });
    document.addEventListener('focusin', e => { if(e.target.id === 'satmLink') e.target.select(); });
    window.SATX.teacher = T;
    if(T.on) render(); else controls();
  }
  const m = (location.hash || '').match(/^#st(?:-(\d{1,6}))?(?:@([A-Za-z0-9_-]{20,140}))?$/);
  if(m){
    if(m[2]){ linkSid = m[2]; try { localStorage.setItem('ws_sid', linkSid); } catch(e){} } else { try { const s = localStorage.getItem('ws_sid'); if(s && !linkSid) linkSid = s; } catch(e){} }
    try { const v = JSON.parse(localStorage.getItem('ws_student') || '{}'); if(!$('stName').value) $('stName').value = v.n || ''; if(!$('stClass').value) $('stClass').value = v.c || ''; } catch(e){}
    intro(m[1] ? +m[1] : 0, !!m[1]);
  }
})();
