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
  window.openProjector = i => { openProj(); if(i > 0 && i < S.items.length){ P.i = i; draw(); } };
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

/* ---------- Санал хүсэлт, даалгаврын алдаа мэдээлэх ----------
   Илгээх хаяг: APP_CONFIG.FEEDBACK_URL (сайт хөгжүүлэгчийн скрипт) байвал түүнд, үгүй бол багшийн дүн хүлээн авах скрипт рүү.
   Скриптгүй үед бичсэн текстийг хуулж авах боломж өгнө. */
(function(){
  if(typeof S === 'undefined') return;
  const URLF = () => ((window.APP_CONFIG || {}).FEEDBACK_URL || (window.resultsURL ? window.resultsURL() : '') || '').trim();
  const SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '−': '⁻', 'n': 'ⁿ', 'm': 'ᵐ', 'k': 'ᵏ', 'x': 'ˣ', '+': '⁺', '(': '⁽', ')': '⁾'};
  const plain = h => String(h == null ? '' : h).replace(/<sup>(.*?)<\/sup>/g, (m, x) => [...x].every(c => SUP[c]) ? [...x].map(c => SUP[c]).join('') : '^(' + x + ')').replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const KINDS = [['idea', 'Санал, хүсэлт'], ['bug', 'Сайтын алдаа']];
  let ctx = null;
  function dlg(){
    let d = document.getElementById('fbDlg');
    if(!d){ d = document.createElement('dialog'); d.id = 'fbDlg'; d.className = 'fbdlg'; d.setAttribute('aria-labelledby', 'fbTitle'); document.body.appendChild(d);
      d.addEventListener('click', e => { if(e.target === d || e.target.closest('[data-fbclose]')) d.close(); });
      d.addEventListener('submit', e => { e.preventDefault(); send(); }); }
    return d;
  }
  function itemCtx(i){
    const p = S.items[i]; if(!p) return null;
    const ans = p.mc ? (S.choice[i] != null ? LETTER[S.choice[i]] + ') ' + plain(p.mc[S.choice[i]]) : '') : (S.answers[i] || '');
    return {kind: 'item', n: i + 1, code: code(), qh: p.q, q: plain(p.q), ans: plain(ans), right: plain(p.mc ? LETTER[p.ci] + ') ' + p.mc[p.ci] : p.show), st: S.results[i]};
  }
  function open(c){
    ctx = c; const d = dlg(), item = c.kind === 'item', canShow = !S.student || S.reveal || c.st === true;
    d.innerHTML = `<form class="fb-form"><div class="pg-head"><h2 id="fbTitle">${item ? `${c.n}-р даалгаварт алдаа байна уу?` : 'Санал хүсэлт'}</h2><button class="btn ghost" type="button" data-fbclose>Хаах</button></div>
      ${item ? `<div class="fb-item"><div class="fb-q">${Mx(c.qh)}</div><p class="small">Таны хариу: <b>${c.ans ? Mx(esc(c.ans)) : '—'}</b>${canShow ? ` · Сайтын хариу: <b>${Mx(esc(c.right))}</b>` : ''}</p></div>
        <fieldset class="fb-why"><legend>Юу нь буруу байна вэ?</legend>
          ${[['Миний хариу зөв ч «Буруу» гэж гарсан', 'ans'], ['Даалгаврын өгүүлбэр, тоо буруу эсвэл ойлгомжгүй', 'q'], ['Зураг буруу эсвэл харагдахгүй', 'fig'], ['Бодолт, тайлбар алдаатай', 'sol']].map(([t, v], k) => `<label class="check"><input type="radio" name="fbWhy" value="${t}"${k ? '' : ' checked'}> ${t}</label>`).join('')}</fieldset>`
      : `<div class="fb-kinds" role="radiogroup" aria-label="Төрөл">${KINDS.map(([v, t], k) => `<label class="check"><input type="radio" name="fbKind" value="${v}"${k ? '' : ' checked'}> ${t}</label>`).join('')}</div>`}
      <label class="f">${item ? 'Нэмэлт тайлбар (заавал биш)' : 'Юу сайжруулбал зүгээр вэ? Юу ажиллахгүй байна вэ?'}<textarea id="fbNote" rows="4" maxlength="1000" ${item ? '' : 'required'} placeholder="${item ? 'Жишээ: 3/4 гэж бичихэд буруу гэсэн, 0.75 гэвэл зөв гэсэн.' : 'Жишээ: Геометрийн зургийг томруулж болдог болгоорой.'}"></textarea></label>
      <div class="row"><button class="btn" type="submit" id="fbSend">Илгээх</button><span class="small">${URLF() ? (S.student ? 'Багшид тань очно.' : 'Таны Google хүснэгтийн «Санал» хуудсанд хадгалагдана.') : 'Дүн хүлээн авах хүснэгт тохируулаагүй тул илгээх үед текстийг хуулж авна.'}</span></div>
      <div class="status" id="fbStatus" hidden></div></form>`;
    if(d.showModal) d.showModal(); else d.setAttribute('open', '');
    setTimeout(() => { const t = document.getElementById(item ? 'fbSend' : 'fbNote'); if(t) t.focus(); }, 30);
  }
  function say(msg, cls){ const s = document.getElementById('fbStatus'); if(!s) return; s.hidden = false; s.className = 'status ' + (cls || ''); s.textContent = msg; }
  async function send(){
    const c = ctx || {}, note = (document.getElementById('fbNote').value || '').trim();
    const why = document.querySelector('input[name="fbWhy"]:checked'), kind = c.kind === 'item' ? 'item' : ((document.querySelector('input[name="fbKind"]:checked') || {}).value || 'idea');
    if(kind !== 'item' && !note){ say('Саналаа бичнэ үү.', 'err'); return; }
    const data = {action: 'report', kind, code: c.code || (S.items.length ? code() : ''), n: c.n || '', q: c.q || '', ans: c.ans || '', right: c.right || '',
      note: [why ? why.value : '', note].filter(Boolean).join('. '), name: (($('stName') || {}).value || '').trim(), group: (($('stClass') || {}).value || '').trim()};
    const url = URLF(), btn = document.getElementById('fbSend');
    if(!url){
      const txt = [kind === 'item' ? `Даалгаврын алдаа: код ${data.code}, ${data.n}-р даалгавар` : (KINDS.find(k => k[0] === kind) || KINDS[0])[1], data.q, data.ans ? 'Өгсөн хариу: ' + data.ans : '', data.note].filter(Boolean).join('\n');
      try { await navigator.clipboard.writeText(txt); say('Текст хуулагдлаа. Багшдаа мессежээр илгээнэ үү.', 'ok'); } catch(e){ say(txt); }
      return;
    }
    btn.disabled = true; say('Илгээж байна…');
    try { const j = await (await fetch(url, {method: 'POST', body: JSON.stringify(data)})).json();
      if(j && j.ok){ say('Илгээгдлээ. Баярлалаа! Таны мэдээлэл сайтыг сайжруулахад тусална.', 'ok'); setTimeout(() => { const d = document.getElementById('fbDlg'); if(d && d.open) d.close(); }, 1600); return; }
      say(j && j.error === 'code' ? 'Багшийн скрипт хуучин хувилбартай тул хүлээж авсангүй. Багшдаа хэлээрэй.' : 'Илгээж чадсангүй. Дахин оролдоно уу.', 'err');
    } catch(e){ say('Интернэт холболтоо шалгаад дахин оролдоно уу.', 'err'); }
    btn.disabled = false;
  }
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-rep]'); if(r){ const c = itemCtx(Number(r.dataset.rep)); if(c) open(c); return; }
    if(e.target.closest('#fbBtn')) open({kind: 'idea'});
  });
})();

/* ---------- Миний сан: ажлын хуудсыг нэрлэсэн багцад хадгалах, хамт олонтойгоо хуваалцах ----------
   Багц энэ төхөөрөмж дээр (ws_bundles) хадгалагдана. Хуваалцах холбоос: #b-<base64> (нэр, кодууд). */
(function(){
  if(typeof S === 'undefined' || S.student || typeof parseCode !== 'function') return;
  const KEY = 'ws_bundles';
  const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } };
  const save = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch(e){ return false; } };
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dec = s => { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch(e){ return null; } };
  const base = () => location.href.split('#')[0];
  function info(c){
    const r = parseCode(c); if(!r || !W.GRADES.includes(r.grade) || !validTopic(r.grade, r.topic)) return null;
    const sv = [S.grade, S.topic]; let t = ''; try { S.grade = r.grade; S.topic = r.topic; t = topicTitle(); } catch(e){} finally { S.grade = sv[0]; S.topic = sv[1]; }
    return {g: r.grade, t, lv: LV[r.level] || ''};
  }
  const stuLink = c => base() + '#s-' + c + (typeof linkTag === 'function' ? linkTag() : '');
  let msg = '', openIdx = -1;
  function panel(){
    let p = document.getElementById('bundlePanel'); const sp = document.getElementById('sharePanel'); if(!sp) return null;
    if(!p){ p = document.createElement('section'); p.className = 'panel'; p.id = 'bundlePanel'; sp.parentNode.insertBefore(p, sp.nextSibling); }
    return p;
  }
  function draw(){
    const p = panel(); if(!p) return; const B = load(), cur = code();
    const opts = B.map((b, i) => `<option value="${i}">${esc(b.name)} (${b.codes.length})</option>`).join('');
    p.innerHTML = `<h2>Миний сан</h2>
      <p class="small" style="margin:0">Сайн болсон ажлын хуудсаа нэгж, долоо хоног, ангиар нь багцалж хадгална. Дараа нь нэг товшилтоор нээж, сурагчдад холбоосыг нь өгнө. Мэргэжлийн багийнхантайгаа багцаа холбоосоор хуваалцаж болно.</p>
      <form class="bd-add" id="bdAdd"><label class="f">Энэ хуудсыг (${esc(cur)}) нэмэх багц
        <select id="bdSel">${opts}<option value="new"${B.length ? '' : ' selected'}>+ Шинэ багц…</option></select></label>
        <input id="bdName" maxlength="60" placeholder="Шинэ багцын нэр, жишээ: 9-р анги, 2-р нэгж" aria-label="Шинэ багцын нэр"${B.length ? ' hidden' : ''}>
        <button class="btn ghost wide" type="submit">Санд нэмэх</button></form>
      ${msg ? `<div class="status ok" role="status">${esc(msg)}</div>` : ''}
      ${B.length ? `<ul class="bd-list">${B.map((b, i) => `<li><details${i === openIdx ? ' open' : ''} data-bdi="${i}"><summary><b>${esc(b.name)}</b><span>${b.codes.length} хуудас</span></summary>
        <ol>${b.codes.map((c, k) => { const x = info(c); return `<li><a href="#w-${esc(c)}" data-go>${x ? Mx(esc(x.t)) : esc(c)}</a><small>${x ? x.g + '-р анги · ' + esc(x.lv) + ' · ' : ''}${esc(c)}</small>
          <span class="bd-act"><button class="linkbtn small" type="button" data-bdcopy="${esc(c)}">Сурагчийн холбоос</button><button class="linkbtn small" type="button" data-bddel="${i}|${k}" aria-label="Багцаас хасах">Хасах</button></span></li>`; }).join('')}</ol>
        <div class="row"><button class="btn ghost" type="button" data-bdall="${i}">Бүх холбоосыг хуулах</button><button class="btn ghost" type="button" data-bdshare="${i}">Багшид хуваалцах</button><button class="linkbtn small" type="button" data-bdrm="${i}">Багц устгах</button></div></details></li>`).join('')}</ul>` : ''}`;
  }
  async function copy(t, ok){ const done = typeof copyText === 'function' ? await copyText(t) : false; msg = done ? ok : 'Хуулж чадсангүй. ' + t; draw(); }
  document.addEventListener('change', e => { if(e.target.id === 'bdSel'){ const n = document.getElementById('bdName'); n.hidden = e.target.value !== 'new'; if(!n.hidden) n.focus(); } });
  document.addEventListener('submit', e => {
    if(e.target.id !== 'bdAdd') return; e.preventDefault();
    const B = load(), v = document.getElementById('bdSel').value, c = code();
    let i = Number(v);
    if(v === 'new'){ const nm = (document.getElementById('bdName').value || '').trim(); if(!nm){ document.getElementById('bdName').focus(); return; } B.push({name: nm, codes: [], at: Date.now()}); i = B.length - 1; }
    if(B[i].codes.includes(c)) msg = `Энэ хуудас «${B[i].name}» багцад аль хэдийн бий.`;
    else { B[i].codes.push(c); msg = `«${B[i].name}» багцад нэмэгдлээ (${B[i].codes.length} хуудас).`; }
    save(B); openIdx = i; draw();
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-bdcopy],[data-bddel],[data-bdall],[data-bdshare],[data-bdrm],[data-bdsave]'); if(!t) return;
    const B = load(), d = t.dataset;
    if(d.bdcopy){ copy(stuLink(d.bdcopy), 'Сурагчийн холбоос хуулагдлаа.'); return; }
    if(d.bddel){ const [i, k] = d.bddel.split('|').map(Number); B[i].codes.splice(k, 1); save(B); openIdx = i; msg = ''; draw(); return; }
    if(d.bdrm){ const i = Number(d.bdrm); if(!confirm(`«${B[i].name}» багцыг устгах уу? Ажлын хуудсууд өөрсдөө устахгүй, кодоор нь дахин нээж болно.`)) return; B.splice(i, 1); save(B); openIdx = -1; msg = 'Багц устгагдлаа.'; draw(); return; }
    if(d.bdall){ const b = B[Number(d.bdall)]; openIdx = Number(d.bdall);
      copy(b.name + '\n' + b.codes.map((c, k) => { const x = info(c); return `${k + 1}. ${x ? x.t.replace(/<[^>]+>/g, '') + ' (' + x.lv + ')' : c}: ${stuLink(c)}`; }).join('\n'), `«${b.name}» багцын ${b.codes.length} холбоос хуулагдлаа. Messenger, Classroom-д шууд тавина.`); return; }
    if(d.bdshare){ const b = B[Number(d.bdshare)]; openIdx = Number(d.bdshare); copy(base() + '#b-' + enc({n: b.name, c: b.codes}), `«${b.name}» багцыг хуваалцах холбоос хуулагдлаа. Хамт ажилладаг багшдаа илгээнэ үү. Холбоосыг нээхэд багц харагдаж, өөрийн санд хадгалж болно.`); return; }
    if(d.bdsave != null){ const sh = window.__bundleIn; if(!sh) return; let nm = sh.n, k = 2; while(B.some(b => b.name === nm)) nm = sh.n + ' (' + (k++) + ')';
      B.push({name: nm, codes: sh.c, at: Date.now()}); save(B); openIdx = B.length - 1; msg = `«${nm}» багц таны санд хадгалагдлаа.`; const dl = document.getElementById('bdDlg'); if(dl) dl.close(); history.replaceState(null, '', location.pathname + location.search); draw(); const p = panel(); if(p) p.scrollIntoView({block: 'nearest'}); }
  });
  /* Хуваалцсан багц нээх: #b-... */
  const m = (location.hash || '').match(/^#b-([A-Za-z0-9_-]{4,6000})$/), sh = m && dec(m[1]);
  if(sh && typeof sh.n === 'string' && Array.isArray(sh.c)){
    sh.n = sh.n.slice(0, 60); sh.c = sh.c.filter(c => typeof c === 'string' && info(c)).slice(0, 60); window.__bundleIn = sh;
    const dl = document.createElement('dialog'); dl.id = 'bdDlg'; dl.className = 'fbdlg'; dl.setAttribute('aria-labelledby', 'bdTitle'); document.body.appendChild(dl);
    dl.innerHTML = `<div class="fb-form"><div class="pg-head"><h2 id="bdTitle">«${esc(sh.n)}» багц</h2><button class="btn ghost" type="button" data-bdclose>Хаах</button></div>
      <p class="small" style="margin:0">Хамт ажилладаг багш тань ${sh.c.length} ажлын хуудастай багц хуваалцжээ. Хуудас бүрийг нээж харах, эсвэл бүхэлд нь өөрийн санд хадгалж болно.</p>
      <ol class="bd-in">${sh.c.map(c => { const x = info(c); return `<li><a href="#w-${esc(c)}" data-go>${Mx(esc(x.t))}</a><small>${x.g}-р анги · ${esc(x.lv)} · ${esc(c)}</small></li>`; }).join('')}</ol>
      <div class="row"><button class="btn" type="button" data-bdsave>Миний санд хадгалах</button></div></div>`;
    dl.addEventListener('click', e => { if(e.target === dl || e.target.closest('[data-bdclose]')) dl.close(); });
    if(dl.showModal) dl.showModal(); else dl.setAttribute('open', '');
  }
  draw();
  if(typeof window.build === 'function' && !window.build.__bd){ const b0 = window.build; window.build = function(){ const r = b0.apply(this, arguments); msg = ''; draw(); return r; }; window.build.__bd = true; }
})();

/* ---------- Багшийн заавар ---------- */
(function(){
  if(typeof S === 'undefined') return;
  const SEC = [
    ['Хичээлийн өмнө', `<ol>
      <li><b>Анги, сэдэв, түвшнээ сонго.</b> Мэдлэг, ойлголт → Чадвар → Хэрэглээ гэсэн гурван түвшин бий. Сэдвийн оронд «… агуулгын холимог»-ийг сонговол нэгжийн бүх сэдвээс орно.</li>
      <li><b>Нэгжийн шалгалт</b>: «Түвшин»-ий доорх хэсэгт түвшин бүрийн даалгаврын тоог сонгоод «Нэгжийн шалгалт үүсгэх» дар. Нэг хуудсанд гурван түвшин орж, дүн нь түвшин тус бүрээр гарна.</li>
      <li><b>Хэвлэх бол</b> «Хэвлэх (PDF)» хэсгээс хувилбарын тоо (А, Б, В, Г), хариултын түлхүүр, QR кодыг сонго. QR-ыг сурагч утсаараа уншуулбал яг тэр хувилбарын хариугаа оруулж, автоматаар шалгуулна.</li>
      <li><b>Миний сан</b>: сайн болсон хуудсаа нэгж, долоо хоногоор багцалж хадгал. Багцаа «Багшид хуваалцах» холбоосоор мэргэжлийн багтайгаа хуваалцана.</li>
      <li><b>Нэрсийн жагсаалт</b> («Дүн» хэсэгт) оруулбал сурагчид нэрээ жагсаалтаас сонгоно, ажил илгээгээгүй сурагчид харагдана.</li></ol>`],
    ['Хичээлийн үеэр', `<ol>
      <li><b>Сурагчдад өгөх</b>: «Сурагчдад цахимаар өгөх» хэсгийн холбоосыг хуулж Messenger, Classroom-д тавь, эсвэл «QR кодыг самбарт томоор гаргах». Шаардлагатай бол гүйцэтгэх хугацаа тавь.</li>
      <li><b>Халаалт</b>: «Хурдан тооцоо» (60 секунд, цээжээр) эсвэл «Өдрийн бодлого»-ын холбоосыг ашигла. Хурдан тооцоог самбарт нээж ангиараа өрсөлдүүлж болно.</li>
      <li><b>Шууд хяналт</b> товч сурагчид бодож байх үед хэн хаана явааг, аль даалгавар дээр анги алдаж байгааг 5 секунд тутам харуулна. «Самбарт» дарж тэр даалгаврыг хамтдаа ярилцана. Проектор дээр гаргахдаа «Нэр нуух»-ыг сонго.</li>
      <li><b>Самбарт гаргах</b> товч ажлын хуудсыг проектор дээр нэг нэгээр нь томоор харуулна. ← → товчоор шилжиж, H (эсвэл зай) товчоор хариуг, B товчоор бодолтыг нээнэ.</li>
      <li>Сурагч «Шалгах» дармагц дүн нь хуудасны доор гарч, 80%-д хүрвэл дараагийн түвшин нээгдэнэ. Хүрэхгүй бол ижил түвшний шинэ хувилбар өгнө.</li>
      <li><b>Сурагчийн хувийн зам</b>ын холбоосыг нэг удаа өг. Сурагч бүр өөрийн дүнд тохирсон зөвлөмж (давтлага, суурь сэдэв, үргэлжлүүлэх сэдэв) болон 3 дараалан зөв бол ахиж, 2 дараалан алдвал буурдаг <b>дасан зохицох дасгал</b> хийнэ.</li>
      <li>«Анги» хэсгийн <b>ЭЕШ</b> товчийг дарж ЭЕШ-ийн бүтэцтэй сорилын холбоос, QR-ыг өгвөл (эсвэл PDF хэвлэвэл) бүх сурагч ижил сорил (36 сонгох + 4 задгай, 100 оноо) авч, «Дүн» хэсэгт агуулга бүрийн дүн гарна.</li>
      <li>80%-д хүрээгүй сэдэв сурагчийн <b>алдааны дэвтэрт</b> автоматаар орж, 2 ба 7 хоногийн дараа давтахыг сануулна.</li></ol>`],
    ['Хичээлийн дараа', `<ol>
      <li><b>Дүн → Ангийн хүснэгт</b>: сурагч × нэгж × түвшний дүн нэг дор. «Анхаарах сурагчид» дээр 50%-иас бага авсан, дүн нь буурсан сурагчид гарна.</li>
      <li>Улаан нүд, нэгж дээр дарвал тухайн нэгж, түвшний <b>давтлагын холбоос</b> хуулагдана. Түүнийг тухайн сурагчид илгээ.</li>
      <li><b>Код бүрээр</b> харахад «Түгээмэл алдаа», «Түвшнээр бүлэглэх» (гурван бүлэгт тус тусын холбоос) гарна. Хоцрогдсон сурагчидтайгаа ажиллахад ашигла.</li>
      <li>Сурагчийн нэр дээр дарвал <b>ахицын график</b>, бүх ажил, эцэг эхэд өгөх PDF тайлан гарна.</li>
      <li>«Санал хүсэлт, алдааны мэдээлэл»-д сурагчдын «Даалгаварт алдаа байна уу?» гэж илгээсэн мэдээлэл ирнэ.</li></ol>`],
    ['Улирлын төгсгөлд', `<p>«Дүн» хэсгийн «Улирал архивлах»-аар одоогийн дүнг тусдаа хуудас руу шилжүүл. Архивлахаас өмнө Excel (CSV) хуулбар татаж ав. Архивыг дараа нь «Харах»-аар нээнэ.</p>`],
    ['Тохиргоо (нэг удаа)', `<ol>
      <li>Google хүснэгт үүсгээд Өргөтгөл → Apps Script-д <code>apps-script/Code.gs</code>-ийн кодыг хуулж, <code>TEACHER_KEY</code>-г өөрийн нууц үгээр соль.</li>
      <li>Байршуулах → Шинэ байршуулалт → Вэб апп (Би, Хэн ч). Гарсан «…/exec» хаягийг «Дүн хүлээн авах хүснэгт» хэсэгт хадгал.</li>
      <li>Кодыг шинэчлэх бүрт <b>«Управление развертываниями → ✏️ → Новая версия → Развернуть»</b> хийнэ («Новое развертывание» биш, тэгвэл хаяг өөрчлөгдөнө). <code>TEACHER_KEY</code>-ээ хэвээр үлдээхээ мартуузай.</li>
      <li>«Дүн» хэсгийн «Холболт шалгах» товч скриптийн хувилбарыг харуулна.</li></ol>`],
    ['Түгээмэл асуулт', `<dl>
      <dt>Сурагч нэрээ өөрөөр бичвэл?</dt><dd>Түүх нь тасарна. Нэрсийн жагсаалт оруулбал сурагч нэрээ сонгох тул ийм алдаа гарахгүй.</dd>
      <dt>Интернэт тасарвал?</dt><dd>Дүн сурагчийн утсанд хадгалагдаж, интернэт орж ирэхэд автоматаар илгээгдэнэ. Сайт өөрөө ч нэг удаа нээгдсэний дараа интернэтгүй ажиллана.</dd>
      <dt>Сурагч утсаа солибол од, тэмдэг, алдааны дэвтэр?</dt><dd>Эдгээр нь тухайн төхөөрөмж дээр хадгалагддаг. Дүн нь багшийн хүснэгтэд үлдэнэ.</dd>
      <dt>Код гэж юу вэ?</dt><dd>Хуудас бүрийн давтагдашгүй дугаар. Ижил кодоор нээвэл яг ижил даалгавар гарна. «Кодоор нээх» хэсэгт бичиж нээнэ.</dd>
      <dt>Даалгаварт алдаа олдвол?</dt><dd>Шалгасны дараа даалгаврын доорх «Даалгаварт алдаа байна уу?»-аар мэдээлнэ. Таны хүснэгтийн «Санал» хуудсанд хадгалагдана.</dd></dl>`],
    ['Эхний 2 долоо хоногийн туршилт', `<ol>
      <li>Нэг ангид эхэлж, нэрсийн жагсаалт оруулаад нэг сэдвийг гурван түвшнээр нь өг.</li>
      <li>Долоо хоногийн эцэст «Анхаарах сурагчид»-д гарсан сурагчдад давтлагын холбоос илгээ.</li>
      <li>Хоёр дахь долоо хоногт нэгжийн шалгалт аваад ахицын графикийг хар.</li>
      <li>Сурагчдаас «Санал хүсэлт» товчоор юу таалагдсан, юу хэцүү байсныг асуу. Хариуг нь хүснэгтийн «Санал» хуудаснаас харна.</li></ol>`]
  ];
  function open(){
    let d = document.getElementById('guideDlg');
    if(!d){ d = document.createElement('dialog'); d.id = 'guideDlg'; d.className = 'progdlg guide'; d.setAttribute('aria-labelledby', 'guideTitle'); document.body.appendChild(d);
      d.addEventListener('click', e => { if(e.target === d || e.target.closest('[data-close]')) d.close(); });
      d.innerHTML = `<div class="pg-head"><div><h2 id="guideTitle">Багшийн заавар</h2><p class="small">Сайтыг хичээлдээ хэрхэн ашиглах товч заавар</p></div><button class="btn ghost" type="button" data-close>Хаах</button></div>
        ${SEC.map(([h, b], i) => `<details${i ? '' : ' open'}><summary>${h}</summary><div class="gd-body">${b}</div></details>`).join('')}`; }
    if(d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  document.addEventListener('click', e => { if(e.target.closest('#guideBtn')) open(); });
  if(location.hash === '#guide') setTimeout(open, 50);
})();
