/* Хувийн сурах зам ба дасан зохицох дасгал.
   #me-9[@ID]   — сурагчийн нүүр: өнөөдрийн зөвлөмж (давтлага → суурь сэдэв → үргэлжлүүлэх → шинэ сэдэв)
   #a-9-12[-2][@ID] — дасан зохицох дасгал: 3 дараалан зөв → түвшин ахина, 2 дараалан алдвал → буурна.
   Дасгалын дүнг түвшин бүрээр нь хуучин хэлбэрийн кодоор (9-12-2-7-0-54321) багшид илгээнэ:
   ижил кодоор хуудсыг сэргээхэд яг ижил даалгаврууд гарна (makeSheet-ийн эхний n даалгавар). */
(function(){
  if(typeof S === 'undefined' || !window.WS) return;
  try { if(linkSid) localStorage.setItem('ws_sid', linkSid); else if(!S.student){ const s = localStorage.getItem('ws_sid'); if(s && /^#(me|a)-/.test(location.hash)) linkSid = s; } } catch(e){}
  /* Сэдвийн уялдаа: мөр бүрт өмнөх сэдэв нь дараагийнхынхаа суурь */
  const CHAINS = ["int6 int7 ratop irr9 abs12 abseq12 absineq12", "pow6 pow7 pow8 root8 surd9 nroot10 rexp10 rexpr10", "pow8 sci std9 std10", "pow8 ipow10 expf10 expeq10 expi12 log12 logp12 loge12 eln12", "divis pow7", "frac6 pct6 pct7 pct8 pct9", "frac6 ratop", "ratio6 ratio7 scale inverse ratio9", "round6 round7 round round9", "alg6 alg7 poly8 sqform factor8 alg9 fact10 poly12 pdiv12 bezout12", "factor8 algfrac afrac9 afrac10 pfrac12", "eq6 eq7 rateq rat9", "eq7 sys8 sys9 gsys9 linsys11 nlsys11", "eq7 ineq8 ineqs9 lineq10 lin2ineq10", "factor8 quad9 quad10 biq10 quad11 qineq11 qgr11", "func6 linf7 linf inv9 func10 func11 comp11 inv11", "linf slope10 line10 perp11", "parab qgraph9 quadf10 quad11", "seq6 seq7 seq ap8 seq9 seq11 ap11 gp11", "mean6 stat7 means8 grp9 gmean10 quart10 mean11 disp11 ev12 var12", "prob6 prob7 prob8 cprob9 union10 comp10 drv12 ev12", "sets set10", "fact10b perm10 comp10", "ang6 ang7 polyang inscr insc10 cyc10", "circline circ9 secant10", "triineq ang7 pyth8 trig9 trig180 cosrule10 triarea10", "seg6 meas7 area8", "area6 area7 area8 area9 arc10", "circle8 arc10", "vol6 surf7 solid8 solid9 solid10", "section9 sect10", "coord6 move7 dist coord10 circle10 coord3d11 dist3d11", "move7 transf trans9 comp9 ptsym10 axsym10 rot10 trn10", "homot7 sim7 simtri simarea hom10", "bearing bear9", "speed vt9", "vec9 vecop10 dot10 vec3d11 dot3d11", "matadd10 matmul10 det10 matinv10", "trig9 rad11 tval11 ident11 trigf12", "tan10 secant11 der11 dpow11 drule11 chain11 tline11 rate11 extr11", "dpow11 dexp12 dln12 dtrig12 dprod12 dquot12 dtan12 dchain12", "int11 intlin11 curve11 defint11 area11 iexp12 irat12 ilog12 isub12", "cre12 cadd12 cmul12 ceq12 cdiv12 cmod12 cquad12 cgeo12", "quad11 cquad12", "time6 tz9", "hyp10 ratf12", "powf10 powf11 mono11 parity11", "linf trend10"];
  const PRE = {}, LOC = {};
  CHAINS.forEach(c => { const a = c.split(' '); for(let i = 1; i < a.length; i++) (PRE[a[i]] = PRE[a[i]] || []).includes(a[i - 1]) || PRE[a[i]].push(a[i - 1]); });
  W.GRADES.forEach(g => W.topicsOf(g).forEach((t, i) => { LOC[t.id] = {g, t: i + 1, id: t.id, title: t.title}; }));
  const topicAt = (g, t) => { const x = W.topicsOf(g)[t - 1]; return x ? LOC[x.id] : null; };

  /* ---------- хадгалалт ---------- */
  const norm = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const who = () => [($('stName') || {}).value, ($('stClass') || {}).value].map(norm).join('|');
  const rj = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch(e){ return {}; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const ymd = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function starMap(){ const all = rj('ws_path'), pre = who() + '|', out = {}; Object.keys(all).forEach(k => { if(k.startsWith(pre)) out[k.slice(pre.length)] = all[k] || {}; }); return out; }
  const firstOpen = lv => [1, 2, 3].find(l => !(lv && lv[l] >= PASS)) || 0;   // 0: бүгдийг давсан
  function lastSeen(){ const h = (rj('ws_prof')[who()] || {}).hist || [], m = {}; h.forEach((x, i) => { const k = String(x.c).split('-').slice(0, 2).join('-'); m[k] = i + 1; }); return m; }
  const tagOf = () => (typeof linkTag === 'function' ? linkTag() : '');
  const rnd = () => 1000 + Math.floor(Math.random() * 98000);
  const sheetURL = (g, t, l) => `${location.pathname}${location.search}#s-${g}-${t}-${l}-${l === 1 ? '5+3' : l === 2 ? '2+5' : '0+5'}-${rnd()}${tagOf()}`;
  const adaptURL = (g, t, l) => `${location.pathname}${location.search}#a-${g}-${t}${l ? '-' + l : ''}${tagOf()}`;
  const homeURL = g => `${location.pathname}${location.search}#me-${g}${tagOf()}`;

  /* ---------- Зөвлөмж ---------- */
  function recs(g){
    const sm = starMap(), out = [], seen = new Set(), today = ymd(), seenAt = lastSeen();
    const add = r => { const k = r.g + '-' + r.t; if(seen.has(k) || !topicAt(r.g, r.t)) return false; seen.add(k); out.push(Object.assign(r, {title: topicAt(r.g, r.t).title})); return true; };
    // 1. Алдааны дэвтэр: давтах өдөр болсон
    const rev = rj('ws_rev')[who()] || {};
    Object.keys(rev).filter(k => rev[k].d <= today).sort((a, b) => rev[a].d < rev[b].d ? -1 : 1).slice(0, 2).forEach(k => { const [rg, rt, rl] = k.split('-').map(Number); add({kind: 'review', g: rg, t: rt, l: rl, why: 'Алдааны дэвтэр: давтах өдөр нь болсон.'}); });
    // 2. Суурь дутуу: мэдлэг, ойлголтын түвшинд 50%-иас бага → өмнөх сэдэв
    let base = 0;
    Object.keys(sm).filter(k => sm[k][1] != null && sm[k][1] < 50).sort((a, b) => (seenAt[b] || 0) - (seenAt[a] || 0)).forEach(k => {
      if(base) return; const [kg, kt] = k.split('-').map(Number), me = topicAt(kg, kt); if(!me) return;
      const pre = (PRE[me.id] || []).map(id => LOC[id]).filter(Boolean).find(p => firstOpen(sm[p.g + '-' + p.t]) && firstOpen(sm[p.g + '-' + p.t]) <= 2);
      if(pre && add({kind: 'base', g: pre.g, t: pre.t, l: firstOpen(sm[pre.g + '-' + pre.t]), why: `«${me.title}» сэдвийн суурь. Үүнийг бататгавал тэр сэдэв илүү амар болно.`})) base++;
    });
    // 3. Эхэлсэн сэдвээ үргэлжлүүлэх (хамгийн сүүлд хийснээс)
    Object.keys(sm).filter(k => +k.split('-')[0] === g && firstOpen(sm[k])).sort((a, b) => (seenAt[b] || 0) - (seenAt[a] || 0)).slice(0, 2).forEach(k => {
      const [kg, kt] = k.split('-').map(Number), l = firstOpen(sm[k]), b = sm[k][l];
      add({kind: 'continue', g: kg, t: kt, l, why: b != null ? `«${LV[l]}» түвшинд хамгийн сайн дүн ${b}%. ${PASS}%-д хүрвэл дараагийн түвшин нээгдэнэ.` : `«${LV[l]}» түвшин дараагийн алхам тань.`});
    });
    // 4. Шинэ сэдэв (сурах бичгийн дарааллаар, суурь сэдэв нь эзэмшигдсэнийг түрүүлж)
    const fresh = W.topicsOf(g).map((t, i) => LOC[t.id]).filter(x => !sm[x.g + '-' + x.t]);
    const ready = fresh.filter(x => (PRE[x.id] || []).every(id => { const p = LOC[id]; return !p || p.g < g || (sm[p.g + '-' + p.t] || {})[1] >= PASS; }));
    (ready.length ? ready : fresh).some(x => { add({kind: 'next', g: x.g, t: x.t, l: 1, why: 'Шинэ сэдэв. Мэдлэг, ойлголтын түвшнээс эхэлнэ.'}); return out.length >= 4; });
    return out.slice(0, 4);
  }

  /* ---------- Дэлгэцийн бүрхүүл ---------- */
  function shell(cls){
    let el = document.getElementById('coach');
    if(!el){ el = document.createElement('section'); el.id = 'coach'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'coTitle'); document.body.appendChild(el); }
    el.className = 'coach ' + (cls || ''); document.body.classList.add('coach-open'); return el;
  }
  function closeCoach(){ const el = document.getElementById('coach'); if(el) el.remove(); document.body.classList.remove('coach-open'); if(/^#(me|a)-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }
  const nameFields = () => `<div class="co-who"><label class="f">Нэр, овог<input id="coName" maxlength="40" autocomplete="name" placeholder="Жишээ: Б. Сараа" value="${esc($('stName').value)}"></label><label class="f">Анги, бүлэг<input id="coClass" maxlength="12" placeholder="9б" value="${esc($('stClass').value)}"></label></div>`;
  function syncWho(){
    const n = document.getElementById('coName'), c = document.getElementById('coClass'); if(!n) return;
    $('stName').value = n.value; $('stClass').value = c.value;
    try { localStorage.setItem('ws_student', JSON.stringify({n: n.value, c: c.value})); } catch(e){}
  }
  function loadWho(){ try { const v = JSON.parse(localStorage.getItem('ws_student') || '{}'); if(!$('stName').value) $('stName').value = v.n || ''; if(!$('stClass').value) $('stClass').value = v.c || ''; } catch(e){} }

  /* ---------- Сурагчийн нүүр: Миний сурах зам ---------- */
  const KIND = {review: 'Давтлага', base: 'Суурь сэдэв', continue: 'Үргэлжлүүлэх', next: 'Шинэ сэдэв'};
  let homeG = 9;
  function home(g){
    homeG = W.GRADES.includes(+g) ? +g : homeG; S.grade = homeG; try { localStorage.setItem('ws_megrade', String(homeG)); } catch(e){}
    const R0 = recs(homeG), sm = starMap(), chs = (W.CHAPTERS || {})[homeG] || {}, byCh = {};
    W.topicsOf(homeG).forEach((t, i) => { (byCh[t.ch] = byCh[t.ch] || []).push([t, i + 1]); });
    const sel = Object.keys(byCh).map(ch => `<optgroup label="${esc(chs[ch] || 'Сэдвүүд')}">${byCh[ch].map(([t, ti]) => { const n = [1, 2, 3].filter(l => (sm[homeG + '-' + ti] || {})[l] >= PASS).length; return `<option value="${ti}">${esc(t.title)}${n ? ' ' + '★'.repeat(n) : ''}</option>`; }).join('')}</optgroup>`).join('');
    shell('home').innerHTML = `<div class="co-in">
      <div class="co-top"><h2 id="coTitle">Миний сурах зам</h2><button class="btn ghost" type="button" data-coclose>Хаах</button></div>
      ${nameFields()}
      <div class="co-grades" role="group" aria-label="Анги">${W.GRADES.map(x => `<button type="button" class="chip${x === homeG ? ' on' : ''}" data-cog="${x}" aria-pressed="${x === homeG}">${x}-р анги</button>`).join('')}</div>
      <h3>Өнөөдрийн зөвлөмж</h3>
      <p class="small">Таны бодсон ажлын дүн, алдааны дэвтэр, сэдвүүдийн уялдаанд тулгуурлан сонгосон дараагийн алхам.${$('stName').value.trim() ? '' : ' Нэрээ бичвэл ахиц тань тусдаа хадгалагдана.'}</p>
      <ol class="co-recs">${R0.map(r => `<li class="co-card k-${r.kind}"><span class="co-kind">${KIND[r.kind]}</span><b class="co-t">${Mx(esc(r.title))}</b><small>${r.g}-р анги · ${LV[r.l]}</small><p>${Mx(esc(r.why))}</p>
        <div class="row"><a class="btn" href="${adaptURL(r.g, r.t, r.l)}" data-go>Дасан зохицох дасгал</a><a class="btn ghost" href="${sheetURL(r.g, r.t, r.l)}" data-go>Ажлын хуудас</a></div></li>`).join('')}</ol>
      <h3>Өөрөө сэдэв сонгох</h3>
      <form class="co-pick" id="coPick"><select id="coTopic" aria-label="Сэдэв">${sel}</select><button class="btn" type="submit">Дасгал эхлэх</button></form>
      <p class="small">Дасан зохицох дасгалд бодлого нэг нэгээр гарна. 3 дараалан зөв бодвол дараагийн түвшинд, 2 дараалан алдвал өмнөх түвшинд шилжинэ.</p>
      <div class="row co-more"><button class="btn ghost" type="button" data-myprog>★ Миний ахиц</button><button class="btn ghost" type="button" data-drill="${homeG}">⚡ Хурдан тооцоо</button>${homeG >= 10 && window.EXAM ? `<a class="btn ghost" href="${location.pathname}${location.search}#e${tagOf()}" data-go>ЭЕШ-ийн бүтэцтэй сорил</a>` : ''}</div></div>`;
  }

  /* ---------- Дасан зохицох дасгал ---------- */
  const A = {};
  const MAXL = 40;
  function startLevel(g, t){ const lv = starMap()[g + '-' + t] || {}; return firstOpen(lv) || 3; }
  function adaptStart(g, t, l){
    const tp = topicAt(g, t); if(!tp){ home(g); return; }
    Object.assign(A, {g, t, L: l || startLevel(g, t), base: rnd(), lv: {1: [], 2: [], 3: []}, streak: 0, miss: 0, cur: null, ans: null, done: false, sent: false, t0: Date.now(), msg: '', preShown: false, mastered: false});
    const lv = starMap()[g + '-' + t] || {};
    shell('adapt').innerHTML = `<div class="co-in">
      <div class="co-top"><a class="linkbtn" href="${homeURL(g)}" data-go>← Миний сурах зам</a><button class="btn ghost" type="button" data-coclose>Хаах</button></div>
      <h2 id="coTitle">${Mx(esc(tp.title))}</h2><p class="small">${g}-р анги · дасан зохицох дасгал</p>
      ${ladder(lv)}
      <p>Бодлого нэг нэгээр гарна. <b>3 дараалан зөв</b> бодвол дараагийн түвшинд шилжинэ, <b>2 дараалан алдвал</b> өмнөх түвшинд буцаж бататгана. Алдсан бодлогын бодолт шууд харагдана. Хүссэн үедээ «Дуусгах» дарж дүнгээ багшдаа илгээнэ.</p>
      ${nameFields()}
      <button class="btn co-go" type="button" id="coStart">«${LV[A.L]}» түвшнээс эхлэх</button></div>`;
  }
  function ladder(lv){ return `<ol class="ladder co-lad">${[1, 2, 3].map(l => `<li class="${lv[l] >= PASS ? 'done' : l === A.L ? 'now' : ''}"><span class="lad-dot">${lv[l] >= PASS ? '✓' : l}</span><span class="lad-txt">${LV[l]}${lv[l] != null ? ` <em>${lv[l]}%</em>` : ''}</span></li>`).join('')}</ol>`; }
  const sheetFor = l => W.makeSheet(A.g, A.t, l, MAXL, A.base + l * 1009, l === 1 ? 1 : 0);
  const cache = {};
  function nextItem(){
    const k = A.g + '-' + A.t + '-' + A.L + '-' + A.base, list = cache[k] || (cache[k] = sheetFor(A.L)), i = A.lv[A.L].length;
    if(i >= list.length){ // энэ түвшний бодлого дууссан
      const alt = [1, 2, 3].find(l => l !== A.L && A.lv[l].length < MAXL); if(alt){ A.L = alt; return nextItem(); } finish(); return;
    }
    A.cur = list[i]; A.ans = null; A.choice = null; drawItem();
  }
  function stats(){ const all = [1, 2, 3].flatMap(l => A.lv[l]); return {n: all.length, ok: all.filter(x => x.ok).length}; }
  function drawItem(fb){
    const p = A.cur, st = stats(), lv = starMap()[A.g + '-' + A.t] || {}, tp = topicAt(A.g, A.t);
    const last5 = A.lv[A.L].slice(-5).map(x => `<i class="${x.ok ? 'y' : 'n'}"></i>`).join('');
    let ans;
    if(p.mc) ans = `<div class="p-mc co-mc" role="group" aria-label="Сонголт">${p.mc.map((o, k) => { const c = fb ? (k === p.ci ? 'right' : k === A.choice ? 'wrong' : '') : ''; return `<button type="button" class="opt ${c}" data-coc="${k}" aria-pressed="${A.choice === k}" ${fb ? 'disabled' : ''}><b>${LETTER[k]}</b><span>${Mx(o)}</span></button>`; }).join('')}</div>`;
    else ans = `<form class="co-ans" id="coAns" autocomplete="off"><input id="coIn" aria-label="Хариу" spellcheck="false" enterkeyhint="done" value="${esc(A.ans || '')}" ${fb ? 'disabled' : ''}>${p.root ? `<button class="root-btn" type="button" data-coroot ${fb ? 'disabled' : ''} aria-label="Язгуурын тэмдэг">√</button>` : ''}${fb ? '' : '<button class="btn" type="submit">Шалгах</button>'}</form>${p.note ? `<p class="small co-note">${Mx(esc(p.note))}</p>` : ''}`;
    const meth = (window.METHODS || {})[p.tid];
    const fbh = !fb ? '' : fb.ok ? `<div class="co-fb ok" role="status"><b>Зөв!</b> ${esc(fb.msg || '')}</div>`
      : `<div class="co-fb bad" role="status"><b>Буруу.</b> Зөв хариу: <b>${Mx(p.show)}</b>${fb.msg ? '<br>' + esc(fb.msg) : ''}</div>
        ${p.sol && p.sol.length || meth ? `<div class="sol co-sol"><div class="sol-body">${meth ? `<p class="sol-m"><b>Бодох арга.</b> ${Mx(meth)}</p>` : ''}${p.sol && p.sol.length ? `<ol class="sol-s">${p.sol.map(x => `<li>${Mx(x)}</li>`).join('')}</ol>` : ''}</div></div>` : ''}`;
    const pre = fb && fb.pre ? `<div class="co-pre">Энэ сэдвийн суурь болох <b>«${Mx(esc(fb.pre.title))}»</b> сэдвийг давтвал илүү амар болно. <a class="btn ghost" href="${adaptURL(fb.pre.g, fb.pre.t)}" data-go>Суурь сэдвээ давтах</a></div>` : '';
    shell('adapt').innerHTML = `<div class="co-in">
      <div class="co-top"><a class="linkbtn" href="${homeURL(A.g)}" data-go>← Миний сурах зам</a><span class="co-stat"><b>${st.ok}</b> / ${st.n} зөв</span><button class="btn ghost" type="button" id="coFinish">Дуусгах</button></div>
      <h2 id="coTitle" class="co-h">${Mx(esc(tp.title))}</h2>
      ${ladder(lv)}
      <div class="co-level"><span>${LV[A.L]}</span><span class="co-last" aria-label="Энэ түвшний сүүлийн 5 бодлого">${last5}</span><span class="small">${A.streak > 0 ? A.streak + ' дараалан зөв' : ''}</span></div>
      ${A.msg ? `<p class="co-msg" role="status">${A.msg}</p>` : ''}
      <article class="paper co-card-p"><div class="p-q">${Mx(p.q)}</div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}${ans}</article>
      ${fbh}${pre}
      ${fb ? `<div class="row"><button class="btn co-go" type="button" id="coNext">Дараагийн бодлого</button></div>` : ''}</div>`;
    setTimeout(() => { const f = fb ? document.getElementById('coNext') : document.getElementById('coIn') || document.querySelector('[data-coc]'); if(f) f.focus({preventScroll: !!fb}); }, 20);
  }
  function judge(){
    const p = A.cur; let ok;
    if(p.mc){ if(A.choice == null) return; ok = A.choice === p.ci; }
    else { const v = (document.getElementById('coIn').value || '').trim(); if(!v) return; A.ans = v; ok = W.check(p, v) === true; }
    A.lv[A.L].push({ok, a: p.mc ? LETTER[A.choice] : A.ans}); A.msg = '';
    const fb = {ok, msg: ''};
    if(ok){ A.streak++; A.miss = 0; } else { A.miss++; A.streak = 0; }
    record(A.L);
    if(ok && A.streak >= 3){
      if(A.L < 3){ A.L++; A.streak = 0; A.msg = `Гурав дараалан зөв! Одоо «${LV[A.L]}» түвшин.`; fb.msg = 'Дараагийн түвшинд шилжлээ.'; }
      else if(!A.mastered){ A.mastered = true; A.streak = 0; A.msg = 'Энэ сэдвийн хамгийн дээд түвшинд гурав дараалан зөв бодлоо. Гайхалтай!'; }
    }
    if(!ok && A.miss >= 2){
      if(A.L > 1){ A.L--; A.miss = 0; A.msg = `Хоёр дараалан алдлаа. «${LV[A.L]}» түвшинд буцаж бататгая.`; }
      else if(!A.preShown){ A.preShown = true; const me = topicAt(A.g, A.t), pre = (PRE[me.id] || []).map(id => LOC[id]).filter(Boolean)[0]; if(pre) fb.pre = pre; }
    }
    drawItem(fb);
  }
  /* Түвшний сүүлийн 5-аас 4 нь зөв бол ахицад (ws_path) тэмдэглэнэ */
  function record(l){
    const a = A.lv[l]; if(a.length < 5) return; const pct = Math.round(a.slice(-5).filter(x => x.ok).length / 5 * 100); if(pct < PASS) return;
    try { const all = rj('ws_path'), k = who() + '|' + A.g + '-' + A.t, cur = all[k] || {}; if(!(cur[l] >= pct)){ cur[l] = pct; all[k] = cur; wj('ws_path', all); } } catch(e){}
  }
  function rows(){
    const tp = topicAt(A.g, A.t), name = $('stName').value.trim(), group = $('stClass').value.trim(), min = (Date.now() - A.t0) / 60000;
    return [1, 2, 3].filter(l => A.lv[l].length).map(l => { const a = A.lv[l], n = a.length, f = l === 1 ? 1 : 0;
      return {code: `${A.g}-${A.t}-${l}-${n}-${f}-${A.base + l * 1009}`, grade: A.g, topic: tp.title, level: LV[l], form: 'Дасан зохицох дасгал', name, group,
        score: a.filter(x => x.ok).length, total: n, minutes: Math.round(min * 10) / 10, missed: a.map((x, i) => x.ok ? null : i + 1).filter(Boolean).join(', '),
        detail: a.map(x => x.ok ? '1' : '0').join(''), answers: a.map((x, i) => `${i + 1}) ${x.a || '—'}`).join('; ')}; });
  }
  function send(){ if(A.sent || !stats().n) return false; A.sent = true; const rs = rows(); if(!rs[0].name || typeof window.queueResult !== 'function' || !(window.resultsURL && resultsURL())) return false; rs.forEach(r => window.queueResult(r)); return true; }
  function finish(){
    if(A.done) return; A.done = true; const st = stats(), sent = send(), lv = starMap()[A.g + '-' + A.t] || {};
    try { if(st.n && window.MOTIV){ const pf = rj('ws_prof'), p = pf[who()] || {}; p.days = [...new Set([...(p.days || []), ymd()])].slice(-120); pf[who()] = p; wj('ws_prof', pf); } } catch(e){}
    shell('adapt').innerHTML = `<div class="co-in"><div class="co-top"><h2 id="coTitle">Дасгал дууслаа</h2><button class="btn ghost" type="button" data-coclose>Хаах</button></div>
      <p class="co-big"><b>${st.ok}</b> / ${st.n} зөв</p>
      <ul class="unit-res">${[1, 2, 3].filter(l => A.lv[l].length).map(l => { const a = A.lv[l], ok = a.filter(x => x.ok).length, pc = Math.round(ok / a.length * 100); return `<li class="${pc >= PASS ? 'ok' : pc >= 50 ? 'mid' : 'low'}"><span>${LV[l]}</span><b>${ok} / ${a.length}</b><em>${pc}%</em></li>`; }).join('')}</ul>
      ${ladder(lv)}
      <p class="small">${sent ? 'Дүн тань багшид илгээгдэж байна.' : $('stName').value.trim() ? '' : 'Нэрээ бичээгүй тул дүн багшид илгээгдсэнгүй.'} Түвшинд сүүлийн 5 бодлогоос 4-ийг зөв бодсон бол од тань асна.</p>
      <div class="row"><a class="btn" href="${adaptURL(A.g, A.t)}" data-go>Дахин дасгал хийх</a><a class="btn ghost" href="${homeURL(A.g)}" data-go>Миний сурах зам</a></div></div>`;
  }
  window.addEventListener('pagehide', () => { if(A.cur && !A.done) send(); });

  /* ---------- үйлдэл ---------- */
  document.addEventListener('click', e => {
    if(!document.getElementById('coach')) return;
    if(e.target.closest('[data-coclose]')){ if(A.cur && !A.done){ finish(); return; } closeCoach(); return; }
    const gb = e.target.closest('[data-cog]'); if(gb){ syncWho(); home(+gb.dataset.cog); return; }
    if(e.target.closest('#coStart')){ syncWho(); nextItem(); return; }
    if(e.target.closest('#coNext')){ if(A.done) return; nextItem(); return; }
    if(e.target.closest('#coFinish')){ finish(); return; }
    const c = e.target.closest('[data-coc]'); if(c && !c.disabled){ A.choice = +c.dataset.coc; judge(); return; }
    if(e.target.closest('[data-coroot]')){ const inp = document.getElementById('coIn'), p = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, p) + '√' + inp.value.slice(inp.selectionEnd ?? p); inp.focus(); inp.setSelectionRange(p + 1, p + 1); }
  });
  document.addEventListener('submit', e => {
    if(e.target.id === 'coAns'){ e.preventDefault(); judge(); }
    if(e.target.id === 'coPick'){ e.preventDefault(); syncWho(); location.href = adaptURL(homeG, +document.getElementById('coTopic').value); location.reload(); }
  });
  document.addEventListener('input', e => { if(e.target.id === 'coName' || e.target.id === 'coClass'){ syncWho(); if(document.querySelector('.coach.home')){ clearTimeout(home.t); home.t = setTimeout(() => { const f = document.activeElement && document.activeElement.id; home(homeG); const el = f && document.getElementById(f); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 700); } } });
  document.addEventListener('keydown', e => { if(e.key === 'Enter' && document.getElementById('coNext') && !e.target.closest('input,textarea')){ /* Enter → дараагийнх */ } });

  window.COACH = {recs, PRE, LOC, home, adaptStart, homeURL, get state(){ return A; }};

  /* Багш: сурагчийн хувийн замын холбоос */
  const sp = document.getElementById('sharePanel');
  if(sp && !S.student && !/^#(me|a)-/.test(location.hash)){
    const box = document.createElement('div'); box.className = 'daily-box';
    box.innerHTML = `<h3>Сурагчийн хувийн зам</h3><p class="small" style="margin:0">Сурагч бүр өөрийн дүнд тохирсон дараагийн алхам, дасан зохицох дасгалыг харна. Нэг удаа өгөхөд хангалттай, хадгалаад байнга ашиглана.</p>
      <button class="btn ghost wide" id="meCopy" type="button">Хувийн замын холбоос хуулах</button><div class="status" id="meStatus" hidden></div>`;
    sp.appendChild(box);
    document.getElementById('meCopy').addEventListener('click', async () => { const url = location.href.split('#')[0] + '#me-' + S.grade + tagOf(), ok = await copyText(url); shareSay('meStatus', ok ? `${S.grade}-р ангийн хувийн замын холбоос хуулагдлаа: ${url}` : 'Хуулж чадсангүй: ' + url, ok ? 'ok' : 'err'); });
  }

  /* Холбоосоор нээх */
  const hm = (location.hash || '').match(/^#(?:me(?:-(\d{1,2}))?|a-(\d{1,2})-(\d{1,3})(?:-([123]))?)(?:@([A-Za-z0-9_-]{20,140}))?$/);
  if(hm){
    if(hm[5]){ linkSid = hm[5]; try { localStorage.setItem('ws_sid', linkSid); } catch(e){} }
    loadWho();
    if(hm[2]) adaptStart(+hm[2], +hm[3], hm[4] ? +hm[4] : 0);
    else { let g = +hm[1]; if(!g){ try { g = +localStorage.getItem('ws_megrade'); } catch(e){} } home(g || 9); }
  }
})();
