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

  /* ---------- Ангийн хамтын зорилго (сурагчид) ---------- */
  const URL0 = () => ((window.APP_CONFIG || {}).RESULTS_URL || '').trim();
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
    setTimeout(loadGoal, 400);
    const sc = document.getElementById('stClass'); if(sc) sc.addEventListener('input', () => { clearTimeout(goalT); goalT = setTimeout(loadGoal, 900); });
    const cb = document.getElementById('checkBtn'); if(cb) cb.addEventListener('click', () => setTimeout(loadGoal, 3500));
  }
})();
