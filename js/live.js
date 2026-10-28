/* Шууд хяналт (Code.gs v9).
   Сурагч: ажиллаж байх үед даалгавар бүрийн төлөвийг (y — зөв, n — буруу, - — хоосон) 15 секунд тутамд нэг удаа, шалгахад шууд илгээнэ.
   Багш: «Шууд хяналт» самбар 5 секунд тутамд шинэчлэгдэж, хэн хаана явааг, аль даалгавар дээр анги гацаж байгааг харуулна. */
(function(){
  if(typeof S === 'undefined' || !window.WS) return;
  const URL0 = () => (window.resultsURL ? resultsURL() : '');

  /* ---------- Сурагч ---------- */
  if(S.student && !S.daily){
    let last = '', lastAt = 0, timer = null, doneSent = false;
    const pattern = () => S.items.map((p, i) => { const r = p.mc ? (S.choice[i] == null ? null : S.choice[i] === p.ci) : W.check(p, S.answers[i]); return r === true ? 'y' : r === false ? 'n' : '-'; }).join('');
    function ping(done){
      const url = URL0(), name = ($('stName').value || '').trim(); if(!url || !name || !S.items.length) return;
      const p = pattern(); if(!done && p === last) return; if(done && doneSent) return;
      last = p; lastAt = Date.now(); if(done) doneSent = true;
      const s = done ? Math.round(S.results.filter(x => x === true).length / S.items.length * 100) : 0;
      try { fetch(url, {method: 'POST', body: JSON.stringify({action: 'live', code: code(), name, group: ($('stClass').value || '').trim(), p, done: !!done, s}), keepalive: true}).catch(() => {}); } catch(e){}
    }
    const soon = () => { if(S.checked) return; clearTimeout(timer); const wait = Math.max(3000, 15000 - (Date.now() - lastAt)); timer = setTimeout(() => ping(false), wait); };
    document.addEventListener('input', e => { if(e.target.dataset && e.target.dataset.i != null) soon(); });
    document.addEventListener('click', e => { if(e.target.closest('[data-mc]')) setTimeout(soon, 0); if(e.target.closest('#startBtn')) setTimeout(() => ping(false), 300); });
    const sr = window.submitResult;
    if(typeof sr === 'function') window.submitResult = function(){ clearTimeout(timer); ping(true); return sr.apply(this, arguments); };
    setTimeout(() => { if(!S.limit || S.startedAt) ping(false); }, 2500);   // нээсэн даруйд «эхэлсэн» гэж тэмдэглэнэ
    document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden' && !S.checked) { clearTimeout(timer); ping(false); } });
    return;
  }

  /* ---------- Багш: шууд хяналтын самбар ---------- */
  if(S.student) return;
  const L = {on: false, code: '', list: null, now: 0, err: '', hide: false, poll: null, at: 0, old: false};
  const key = () => { try { return localStorage.getItem('ws_tkey') || ''; } catch(e){ return ''; } };
  const ago = ms => { const s = Math.max(0, Math.round(ms / 1000)); return s < 60 ? s + ' сек' : Math.round(s / 60) + ' мин'; };
  function open(){
    if(!URL0()){ alert('Эхлээд «Дүн хүлээн авах хүснэгт» хэсэгт Apps Script-ийн хаягаа хадгална уу.'); return; }
    L.on = true; L.code = code(); L.list = null; L.err = ''; L.old = false;
    let el = document.getElementById('liveBoard');
    if(!el){ el = document.createElement('section'); el.id = 'liveBoard'; el.className = 'live'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'lvTitle'); document.body.appendChild(el); }
    el.hidden = false; document.body.classList.add('live-open'); draw(); load();
    clearInterval(L.poll); L.poll = setInterval(() => { if(document.visibilityState === 'visible') load(); else draw(); }, 5000);
  }
  function close(){ L.on = false; clearInterval(L.poll); const el = document.getElementById('liveBoard'); if(el) el.hidden = true; document.body.classList.remove('live-open'); }
  async function load(){
    const k = key(); if(!k){ L.err = 'key'; draw(); return; }
    try { const u = URL0() + (URL0().includes('?') ? '&' : '?') + new URLSearchParams({action: 'live', key: k, code: L.code});
      const j = await (await fetch(u)).json();
      if(j && j.ok && Array.isArray(j.list)){ L.list = j.list; L.now = j.now || Date.now(); L.at = Date.now(); L.err = ''; }
      else if(j && j.error === 'key') L.err = 'key';
      else { L.err = 'old'; }
    } catch(e){ L.err = 'net'; }
    if(L.on) draw();
  }
  function draw(){
    const el = document.getElementById('liveBoard'); if(!el || !L.on) return;
    const n = S.items.length, list = (L.list || []).slice().sort((a, b) => (a.g + ' ' + a.n).localeCompare(b.g + ' ' + b.n, 'mn'));
    const head = `<div class="lv-top"><div><h2 id="lvTitle">Шууд хяналт</h2><p class="small">${Mx(esc(topicTitle()))} · Код ${esc(L.code)}${L.at ? ` · ${ago(Date.now() - L.at)}-ийн өмнө шинэчлэгдсэн` : ''}</p></div>
      <div class="row"><label class="check"><input type="checkbox" id="lvHide"${L.hide ? ' checked' : ''}> Нэр нуух</label><button class="btn ghost" type="button" id="lvClose">Хаах</button></div></div>`;
    if(L.err === 'key'){ el.innerHTML = `<div class="lv-in">${head}<form id="lvKey" class="row"><label class="f">Багшийн нууц үг<input id="lvKeyIn" type="password" autocomplete="current-password"></label><button class="btn" type="submit">Нэвтрэх</button></form><p class="small">Нууц үг нь Apps Script-ийн TEACHER_KEY. «Дүн» хэсэгт нэг удаа нэвтэрсэн бол дахин асуухгүй.</p></div>`; return; }
    if(L.err === 'old'){ el.innerHTML = `<div class="lv-in">${head}<p class="status err">Шууд хяналт ажиллахын тулд apps-script/Code.gs-ийн шинэ кодыг (v9) хуулж тавиад «Управление развертываниями → ✏️ → Новая версия → Развернуть» хийнэ үү. TEACHER_KEY-ээ хэвээр үлдээгээрэй.</p></div>`; return; }
    if(!L.list){ el.innerHTML = `<div class="lv-in">${head}<p class="status">${L.err === 'net' ? 'Хүснэгттэй холбогдож чадсангүй. Интернэтээ шалгана уу.' : 'Ачаалж байна…'}</p></div>`; return; }
    const now = Date.now() - L.at + L.now;
    const done = list.filter(s => s.d), avg = done.length ? Math.round(done.reduce((x, s) => x + s.s, 0) / done.length) : null;
    const items = Array.from({length: n}, (_, i) => { let y = 0, no = 0; list.forEach(s => { const c = s.p[i]; if(c === 'y') y++; else if(c === 'n') no++; }); return {i, y, no, a: y + no}; });
    const hard = items.filter(x => x.a >= 3).sort((a, b) => a.y / a.a - b.y / b.a)[0];
    const itemsH = items.map(x => { const pc = x.a ? Math.round(x.y / x.a * 100) : null, isH = hard && hard.i === x.i && pc < 70;
      return `<li class="${isH ? 'hard' : ''}"><div class="lv-n">${x.i + 1}${isH ? '<span>Хамгийн хэцүү</span>' : ''}</div><div class="lv-bar" role="img" aria-label="${x.i + 1}-р даалгавар: ${x.a} хариулснаас ${x.y} зөв"><span style="width:${pc || 0}%"></span></div>
        <div class="lv-v">${pc == null ? '<em>хариу алга</em>' : `<b>${pc}%</b> зөв · ${x.y}/${x.a}`}</div><button class="linkbtn small" type="button" data-lvproj="${x.i}">Самбарт</button></li>`; }).join('');
    const rows = list.map((s, k) => { const ans = [...s.p].filter(c => c !== '-').length, ok = [...s.p].filter(c => c === 'y').length, idle = now - s.t;
      const st = s.d ? `<b class="lv-ok">Дууссан · ${s.s}%</b>` : idle > 180000 ? `<span class="lv-idle">${ago(idle)} идэвхгүй</span>` : 'Бодож байна';
      const nm = L.hide ? `Сурагч ${k + 1}` : `${esc(s.n)} <small>${esc(s.g)}</small>`;
      return `<tr class="${s.d ? 'done' : ''}"><td>${nm}</td><td><div class="lv-prog" aria-label="${ans}/${n} хариулсан"><span style="width:${n ? ans / n * 100 : 0}%"></span></div><small>${ans}/${n}</small></td><td class="num">${L.hide ? '' : ok}</td><td>${s.p.split('').map(c => `<i class="lv-c ${c === 'y' ? 'y' : c === 'n' ? 'n' : ''}"></i>`).join('')}</td><td>${st}</td></tr>`; }).join('');
    el.innerHTML = `<div class="lv-in">${head}
      <div class="stats lv-stats"><div><b>${list.length}</b><span>эхэлсэн</span></div><div><b>${list.length - done.length}</b><span>бодож байна</span></div><div><b>${done.length}</b><span>дуусгасан</span></div><div><b>${avg == null ? '—' : avg + '%'}</b><span>дуусгасны дундаж</span></div></div>
      ${list.length ? '' : '<p class="status">Одоогоор сурагч эхлээгүй байна. Сурагчид энэ хуудасны холбоосыг (ижил код) нээж, нэрээ бичээд эхэлмэгц энд гарна.</p>'}
      <h3>Даалгавар бүр</h3><p class="small">Сурагчдын одоогийн хариуг шалгасан дүн (сурагч өөрөө хараахан «Шалгах» дараагүй ч). ${hard && Math.round(hard.y / hard.a * 100) < 70 ? `<b>${hard.i + 1}-р даалгаварт</b> анги хамгийн их алдаж байна. «Самбарт» дарж хамтдаа ярилцаж болно.` : ''}</p>
      <ol class="lv-items">${itemsH}</ol>
      ${list.length ? `<h3>Сурагчид</h3><div class="tbl-wrap"><table class="rtable lv-t"><thead><tr><th>Нэр</th><th>Явц</th><th class="num">Зөв</th><th>Даалгавар</th><th>Төлөв</th></tr></thead><tbody>${rows}</tbody></table></div>` : ''}
      <p class="small">5 секунд тутамд автоматаар шинэчлэгдэнэ. Сурагчийн утаснаас 15 секунд тутамд мэдээлэл ирдэг тул бага зэрэг хоцорч болно.</p></div>`;
  }
  document.addEventListener('click', e => {
    if(e.target.closest('#liveBtn')){ open(); return; }
    if(!L.on) return;
    if(e.target.closest('#lvClose')){ close(); return; }
    const pj = e.target.closest('[data-lvproj]'); if(pj && window.openProjector){ window.openProjector(+pj.dataset.lvproj); }
  });
  document.addEventListener('change', e => { if(e.target.id === 'lvHide'){ L.hide = e.target.checked; draw(); } });
  document.addEventListener('submit', e => { if(e.target.id === 'lvKey'){ e.preventDefault(); const v = document.getElementById('lvKeyIn').value.trim(); if(!v) return; try { localStorage.setItem('ws_tkey', v); } catch(_){} L.err = ''; load(); } });
  let pjWas = false;
  window.addEventListener('keydown', () => { pjWas = document.body.classList.contains('pj-open'); }, true);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && L.on && !pjWas) close(); });
  const sp = document.getElementById('sharePanel');
  if(sp){ const b = document.createElement('button'); b.className = 'btn wide'; b.id = 'liveBtn'; b.type = 'button'; b.textContent = 'Шууд хяналт (хичээлийн үеэр)';
    const anchor = document.getElementById('qrBig'); (anchor ? anchor.parentNode : sp).insertBefore(b, anchor ? anchor.nextSibling : null); }
  window.LIVE = {open, close, load};
})();
