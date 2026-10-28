/* Хурдан тооцоо: 60 секундэд аль болох олон богино жишээ бодох дасгал.
   Холбоос: #q-9 (анги). Мөн «Миний ахиц» цонх болон багшийн «Сурагчдад өгөх» хэсгээс нээнэ.
   Дээд амжилтыг сурагчийн төхөөрөмж дээр (нэр, бүлгээр) хадгална. */
(function(){
  if(typeof S === 'undefined') return;
  const SEC = 60;
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const neg = n => n < 0 ? '(−' + (-n) + ')' : String(n);
  const SUP = {2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', 10: '¹⁰'};
  const T = {
    mul: () => { const a = R(3, 12), b = R(3, 12); return [`${a} · ${b}`, a * b]; },
    add: () => { const a = R(14, 89), b = R(12, 99 - (a % 10)); return [`${a} + ${b}`, a + b]; },
    sub: () => { const a = R(40, 99), b = R(12, a - 5); return [`${a} − ${b}`, a - b]; },
    div: () => { const b = R(3, 12), q = R(3, 12); return [`${b * q} : ${b}`, q]; },
    dec: () => { const a = R(1, 9), b = R(1, 9); return pick([[`0.${a} + 0.${b}`, (a + b) / 10], [`${a} · 0.${b}`, a * b / 10]]); },
    frac: () => { const d = pick([2, 3, 4, 5, 10]), n = d * R(2, 12); return [`1/${d} · ${n}`, n / d]; },
    int: () => { const a = R(-15, 15) || 7, b = (a > 0 ? -1 : 1) * R(2, 15); return pick([[`${neg(a)} + ${neg(b)}`, a + b], [`${neg(a)} − ${neg(b)}`, a - b]]); },
    imul: () => { const sg = () => Math.random() < .5 ? -1 : 1, a = sg() * R(2, 9), b = (a > 0 ? -1 : sg()) * R(2, 9); return [`${neg(a)} · ${neg(b)}`, a * b]; },
    pow: () => { const [b, e] = pick([[2, R(2, 8)], [3, R(2, 4)], [5, R(2, 3)], [10, R(2, 5)], [-2, R(2, 5)], [4, 3]]); return [`${neg(b)}${SUP[e]}`, Math.pow(b, e)]; },
    sq: () => { const a = R(11, 20); return [`${a}²`, a * a]; },
    root: () => { const a = R(2, 20); return [`√${a * a}`, a]; },
    lin: () => { const a = R(2, 9), x = R(-9, 9) || 4, b = R(1, 20) * (Math.random() < .5 ? -1 : 1); const c = a * x + b; return [`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}. x = ?`, x]; },
    sqd: () => { const a = R(6, 15), b = R(1, a - 1); return [`${a}² − ${b}²`, a * a - b * b]; },
    log: () => { const [b, e] = pick([[2, R(1, 7)], [3, R(1, 4)], [10, R(1, 4)], [5, R(1, 3)]]); return [`log${b === 10 ? '' : '_' + b} ${Math.pow(b, e)}`.replace('log_2', 'log₂').replace('log_3', 'log₃').replace('log_5', 'log₅').replace(/^log (\d)/, 'lg $1'), e]; },
    trig: () => pick([['sin 30°', .5], ['cos 60°', .5], ['tg 45°', 1], ['sin 90°', 1], ['cos 0°', 1], ['sin 0°', 0], ['cos 90°', 0]])
  };
  const MIX = {6: ['mul', 'mul', 'add', 'sub', 'div', 'div', 'dec', 'frac'], 7: ['int', 'int', 'imul', 'pow', 'mul', 'div', 'frac'], 8: ['sq', 'root', 'imul', 'int', 'pow', 'sqd', 'div'],
    9: ['lin', 'lin', 'sq', 'root', 'sqd', 'imul', 'pow'], 10: ['lin', 'sqd', 'pow', 'root', 'log', 'trig'], 11: ['log', 'log', 'pow', 'trig', 'lin', 'sqd'], 12: ['log', 'trig', 'pow', 'lin', 'sqd', 'root']};
  const gen = g => { let p; do { p = T[pick(MIX[g] || MIX[9])](); } while(D.last === p[0]); D.last = p[0]; return {q: p[0], a: Math.round(p[1] * 1000) / 1000}; };
  const parse = s => { const t = String(s).trim().replace(/[−–—]/g, '-').replace(',', '.').replace(/\s+/g, ''); if(!/^-?\d+(\.\d+)?$/.test(t) && !/^-?\d+\/\d+$/.test(t)) return NaN; if(t.includes('/')){ const [a, b] = t.split('/').map(Number); return b ? a / b : NaN; } return Number(t); };

  /* ---------- хадгалалт ---------- */
  const norm = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const who = () => [($('stName') || {}).value, ($('stClass') || {}).value].map(norm).join('|');
  const rj = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch(e){ return {}; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const bestOf = g => (rj('ws_drill')[who() + '|' + g] || {}).best || 0;
  function saveRun(g, n){
    const all = rj('ws_drill'), k = who() + '|' + g, e = all[k] || {best: 0, runs: 0}, rec = n > e.best && e.runs > 0;
    all[k] = {best: Math.max(e.best, n), runs: e.runs + 1, last: n}; wj('ws_drill', all);
    const pf = rj('ws_prof'), p = pf[who()] || {}; p.drill = Math.max(p.drill || 0, n); pf[who()] = p; wj('ws_prof', pf);
    return rec;
  }

  /* ---------- дэлгэц ---------- */
  const D = {g: 9, on: false, n: 0, miss: [], cur: null, t0: 0, tick: null, last: ''};
  const ui = () => document.getElementById('drill');
  const mx = s => (window.Mx ? Mx(esc(s)) : esc(s));
  function shell(){
    let el = ui();
    if(!el){ el = document.createElement('section'); el.id = 'drill'; el.className = 'drill'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'drTitle'); document.body.appendChild(el); }
    return el;
  }
  function startScreen(){
    const b = bestOf(D.g), name = (($('stName') || {}).value || '').trim();
    shell().innerHTML = `<div class="dr-in"><div class="dr-top"><h2 id="drTitle">Хурдан тооцоо</h2><button class="btn ghost" type="button" data-drclose>Хаах</button></div>
      <p class="dr-lead">${SEC} секундэд аль болох олон жишээг цээжээр бод. Хариугаа бичээд Enter дар. Алдвал зөв хариуг харуулаад дараагийн жишээ гарна.</p>
      <div class="dr-grades" role="group" aria-label="Анги">${W.GRADES.map(g => `<button type="button" class="chip${g === D.g ? ' on' : ''}" data-drg="${g}" aria-pressed="${g === D.g}">${g}-р анги</button>`).join('')}</div>
      <p class="dr-best">${b ? `${name ? esc(name) + ', таны' : 'Таны'} дээд амжилт: <b>${b}</b> зөв` : 'Анхны оролдлого. Амжилт хүсье!'}</p>
      <button class="btn dr-go" type="button" id="drStart">Эхлэх</button></div>`;
    setTimeout(() => { const s = document.getElementById('drStart'); if(s) s.focus(); }, 30);
  }
  function runScreen(){
    shell().innerHTML = `<div class="dr-in run"><div class="dr-top"><span class="dr-time" id="drTime">${SEC}</span><span class="dr-score"><b id="drN">0</b> зөв</span><button class="btn ghost" type="button" data-drclose>Зогсоох</button></div>
      <div class="dr-bar"><span id="drBar"></span></div>
      <div class="dr-q" id="drQ" aria-live="polite"></div>
      <form class="dr-form" id="drForm" autocomplete="off"><button class="dr-pm" type="button" id="drPm" aria-label="Хасах тэмдэг">±</button><input id="drA" inputmode="decimal" enterkeyhint="go" aria-label="Хариу" spellcheck="false"><button class="btn" type="submit">OK</button></form>
      <div class="dr-fb" id="drFb" aria-live="assertive"></div></div>`;
  }
  function next(){ D.cur = gen(D.g); const q = document.getElementById('drQ'); if(q) q.innerHTML = mx(D.cur.q); const a = document.getElementById('drA'); if(a){ a.value = ''; a.focus(); } }
  function start(){
    D.on = true; D.n = 0; D.miss = []; D.t0 = Date.now(); runScreen(); next();
    clearInterval(D.tick); D.tick = setInterval(() => {
      const left = Math.max(0, SEC - (Date.now() - D.t0) / 1000), t = document.getElementById('drTime'), bar = document.getElementById('drBar');
      if(t) t.textContent = Math.ceil(left); if(bar) bar.style.width = (left / SEC * 100) + '%';
      if(left <= 0) finish();
    }, 100);
  }
  function answer(){
    if(!D.on) return; const a = document.getElementById('drA'), v = parse(a.value); if(a.value.trim() === '') return;
    const fb = document.getElementById('drFb');
    if(Math.abs(v - D.cur.a) < 1e-6){ D.n++; document.getElementById('drN').textContent = D.n; fb.className = 'dr-fb ok'; fb.textContent = 'Зөв!'; next(); }
    else { D.miss.push({q: D.cur.q, a: D.cur.a, you: a.value.trim()}); fb.className = 'dr-fb bad'; fb.innerHTML = `${mx(D.cur.q)} = <b>${mx(String(D.cur.a).replace("-", "−"))}</b>`; next(); }
  }
  function finish(){
    if(!D.on) return; D.on = false; clearInterval(D.tick);
    const prev = bestOf(D.g), rec = saveRun(D.g, D.n), b = Math.max(prev, D.n);
    const msg = rec ? `Шинэ дээд амжилт! Өмнөх амжилт: ${prev}, одоо: ${D.n}.` : !prev ? 'Сайн эхлэл. Дахин оролдож амжилтаа ахиулаарай.' : D.n === prev ? 'Дээд амжилтаа давтлаа!' : `Дээд амжилт: ${b}. Дахиад нэг оролдвол хүрнэ!`;
    shell().innerHTML = `<div class="dr-in"><div class="dr-top"><h2 id="drTitle">Хугацаа дууслаа</h2><button class="btn ghost" type="button" data-drclose>Хаах</button></div>
      <div class="dr-res"><b>${D.n}</b><span>зөв жишээ ${SEC} секундэд</span></div>
      <p class="dr-best${rec ? ' rec' : ''}">${msg}</p>
      ${D.miss.length ? `<h3>Алдсан жишээ</h3><ul class="dr-miss">${D.miss.slice(0, 12).map(m => `<li>${mx(m.q)} = <b>${mx(String(m.a).replace("-", "−"))}</b> <small>(та: ${esc(m.you)})</small></li>`).join('')}</ul>` : ''}
      <div class="row"><button class="btn dr-go" type="button" id="drStart">Дахин эхлэх</button></div></div>`;
    if(rec && window.matchMedia && !matchMedia('(prefers-reduced-motion: reduce)').matches){ const r = ui().querySelector('.dr-res'); if(r) r.classList.add('pop'); }
    setTimeout(() => { const s = document.getElementById('drStart'); if(s) s.focus(); }, 30);
  }
  function open(g){ D.g = W.GRADES.includes(+g) ? +g : (S.grade || 9); document.body.classList.add('drill-open'); startScreen(); }
  function close(){
    D.on = false; clearInterval(D.tick); const el = ui(); if(el) el.remove(); document.body.classList.remove('drill-open');
    if(/^#q-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  window.DRILL = {open, close, finish, gen: g => { D.g = g; return gen(g); }, parse, get cur(){ return D.cur; }};

  document.addEventListener('click', e => {
    if(e.target.closest('[data-drclose]')){ if(D.on && D.n + D.miss.length > 0) finish(); else close(); return; }
    if(e.target.closest('#drStart')){ start(); return; }
    if(e.target.closest('#drPm')){ const a = document.getElementById('drA'); a.value = a.value.startsWith('-') ? a.value.slice(1) : '-' + a.value; a.focus(); return; }
    const gb = e.target.closest('[data-drg]'); if(gb){ D.g = +gb.dataset.drg; startScreen(); return; }
    const op = e.target.closest('[data-drill]'); if(op){ const d = document.getElementById('progDlg'); if(d && d.open) d.close(); open(op.dataset.drill || S.grade); }
  });
  document.addEventListener('submit', e => { if(e.target.id === 'drForm'){ e.preventDefault(); answer(); } });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && ui()){ e.preventDefault(); if(D.on) finish(); else close(); } });

  const m = (location.hash || '').match(/^#q-(\d{1,2})(?:@[A-Za-z0-9_-]{20,140})?$/);
  if(m) open(+m[1]);
})();
