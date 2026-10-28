/* Урам зориг: амжилтыг тэмдэглэх, «Миний ахиц» (оддын зураг, Монгол аялал, тэмдэг), өдрийн бодлого, дурсамж.
   Бүх мэдээлэл сурагчийн төхөөрөмж дээр нэр, бүлгээр нь хадгалагдана (ws_path — түвшний хамгийн сайн дүн, ws_prof — түүх, өдөр, тэмдэг). */
(function(){
  if(typeof S === 'undefined' || !window.WS) return;
  const norm = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const who = () => [($('stName') || {}).value, ($('stClass') || {}).value].map(norm).join('|');
  const ymd = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const rj = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch(e){ return {}; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  function prof(){ const p = rj('ws_prof')[who()] || {}; return {days: p.days || [], hist: p.hist || [], daily: p.daily || {}, badges: p.badges || {}, rv: p.rv || 0, drill: p.drill || 0}; }
  function saveProf(p){ const all = rj('ws_prof'); all[who()] = p; wj('ws_prof', all); }
  /* Од: түвшин бүрт 80%-иас дээш авсан бол нэг од. {"9-5": {1: 85, 2: 60}} */
  function starMap(){
    const all = rj('ws_path'), pre = who() + '|', out = {};
    Object.keys(all).forEach(k => { if(k.startsWith(pre)) out[k.slice(pre.length)] = all[k] || {}; });
    return out;
  }
  const nStars = lv => [1, 2, 3].filter(l => lv && lv[l] >= PASS).length;
  const totalStars = sm => Object.values(sm).reduce((s, lv) => s + nStars(lv), 0);

  /* ---------- Монгол аялал ---------- */
  const TRIP = [  // [нэр, хэрэгтэй од, тайлбар, «-д» хэлбэр]
    ['Улаанбаатар', 0, 'Аяллын эхлэл. Од цуглуулж Монгол орноор аялаарай.', 'Улаанбаатарт'],
    ['Хустайн нуруу', 3, 'Тахь адууг байгальд нь эргүүлэн нутагшуулсан газар.', 'Хустайн нуруунд'],
    ['Хархорин', 6, 'XIII зуунд Их Монгол улсын нийслэл байсан хот.', 'Хархоринд'],
    ['Орхоны хөндий', 10, 'ЮНЕСКО-гийн дэлхийн өвд бүртгэгдсэн соёлын дурсгалт газар.', 'Орхоны хөндийд'],
    ['Хөвсгөл нуур', 15, 'Монголын хамгийн гүн, тунгалаг цэнгэг устай нуур.', 'Хөвсгөл нуурт'],
    ['Увс нуур', 21, 'Монголын хамгийн том талбайтай нуур.', 'Увс нуурт'],
    ['Таван Богд', 28, 'Монголын хамгийн өндөр оргил Хүйтэн оргил энд бий.', 'Таван Богдод'],
    ['Хонгорын элс', 36, 'Говийн «дуут манхан» гэгддэг том элсэн манхан.', 'Хонгорын элсэнд'],
    ['Ёлын ам', 45, 'Говь гурван сайхны нуруунд орших гүн, сэрүүн хавцал.', 'Ёлын аманд'],
    ['Баянзаг', 55, 'Үлэг гүрвэлийн өндөг анх олдсон «Улаан эрэг».', 'Баянзагт']
  ];
  const station = n => TRIP.reduce((i, t, k) => n >= t[1] ? k : i, 0);

  /* ---------- Тэмдэг ---------- */
  function streak(days){
    const ds = [...new Set(days)].sort().map(d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5);
    let best = 0, run = 0; ds.forEach((d, i) => { run = i && d === ds[i - 1] + 1 ? run + 1 : 1; best = Math.max(best, run); });
    return best;
  }
  function groups(hist){ const g = {}; hist.forEach(h => { const k = String(h.c).split('-').slice(0, 3).join('-'); (g[k] = g[k] || []).push(h.p); }); return Object.values(g); }
  const BADGES = [
    ['first', '🌱', 'Анхны алхам', 'Анхны ажлаа шалгуулсан', c => c.p.hist.length >= 1],
    ['perfect', '💯', 'Төгс', 'Ажлын хуудсыг 100% зөв бодсон', c => c.p.hist.some(h => h.p === 100)],
    ['learner', '🔁', 'Алдаанаас суралцагч', 'Эхэндээ 80%-д хүрээгүй түвшинг дараа нь давсан', c => groups(c.p.hist).some(a => a.some((v, i) => v < PASS && a.slice(i + 1).some(w => w >= PASS)))],
    ['persist', '🧗', 'Тэвчээртэй', 'Нэг түвшинд 3 ба түүнээс олон удаа оролдож давсан', c => groups(c.p.hist).some(a => a.length >= 3 && a[a.length - 1] >= PASS)],
    ['star3', '⭐', 'Гурван од', 'Нэг сэдвийн гурван түвшнийг бүгдийг давсан', c => Object.values(c.sm).some(lv => nStars(lv) === 3)],
    ['explorer', '🧭', 'Судлаач', '5 өөр сэдэвт од авсан', c => Object.values(c.sm).filter(lv => nStars(lv) > 0).length >= 5],
    ['streak3', '🔥', '3 өдөр дараалан', '3 өдөр дараалан ажилласан', c => streak(c.p.days) >= 3],
    ['streak7', '📅', '7 хоног дараалан', '7 өдөр дараалан ажилласан', c => streak(c.p.days) >= 7],
    ['daily5', '☀️', 'Өдрийн баатар', 'Өдрийн бодлогыг 5 удаа зөв бодсон', c => Object.values(c.p.daily).filter(v => v >= 100).length >= 5],
    ['traveler', '🐎', 'Аялагч', 'Монгол аяллын 5 дахь буудал болох Хөвсгөл нууранд хүрсэн', c => station(c.stars) >= 4],
    ['speed', '⚡', 'Хурдан бодогч', 'Хурдан тооцоонд 60 секундэд 20 жишээ зөв бодсон', c => c.p.drill >= 20],
    ['satb', '🌍', 'SAT гүүр', '3 сэдэвт SAT шатыг (англи хэлээр) давсан', c => Object.values(c.sm).filter(lv => lv && lv[5] >= PASS).length >= 3],
    ['review', '📒', 'Давтлагын баатар', 'Алдааны дэвтрээс 3 сэдвийг давтлагаар бататгаж хассан', c => c.p.rv >= 3],
    ['master', '🏆', 'Мастер', '30 од цуглуулсан', c => c.stars >= 30]
  ];
  const ctx = () => { const p = prof(), sm = starMap(); return {p, sm, stars: totalStars(sm)}; };
  const earnedIds = c => BADGES.filter(b => c.p.badges[b[0]] || b[4](c)).map(b => b[0]);

  /* ---------- Алдааны дэвтэр (давтлага) ----------
     80%-д хүрээгүй сэдэв-түвшин дэвтэрт орно. 2 хоногийн дараа давтана; давбал 7 хоногийн дараа дахин,
     хоёр дахь давтлагаа давбал дэвтрээс хасагдана. Хугацаа болоогүй үед сайн бодсон ч хугацаа хэвээр. */
  const SPAN = [2, 7];
  const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  const dmy = d => d.slice(5, 7).replace(/^0/, '') + '-р сарын ' + d.slice(8).replace(/^0/, '');
  const revLoad = () => rj('ws_rev')[who()] || {};
  function revSave(r){ const all = rj('ws_rev'); all[who()] = r; wj('ws_rev', all); }
  const revDue = (r = revLoad(), today = ymd()) => Object.keys(r).filter(k => r[k].d <= today);
  function revTitle(k){ const [g, t, l] = k.split('-').map(Number), tp = W.topicsOf(g) && W.topicsOf(g)[t - 1]; return {g, t, l, title: tp ? tp.title : g + '-р анги, сэдэв ' + t}; }
  function revURL(k){ const {g, t, l} = revTitle(k), seed = 1000 + Math.floor(Math.random() * 98000);
    return `${location.pathname}${location.search}#${S.allowReveal ? 'sr' : 's'}-${g}-${t}-${l}-${l === 1 ? '5+0' : '0+5'}-${seed}${typeof linkTag === 'function' ? linkTag() : ''}`; }
  function revUpdate(p){
    const out = {added: [], again: [], cleared: []};
    if(S.daily || !S.items.length) return out;
    const r = revLoad(), today = ymd(), g = S.grade, tps = W.topicsOf(g), grp = {};
    S.items.forEach((it, i) => { const t = S.topic > 0 && S.topic < 100 ? S.topic : tps.findIndex(x => x.id === it.tid) + 1; if(t < 1) return;
      const k = g + '-' + t + '-' + (it.lvl || S.level), o = grp[k] = grp[k] || {n: 0, ok: 0}; o.n++; if(S.results[i] === true) o.ok++; });
    Object.keys(grp).forEach(k => { const o = grp[k], e = r[k];
      if(o.ok / o.n * 100 < PASS){ if(!e) out.added.push(k); r[k] = {s: 0, d: addDays(SPAN[0]), m: (e ? e.m : 0) + o.n - o.ok, a: e ? e.a : today}; }
      else if(e && e.d <= today){ if(e.s >= 1){ delete r[k]; out.cleared.push(k); p.rv = (p.rv || 0) + 1; } else { r[k] = Object.assign(e, {s: 1, d: addDays(SPAN[1])}); out.again.push(k); } } });
    revSave(r); return out;
  }
  function revNote(v){
    if(!v) return '';
    const t = k => '«' + Mx(esc(revTitle(k).title)) + '»';
    const out = [];
    if(v.cleared.length) out.push(`${v.cleared.map(t).join(', ')} сэдвийг давтлагаар бататгаж, алдааны дэвтрээсээ хаслаа!`);
    if(v.again.length) out.push(`Давтлага амжилттай. ${v.again.map(t).join(', ')} сэдвийг 7 хоногийн дараа нэг удаа дахин давтана.`);
    if(v.added.length) out.push(`${v.added.length} сэдэв алдааны дэвтэрт нэмэгдлээ. ${dmy(addDays(SPAN[0]))}-нд «Миний ахиц» дотроос давтаарай.`);
    return out.length ? `<p class="mv-rev"><span aria-hidden="true">📒</span> ${out.join(' ')}</p>` : '';
  }
  function revSection(){
    const r = revLoad(), today = ymd(), keys = Object.keys(r).sort((a, b) => r[a].d < r[b].d ? -1 : r[a].d > r[b].d ? 1 : 0);
    if(!keys.length) return `<h3 id="revSec">Алдааны дэвтэр</h3><p class="small">Одоогоор давтах сэдэв алга. 80%-д хүрээгүй сэдэв энд автоматаар орж, 2 ба 7 хоногийн дараа давтахыг сануулна.</p>`;
    const rows = keys.map(k => { const e = r[k], x = revTitle(k), due = e.d <= today;
      return `<li class="${due ? 'due' : ''}"><span class="rv-t">${Mx(esc(x.title))}<small>${x.g}-р анги · ${LV[x.l]} · ${e.s ? '2 дахь давтлага' : '1 дэх давтлага'}</small></span><span class="rv-d">${due ? 'Өнөөдөр' : dmy(e.d)}</span><a class="btn${due ? '' : ' ghost'}" href="${revURL(k)}" data-go>Давтах</a></li>`; }).join('');
    const n = revDue(r, today).length;
    return `<h3 id="revSec">Алдааны дэвтэр</h3><p class="small">${n ? `Өнөөдөр давтах ${n} сэдэв байна.` : 'Өнөөдөр давтах сэдэв алга. Товлосон өдрөө давтаарай.'} Давтлагаа 80%-иас дээш дүнтэй хоёр удаа давбал сэдэв дэвтрээс хасагдана.</p><ul class="revlist">${rows}</ul>`;
  }
  
  /* ---------- Шалгасны дараа ---------- */
  window.MOTIV = {};
  MOTIV.onCheck = function(prev){
    const n = S.items.length, pct = n ? Math.round(S.results.filter(x => x === true).length / n * 100) : 0;
    const p = prof(), today = ymd();
    if(!p.days.includes(today)) p.days = [...p.days, today].slice(-120);
    p.hist = [...p.hist, {c: code(), p: pct, t: Date.now()}].slice(-300);
    if(S.daily) p.daily[today] = Math.max(p.daily[today] || 0, pct);
    const rev = revUpdate(p);
    const c = {p, sm: starMap()}; c.stars = totalStars(c.sm);
    const starUp = S.level !== 4 && pct >= PASS && !(prev >= PASS);
    const before = station(c.stars - (starUp ? 1 : 0)), after = station(c.stars);
    const fresh = BADGES.filter(b => !p.badges[b[0]] && b[4](c));
    fresh.forEach(b => { p.badges[b[0]] = today; });
    saveProf(p);
    S.motiv = {pct, prev, rev, starUp, stationUp: after > before ? after : -1, fresh: fresh.map(b => b[0])};
    if(pct >= PASS) setTimeout(() => chalkBurst(pct === 100 ? 140 : 90), 60);
  };
  MOTIV.resultHTML = function(pct){
    const m = S.motiv && S.motiv.pct === pct ? S.motiv : {pct};
    const msg = pct === 100 ? 'Гайхалтай! Бүх даалгаврыг зөв бодлоо.' : pct >= PASS ? 'Сайн байна! Энэ түвшинг эзэмшлээ.'
      : pct >= 50 ? 'Бараг боллоо. Алдсан даалгавруудынхаа «Бодох арга»-г уншаад дахин оролдоорой.' : 'Эхлэл ч гэсэн алхам. Алдаа бол суралцах боломж: бодох аргыг уншаад шинэ хувилбар бөглөөрэй.';
    let grow = '';
    if(m.prev != null){
      if(pct > m.prev) grow = `Өмнөх хамгийн сайн дүнгээсээ ${pct - m.prev} хувиар ахилаа!`;
      else if(pct < m.prev) grow = `Өмнө нь ${m.prev}% авч байсан. Чадна гэдгээ мэдэж байна, дахин оролдоорой.`;
    }
    const tp = W.topicsOf(S.grade)[S.topic - 1];
    const parts = [`<p class="mv-msg">${msg}</p>`];
    if(grow) parts.push(`<p class="mv-grow">${grow}</p>`);
    if(m.starUp) parts.push(`<p class="mv-star"><span aria-hidden="true">★</span> Шинэ од: ${tp ? '«' + Mx(esc(tp.title)) + '» · ' : ''}${LV[S.level]}</p>`);
    if(m.stationUp >= 0) parts.push(`<p class="mv-trip">Монгол аялал: та <b>${TRIP[m.stationUp][3]}</b> хүрлээ. ${TRIP[m.stationUp][2]}</p>`);
    if(m.fresh && m.fresh.length) parts.push(`<div class="mv-badges">${m.fresh.map(id => { const b = BADGES.find(x => x[0] === id); return `<span class="badge on"><i aria-hidden="true">${b[1]}</i>Шинэ тэмдэг: ${b[2]}</span>`; }).join('')}</div>`);
    parts.push(revNote(m.rev));
    parts.push(`<div class="result-actions"><button class="btn ghost" type="button" data-myprog>Миний ахиц</button>${window.COACH && !S.daily ? `<button class="btn ghost" type="button" data-gohref="${esc(COACH.homeURL(S.grade))}">Миний сурах зам</button>` : ''}</div>`);
    return `<div class="motiv${pct >= PASS ? ' win' : ''}" role="status">${parts.join('')}</div>`;
  };
  MOTIV.barHTML = () => { const n = totalStars(starMap()), d = revDue().length;
    return `<button class="linkbtn myprog" type="button" data-myprog><span aria-hidden="true">★</span> ${n} од · Миний ахиц</button>${d ? ` <button class="linkbtn revdue" type="button" data-myprog="rev"><span aria-hidden="true">📒</span> Өнөөдөр давтах: ${d}</button>` : ''}`; };

  /* ---------- Шохойн тоос (баяр) ---------- */
  function chalkBurst(count){
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1), W0 = innerWidth, H0 = innerHeight;
    cv.className = 'chalkburst'; cv.width = W0 * dpr; cv.height = H0 * dpr; document.body.appendChild(cv);
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const col = ['#F4D35E', '#FFFFFF', '#9FD8C3', '#F2A7A0', '#BFD7FF'];
    const ps = Array.from({length: count}, () => ({x: W0 / 2 + (Math.random() - .5) * 120, y: H0 * .35, vx: (Math.random() - .5) * 9, vy: -4 - Math.random() * 7, r: 2 + Math.random() * 3.5, c: col[Math.floor(Math.random() * col.length)], s: Math.random() < .25}));
    const t0 = performance.now();
    (function frame(t){
      const k = (t - t0) / 1600; g.clearRect(0, 0, W0, H0);
      ps.forEach(p => { p.vy += .22; p.x += p.vx; p.y += p.vy; p.vx *= .99; g.globalAlpha = Math.max(0, 1 - k); g.fillStyle = p.c;
        if(p.s){ g.font = `${p.r * 5}px serif`; g.fillText('★', p.x, p.y); } else { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); } });
      if(k < 1) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  /* ---------- «Миний ахиц» цонх ---------- */
  function dlg(){
    let d = document.getElementById('progDlg');
    if(!d){ d = document.createElement('dialog'); d.id = 'progDlg'; d.className = 'progdlg'; d.setAttribute('aria-labelledby', 'progTitle'); document.body.appendChild(d);
      d.addEventListener('click', e => { if(e.target === d || e.target.closest('[data-close]')) d.close(); }); }
    return d;
  }
  function progHTML(){
    const c = ctx(), name = ($('stName').value || '').trim(), g = S.grade, sm = c.sm;
    const st = station(c.stars), next = TRIP[st + 1], earned = earnedIds(c);
    const trip = `<ol class="trip">${TRIP.map((t, i) => `<li class="${i < st ? 'past' : i === st ? 'here' : ''}" title="${esc(t[2])}"><span class="tr-dot" aria-hidden="true">${i <= st ? '★' : ''}</span><span class="tr-name">${t[0]}</span><span class="tr-need">${t[1]} од</span></li>`).join('')}</ol>
      <p class="small">${next ? `Та одоо <b>${TRIP[st][3]}</b> байна. ${TRIP[st][2]} <b>${next[0]}</b> хүрэхэд дахиад ${next[1] - c.stars} од хэрэгтэй.` : 'Та аяллын бүх буудлыг туулжээ. Баяр хүргэе!'}</p>`;
    const chs = chaptersOf(g) || {}, tps = W.topicsOf(g), byCh = {};
    tps.forEach((t, i) => { (byCh[t.ch] = byCh[t.ch] || []).push([t, i + 1]); });
    const star = (on, l) => `<span class="st ${on ? 'on' : ''}" title="${LV[l]}${on ? ': давсан' : ''}">★</span>`;
    const map = Object.keys(byCh).map((ch, ci) => {
      const rows = byCh[ch].map(([t, ti]) => { const lv = sm[g + '-' + ti] || {}, n = nStars(lv);
        return `<li class="${n ? '' : 'none'}"><span class="tp">${Mx(esc(t.title))}</span><span class="sts">${[1, 2, 3].map(l => star(lv[l] >= PASS, l)).join('')}${lv[5] >= PASS ? '<span class="sat-pill" title="SAT шатыг давсан">SAT</span>' : ''}</span>${n === 3 ? `<button class="btn ghost cert-btn" type="button" data-cert="${g}-${ti}">Дурсамж татах</button>` : ''}</li>`; }).join('');
      const got = byCh[ch].reduce((s, [t, ti]) => s + nStars(sm[g + '-' + ti]), 0), open = got > 0 || byCh[ch].some(([t, ti]) => ti === S.topic);
      return `<details class="smap"${open ? ' open' : ''}><summary><span>${chs[ch] ? (ci + 1) + '. ' + esc(chs[ch]) : 'Сэдвүүд'}</span><span class="smap-n">${got} / ${byCh[ch].length * 3} ★</span></summary><ul>${rows}</ul></details>`;
    }).join('');
    const badges = `<div class="bgrid">${BADGES.map(b => { const on = earned.includes(b[0]); return `<div class="badge ${on ? 'on' : ''}"><i aria-hidden="true">${on ? b[1] : '🔒'}</i><b>${b[2]}</b><small>${b[3]}</small></div>`; }).join('')}</div>`;
    return `<div class="pg-head"><div><h2 id="progTitle">Миний ахиц</h2><p class="small">${name ? esc(name) + ' · ' : ''}${g}-р анги</p></div><button class="btn ghost" type="button" data-close>Хаах</button></div>
      ${name ? '' : '<p class="status">Нэрээ бичвэл ахиц тань тусдаа хадгалагдана.</p>'}
      <div class="pg-sum"><div><b>★ ${c.stars}</b><span>цуглуулсан од</span></div><div><b>${streak(c.p.days)}</b><span>хамгийн урт дараалсан өдөр</span></div><div><b>${earned.length} / ${BADGES.length}</b><span>тэмдэг</span></div><div><b>${c.p.hist.length}</b><span>шалгуулсан ажил</span></div></div>
      ${revSection()}
      <div class="pg-drill"><div><h3>Хурдан тооцоо</h3><p class="small">60 секундэд аль болох олон жишээ цээжээр бод.${c.p.drill ? ` Таны дээд амжилт: <b>${c.p.drill}</b>.` : ''}</p></div><button class="btn" type="button" data-drill="${g}">⚡ Эхлэх</button></div>
      <h3>Монгол аялал</h3>${trip}
      <h3>${g}-р ангийн оддын зураг</h3><p class="small">Сэдэв бүрт гурван од бий: мэдлэг, ойлголт, чадвар, хэрэглээ. Түвшинг 80%-иас дээш дүнтэй давахад од асна. Гурван од авсан сэдвээр дурсамж татаж болно.</p>${map}
      <h3>Тэмдэг</h3>${badges}`;
  }
  function openProg(){ const d = dlg(); d.innerHTML = progHTML(); if(d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  document.addEventListener('click', e => {
    const gh = e.target.closest('[data-gohref]'); if(gh){ location.href = gh.dataset.gohref; location.reload(); return; }
    const mp = e.target.closest('[data-myprog]'); if(mp){ openProg(); if(mp.dataset.myprog === 'rev'){ const h = document.getElementById('revSec'); if(h) h.scrollIntoView({block: 'start'}); } return; }
    const cb = e.target.closest('[data-cert]'); if(cb){ cert(cb, ...cb.dataset.cert.split('-').map(Number)); }
  });

  /* ---------- Дурсамж (PDF) ---------- */
  async function cert(btn, g, ti){
    const name = ($('stName').value || '').trim(), t = W.topicsOf(g)[ti - 1]; if(!t) return;
    if(!name){ alert('Дурсамжид нэр тань бичигдэнэ. Эхлээд нэрээ бичнэ үү.'); return; }
    if(!window.html2pdf){ alert('PDF бэлтгэх хэрэгсэл ачаалагдаагүй байна. Хуудсыг дахин ачаалаад оролдоно уу.'); return; }
    const d = new Date(), date = `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`, cls = ($('stClass').value || '').trim();
    const wrap = document.createElement('div'); wrap.className = 'certwrap';
    wrap.innerHTML = `<div class="cert"><div class="cert-in">
      <div class="cert-top">Математикийн ажлын хуудас</div>
      <div class="cert-title">ДУРСАМЖ</div>
      <div class="cert-name">${esc(name)}${cls ? ` <span>(${esc(cls)})</span>` : ''}</div>
      <p class="cert-text">${g}-р ангийн «${Mx(esc(t.title))}» сэдвийн мэдлэг, ойлголт, чадвар, хэрэглээ гурван түвшнийг амжилттай давсныг тэмдэглэн энэхүү дурсамжийг гардуулав.</p>
      <div class="cert-stars" aria-hidden="true">★ ★ ★</div>
      <div class="cert-foot"><span>${date}</span><span>Багш: ______________________</span></div>
    </div></div>`;
    document.body.appendChild(wrap);
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Бэлтгэж байна…';
    const sx = scrollX, sy = scrollY;
    try {
      if(document.fonts && document.fonts.ready) await document.fonts.ready;
      window.scrollTo(0, 0);
      const fname = `dursamj-${g}-angi-${t.id}.pdf`;
      const blob = await window.html2pdf().set({margin: 0, filename: fname, image: {type: 'jpeg', quality: 0.97},
        html2canvas: {scale: 2, backgroundColor: '#FFFFFF', scrollX: 0, scrollY: 0}, jsPDF: {unit: 'mm', format: 'a4', orientation: 'landscape'}}).from(wrap.firstElementChild).outputPdf('blob');
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      btn.textContent = 'Татагдлаа ✓';
    } catch(e){ btn.textContent = 'Алдаа гарлаа, дахин оролдоно уу'; }
    finally { wrap.remove(); window.scrollTo(sx, sy); setTimeout(() => { btn.disabled = false; btn.textContent = old; }, 2500); }
  }

  /* ---------- Багш: өдрийн бодлогын холбоос ---------- */
  const sp = document.getElementById('sharePanel');
  if(sp && !S.student){
    const box = document.createElement('div'); box.className = 'daily-box';
    box.innerHTML = `<h3>Өдрийн бодлого</h3><p class="small" style="margin:0">Сонгосон ангийн нэг сонирхолтой бодлого. Өдөр бүр автоматаар солигдоно. Хичээлийн эхний 5 минутын дасгалд тохиромжтой. Холбоос нь нэг л удаа өгөхөд хангалттай.</p>
      <button class="btn ghost wide" id="dailyCopy" type="button">Өдрийн бодлогын холбоос хуулах</button><div class="status" id="dailyStatus" hidden></div>
      <h3>Хурдан тооцоо</h3><p class="small" style="margin:0">60 секундийн цээжээр бодох дасгал. Хичээлийн эхэнд халаалт болгон, эсвэл самбарт гаргаж ангиараа өрсөлдөж болно.</p>
      <div class="row"><button class="btn ghost" id="drillCopy" type="button">Холбоос хуулах</button><button class="btn ghost" type="button" data-drill="">Энд туршиж үзэх</button></div><div class="status" id="drillStatus" hidden></div>`;
    sp.appendChild(box);
    document.getElementById('drillCopy').addEventListener('click', async () => {
      const url = location.href.split('#')[0] + '#q-' + S.grade, ok = await copyText(url);
      shareSay('drillStatus', ok ? `${S.grade}-р ангийн хурдан тооцооны холбоос хуулагдлаа: ${url}` : 'Хуулж чадсангүй: ' + url, ok ? 'ok' : 'err');
    });
    document.getElementById('dailyCopy').addEventListener('click', async () => {
      const url = location.href.split('#')[0] + '#d-' + S.grade + linkTag(), ok = await copyText(url);
      shareSay('dailyStatus', ok ? `${S.grade}-р ангийн өдрийн бодлогын холбоос хуулагдлаа: ${url}` : 'Хуулж чадсангүй: ' + url, ok ? 'ok' : 'err');
    });
  }
  if(S.student && document.getElementById('studentBar')) setTimeout(() => { if(typeof render === 'function') render(); }, 0);
})();
