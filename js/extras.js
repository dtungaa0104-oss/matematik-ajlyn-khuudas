/* Нэмэлт: интернэтгүй ажиллах (service worker, суулгах товч), самбарын горим, ангийн хамтын зорилго (сурагчид). */
(function(){
  if(typeof S === 'undefined' || !window.WS) return;

  /* ---------- Интернэтгүй ажиллах ---------- */
  const secure = location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if('serviceWorker' in navigator && secure) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    const host = document.querySelector('.board-text'); if(!host || document.getElementById('installBtn')) return;
    const b = document.createElement('button'); b.id = 'installBtn'; b.type = 'button'; b.className = 'install-btn';
    b.textContent = 'Утсандаа суулгах (интернэтгүй ажиллана)';
    b.addEventListener('click', async () => { if(!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch(err){} deferred = null; b.remove(); });
    host.appendChild(b);
  });
  window.addEventListener('appinstalled', () => { const b = document.getElementById('installBtn'); if(b) b.remove(); });

  /* ---------- Самбарын горим (проектор) ---------- */
  const P = {i: 0, ans: false, sol: false, end: 0, tick: null};
  function projHTML(){
    const p = S.items[P.i]; if(!p) return '';
    const n = S.items.length, left = P.end ? Math.max(0, Math.round((P.end - Date.now()) / 1000)) : null;
    const opts = p.mc ? `<ol class="pj-opts">${p.mc.map((o, k) => `<li class="${P.ans && k === p.ci ? 'right' : ''}"><b>${LETTER[k]}</b><span>${Mx(o)}</span></li>`).join('')}</ol>` : '';
    const meth = (window.METHODS || {})[p.tid];
    const sol = P.sol ? `<div class="pj-sol">${p.sol && p.sol.length ? `<ol>${p.sol.map(x => `<li>${Mx(x)}</li>`).join('')}</ol>` : meth ? `<p>${Mx(meth)}</p>` : '<p>Энэ даалгаврын бодолт алга.</p>'}</div>` : '';
    return `<div class="pj-top"><span class="pj-n">${P.i + 1} / ${n}</span><span class="pj-t">${esc(topicTitle())} · ${LV[S.level]}</span>
        <span class="pj-timer${left === 0 ? ' over' : ''}" aria-live="polite">${left == null ? '' : left === 0 ? 'Хугацаа дууслаа' : '⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0')}</span>
        <span class="pj-tset">${[1, 2, 3, 5].map(m => `<button type="button" data-pjt="${m}">${m} мин</button>`).join('')}</span>
        <button type="button" class="pj-close" data-pj="close" aria-label="Самбарын горимоос гарах">Хаах ✕</button></div>
      <div class="pj-body"><div class="pj-q">${Mx(p.q)}</div>${p.fig ? `<div class="pj-fig">${p.fig}</div>` : ''}${opts}
        ${P.ans ? `<div class="pj-ans">Хариу: <b>${p.mc ? LETTER[p.ci] + ') ' : ''}${Mx(p.show)}</b></div>` : ''}${sol}</div>
      <div class="pj-bot"><button type="button" data-pj="prev" ${P.i ? '' : 'disabled'}>← Өмнөх</button>
        <button type="button" data-pj="ans" class="${P.ans ? 'on' : ''}">${P.ans ? 'Хариуг нуух' : 'Хариу'}</button>
        <button type="button" data-pj="sol" class="${P.sol ? 'on' : ''}">${P.sol ? 'Бодолтыг нуух' : 'Бодолт'}</button>
        <button type="button" data-pj="next" ${P.i < n - 1 ? '' : 'disabled'}>Дараах →</button></div>`;
  }
  function draw(){ const el = document.getElementById('proj'); if(el) el.innerHTML = projHTML(); }
  function openProj(){
    if(!S.items.length) return;
    let el = document.getElementById('proj');
    if(!el){ el = document.createElement('div'); el.id = 'proj'; el.className = 'proj'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Самбарын горим'); document.body.appendChild(el); }
    Object.assign(P, {i: 0, ans: false, sol: false, end: 0}); el.dataset.fs = '0'; el.hidden = false; draw(); document.body.classList.add('pj-open');
    try { if(el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch(e){}
  }
  function closeProj(){ const el = document.getElementById('proj'); if(el) el.hidden = true; document.body.classList.remove('pj-open'); clearInterval(P.tick); P.end = 0; if(document.fullscreenElement) document.exitFullscreen().catch(() => {}); }
  function go(d){ const n = S.items.length; P.i = Math.max(0, Math.min(n - 1, P.i + d)); P.ans = false; P.sol = false; draw(); }
  document.addEventListener('click', e => {
    if(e.target.closest('#projBtn')){ openProj(); return; }
    const t = e.target.closest('[data-pjt]'); if(t){ P.end = Date.now() + Number(t.dataset.pjt) * 60000; clearInterval(P.tick); P.tick = setInterval(() => { const sp = document.querySelector('.pj-timer'); if(!sp){ clearInterval(P.tick); return; } draw(); if(Date.now() >= P.end) clearInterval(P.tick); }, 1000); draw(); return; }
    const b = e.target.closest('[data-pj]'); if(!b) return;
    const a = b.dataset.pj; if(a === 'close') closeProj(); else if(a === 'prev') go(-1); else if(a === 'next') go(1); else if(a === 'ans'){ P.ans = !P.ans; draw(); } else if(a === 'sol'){ P.sol = !P.sol; draw(); }
  });
  document.addEventListener('keydown', e => {
    const el = document.getElementById('proj'); if(!el || el.hidden) return;
    if(e.key === 'ArrowRight' || e.key === 'PageDown'){ go(1); e.preventDefault(); }
    else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){ go(-1); e.preventDefault(); }
    else if(e.key === 'Escape'){ closeProj(); }
    else if(e.key === ' ' || e.key.toLowerCase() === 'h'){ P.ans = !P.ans; draw(); e.preventDefault(); }
    else if(e.key.toLowerCase() === 'b'){ P.sol = !P.sol; draw(); }
  });
  document.addEventListener('fullscreenchange', () => { if(!document.fullscreenElement){ const el = document.getElementById('proj'); if(el && !el.hidden && el.dataset.fs === '1') closeProj(); } else { const el = document.getElementById('proj'); if(el) el.dataset.fs = '1'; } });
  const tools = document.getElementById('onlineTools');
  if(tools && !S.student){
    const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'projBtn'; b.type = 'button'; b.textContent = 'Самбарт гаргах';
    b.title = 'Даалгавруудыг проектор дээр нэг нэгээр нь том үсгээр гаргана';
    tools.appendChild(b);
  }

  /* ---------- Багш: дүн хүлээн авах хаяг (багш бүр өөрийн хүснэгт) ---------- */
  const shareP = document.getElementById('sharePanel');
  if(shareP && !S.student){
    const sec = document.createElement('section'); sec.className = 'panel'; sec.id = 'rurlPanel';
    let saved = ''; try { saved = localStorage.getItem('ws_rurl') || ''; } catch(e){}
    sec.innerHTML = `<h2>Дүн хүлээн авах хүснэгт</h2>
      <p class="small" style="margin:0">Багш бүр өөрийн Google хүснэгттэй ажиллана. Apps Script-ийн «…/exec» хаягаа энд нэг удаа оруулахад таны сурагчдын холбоос, QR код руу автоматаар шингэнэ. Дүн зөвхөн таны хүснэгтэд очно.</p>
      <label class="f" for="rurlIn">Apps Script хаяг<input type="url" id="rurlIn" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(saved)}" autocomplete="off" spellcheck="false"></label>
      <div class="row"><button class="btn" id="rurlSave" type="button">Хадгалах</button><button class="btn ghost" id="rurlClear" type="button">Арилгах</button></div>
      <div class="status" id="rurlStatus"></div>`;
    shareP.parentNode.insertBefore(sec, shareP);
    const st = document.getElementById('rurlStatus');
    const srcText = () => { let u = ''; try { u = localStorage.getItem('ws_rurl') || ''; } catch(e){} const cfg = ((window.APP_CONFIG || {}).RESULTS_URL || '').trim();
      return u ? 'Таны оруулсан хаяг ашиглагдаж байна. Сурагчдын холбоос энэ хүснэгт рүү дүн илгээнэ.' : cfg ? 'Сайтын үндсэн хаяг (js/config.js) ашиглагдаж байна. Өөр багш бол өөрийн хаягаа оруулна уу.' : 'Хаяг оруулаагүй байна. Сурагчдын дүн автоматаар цуглахгүй, зөвхөн мессежээр илгээгдэнэ.'; };
    const say = (t, c) => { st.className = 'status ' + (c || ''); st.textContent = t; };
    say(srcText());
    const after = () => { if(typeof updateShare === 'function') updateShare(); if(window.resultsReset) window.resultsReset(); };
    document.getElementById('rurlSave').addEventListener('click', async () => {
      const v = document.getElementById('rurlIn').value.trim();
      if(!scriptId(v)){ say('Хаяг «https://script.google.com/macros/s/…/exec» хэлбэртэй байх ёстой. Apps Script → Начать развертывание → Управление развертываниями хэсгээс хуулна уу.', 'err'); return; }
      try { localStorage.setItem('ws_rurl', v); } catch(e){}
      after(); say('Хадгалагдлаа. Холболтыг шалгаж байна…');
      try { const j = await (await fetch(v + '?action=ping')).json();
        say(j && j.ok && j.app === 'ajlyn-khuudas' ? `Хадгалагдлаа ✓ Холболт хэвийн (v${j.v || 1}). Одоо «Холбоос хуулах»-аар авсан холбоос таны хүснэгт рүү дүн илгээнэ.` : 'Хадгалагдлаа, гэхдээ скриптээс зөв хариу ирсэнгүй. Code.gs бүтэн хуулагдсан эсэхийг шалгана уу.', j && j.ok ? 'ok' : 'err');
      } catch(e){ say('Хадгалагдлаа, гэхдээ скрипт рүү холбогдож чадсангүй. Байршуулалтын «У кого есть доступ» нь «Все» эсэхийг шалгана уу.', 'err'); }
    });
    document.getElementById('rurlClear').addEventListener('click', () => { try { localStorage.removeItem('ws_rurl'); } catch(e){} document.getElementById('rurlIn').value = ''; after(); say(srcText()); });
  }

  /* ---------- Сурагч: ангийн нэрсийн жагсаалтаас нэрээ сонгох ---------- */
  const normN = v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
  function applyRoster(names){
    const inp = $('stName'); if(!inp) return; let sel = document.getElementById('stNameSel');
    if(!names){ if(sel) sel.remove(); inp.style.display = ''; return; }
    if(!sel){
      sel = document.createElement('select'); sel.id = 'stNameSel'; sel.setAttribute('aria-label', 'Нэрээ жагсаалтаас сонгоно уу');
      inp.insertAdjacentElement('afterend', sel);
      sel.addEventListener('change', () => {
        if(sel.value === '__other'){ inp.style.display = ''; inp.value = ''; inp.focus(); }
        else { inp.style.display = 'none'; inp.value = sel.value; }
        inp.dispatchEvent(new Event('input'));
      });
    }
    const cur = normN(inp.value), hit = names.find(n => normN(n) === cur);
    sel.innerHTML = '<option value="">— Нэрээ сонгоно уу —</option>' + names.map(n => `<option${hit === n ? ' selected' : ''}>${esc(n)}</option>`).join('') + '<option value="__other">Миний нэр жагсаалтад алга</option>';
    if(hit){ inp.style.display = 'none'; inp.value = hit; } else if(cur){ sel.value = '__other'; inp.style.display = ''; } else inp.style.display = 'none';
    sel.disabled = inp.disabled;
  }
  async function loadRoster(){
    const grp = (($('stClass') || {}).value || '').trim();
    if(!S.student || !URL0() || !grp){ applyRoster(null); return; }
    try { const j = await (await fetch(URL0() + (URL0().includes('?') ? '&' : '?') + new URLSearchParams({action: 'roster', group: grp}))).json();
      applyRoster(j && j.ok && Array.isArray(j.names) && j.names.length ? j.names : null);
    } catch(e){ /* хуучин скрипт эсвэл интернэтгүй: нэрээ бичнэ */ }
  }
  if(S.student && typeof window.renderStudent === 'function'){
    const rs = window.renderStudent;
    window.renderStudent = function(){ rs.apply(this, arguments); const sel = document.getElementById('stNameSel'); if(sel) sel.disabled = S.checked; };
  }

  /* ---------- Ангийн хамтын зорилго (сурагчид) ---------- */
  const URL0 = () => window.resultsURL ? window.resultsURL() : '';
  let goalT = null;
  async function loadGoal(){
    const bar = document.getElementById('studentBar'), grp = (($('stClass') || {}).value || '').trim();
    if(!S.student || !bar || !URL0()) return;
    let el = document.getElementById('goalBar');
    if(!grp){ if(el) el.remove(); return; }
    try {
      const r = await fetch(URL0() + (URL0().includes('?') ? '&' : '?') + new URLSearchParams({action: 'goal', group: grp}));
      const j = await r.json(); const g = j && j.ok && j.goal;
      if(!g){ if(el) el.remove(); return; }
      if(!el){ el = document.createElement('div'); el.id = 'goalBar'; el.className = 'goal-bar'; bar.appendChild(el); }
      const pc = Math.min(100, Math.round(g.done / Math.max(1, g.target) * 100));
      el.innerHTML = `<div class="gb-top"><b>${esc(g.label)} ангийн хамтын зорилго${g.title ? ': ' + esc(g.title) : ''}</b><span>${g.done} / ${g.target} зөв даалгавар</span></div>
        <div class="gb-track" role="progressbar" aria-valuemin="0" aria-valuemax="${g.target}" aria-valuenow="${g.done}" aria-label="Ангийн зорилгын биелэлт"><span style="width:${pc}%"></span></div>
        <p class="small">${pc >= 100 ? 'Зорилгодоо хүрлээ! Баяр хүргэе, бүгдээрээ сайн ажилласан байна.' : 'Таны зөв бодсон даалгавар бүр ангийнхаа зорилгод нэмэгдэнэ.'}</p>`;
    } catch(e){ /* скрипт хуучин эсвэл интернэтгүй: зорилгыг харуулахгүй */ }
  }
  if(S.student){
    setTimeout(() => { loadGoal(); loadRoster(); }, 400);
    const sc = document.getElementById('stClass'); if(sc) sc.addEventListener('input', () => { clearTimeout(goalT); goalT = setTimeout(() => { loadGoal(); loadRoster(); }, 900); });
    const cb = document.getElementById('checkBtn'); if(cb) cb.addEventListener('click', () => setTimeout(loadGoal, 3500));
  }
})();
