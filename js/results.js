/* Математикийн ажлын хуудас — дүн цуглуулах (Google Sheets / Apps Script)
   Сурагч: «Шалгах» дарахад дүн автоматаар илгээгдэнэ.
   Багш: «Дүн» хэсэгт нууц үгээрээ нэвтэрч код бүрийн дүн, даалгаврын шинжилгээг харна. */
(function(){
  const URL0 = () => ((window.APP_CONFIG || {}).RESULTS_URL || '').trim();
  const R = { key: '', codes: null, rows: null, code: '', loading: false, error: '', firstOnly: true, sort: 'name' };
  try { R.key = localStorage.getItem('ws_tkey') || ''; } catch(e){}

  /* ---------- Сурагч: дүн илгээх ---------- */
  const plain = h => String(h).replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

  function payload(){
    const n = S.items.length, ok = S.results.filter(x => x === true).length;
    const detail = S.results.map(x => x === true ? '1' : x === false ? '0' : '-').join('');
    const tag = S.limit ? `[Хугацаа ${S.limit} мин${S.timedOut ? ', дууссан' : ''}] ` : '';
    const answers = tag + S.items.map((p, i) => `${i + 1}) ${p.mc ? (S.choice[i] == null ? '—' : LETTER[S.choice[i]]) : ((S.answers[i] || '').trim() || '—')}`).join('; ');
    return {
      code: code(), grade: S.grade, topic: plain(topicTitle()), level: LV[S.level], form: formLabel(),
      name: $('stName').value.trim(), group: $('stClass').value.trim(),
      score: ok, total: n, minutes: S.startedAt ? (Date.now() - S.startedAt) / 60000 : 0,
      missed: S.results.map((x, i) => x === true ? null : i + 1).filter(Boolean).join(', '),
      detail, answers
    };
  }
  function setSend(st){
    S.sendState = st;
    const el = document.getElementById('autoStatus');
    if(el) el.outerHTML = sendStateHTML(); else if(S.checked) render();
  }
  window.sendStateHTML = () => {
    const st = S.sendState; if(!st) return '';
    return `<div class="status ${st.cls || ''}" id="autoStatus" role="status">${esc(st.text)}${st.retry ? ' <button class="btn ghost" id="retrySend" type="button" style="margin-left:8px">Дахин илгээх</button>' : ''}</div>`;
  };
  window.submitResult = async function(){
    const url = URL0(); if(!url) return;
    const data = payload();
    setSend({text: 'Дүнг багшид илгээж байна…'});
    try {
      const res = await fetch(url, {method: 'POST', body: JSON.stringify(data)});
      const j = await res.json();
      if(j && j.ok) setSend({text: `Дүн багшид хүрлээ ✓${j.attempt > 1 ? ' (' + j.attempt + '-р оролдлого)' : ''}`, cls: 'ok'});
      else if(j && j.error === 'code') setSend({text: 'Багшийн дүнгийн скрипт хуучин хувилбартай тул энэ кодыг хүлээж авсангүй. «Мессежээр илгээх»-ээр илгээж, багшдаа мэдэгдэнэ үү.', cls: 'err', retry: true});
      else setSend({text: 'Дүн хадгалагдсангүй (' + ((j && j.error) || 'алдаа') + '). Дахин оролдоно уу.', cls: 'err', retry: true});
    } catch(e){
      // Хариуг уншиж чадаагүй ч хүсэлт хүрсэн байж болно — CORS-гүй горимоор дахин илгээхгүй, давхардлаас сэргийлнэ.
      if(navigator.onLine === false) setSend({text: 'Интернэт холболт алга. Холбогдсоны дараа «Дахин илгээх» дарна уу.', cls: 'err', retry: true});
      else setSend({text: 'Дүнг багшийн хүснэгт хүлээж авсангүй. «Дахин илгээх» дарна уу; болохгүй бол «Мессежээр илгээх»-ээр илгээж, багшдаа «Дүн → Холболт шалгах»-ыг хийлгэнэ үү.', cls: 'err', retry: true});
    }
  };
  document.addEventListener('click', e => { if(e.target.closest('#retrySend')) submitResult(); });

  /* ---------- Холболт шалгах ---------- */
  async function diagnose(){
    const url = URL0();
    if(!url) return {ok: false, msg: 'js/config.js доторх RESULTS_URL хоосон байна.'};
    if(/docs\.google\.com\/spreadsheets/.test(url)) return {ok: false, msg: 'RESULTS_URL-д хүснэгтийн хаяг орсон байна. Apps Script-ийн «Новое развертывание → Веб-приложение»-ээс гарсан …/exec хаягийг оруулна уу.'};
    if(/\/dev(\?|$)/.test(url)) return {ok: false, msg: 'RESULTS_URL нь /dev-ээр төгссөн байна. Байршуулалтаас гарсан …/exec хаягийг оруулна уу.'};
    if(!/^https:\/\/script\.google(usercontent)?\.com\/.+\/exec$/.test(url)) return {ok: false, msg: 'RESULTS_URL буруу хэлбэртэй: ' + url + ' — «https://script.google.com/macros/s/…/exec» хэлбэртэй байх ёстой (зай, илүү тэмдэггүй).'};
    let res, text;
    try { res = await fetch(url + '?action=ping'); text = await res.text(); }
    catch(e){ return {ok: false, msg: 'Скрипт хандалт зөвшөөрөхгүй байна. Apps Script → Управление развертываниями → ✏️ → «У кого есть доступ: Все» (Anyone) болгож, «Версия: Новая версия» сонгоод «Развернуть» дарна уу. Сургуулийн (Workspace) бүртгэлд «Все» сонголт байхгүй бол хувийн Gmail бүртгэлээр скриптээ үүсгэнэ үү.'}; }
    let j = null; try { j = JSON.parse(text); } catch(e){}
    if(j && j.ok && j.app === 'ajlyn-khuudas') return (j.v || 1) < 2 ? {ok: false, msg: 'Холболт хэвийн, гэхдээ скрипт хуучин хувилбартай: «10+5» хэлбэрийн шинэ кодтой дүнг хүлээж авахгүй. apps-script/Code.gs-ийн шинэ кодыг хуулж тавиад «Управление развертываниями → ✏️ → Новая версия → Развернуть» хийнэ үү.'} : {ok: true, msg: 'Холболт хэвийн ✓ Скрипт ажиллаж байна.'};
    if(j && j.ok === false && j.error === 'key') return {ok: false, msg: 'Скрипт хуучин хувилбартай байна. Code.gs-ийг шинэчлээд «Управление развертываниями → ✏️ → Новая версия → Развернуть» хийнэ үү.'};
    if(/<html/i.test(text || '')) return {ok: false, msg: 'Скриптээс HTML хуудас ирлээ (нэвтрэх хуудас эсвэл алдаа). Хандах эрх «Все» эсэх, Code.gs бүтэн хадгалагдсан эсэхийг шалгаад шинэ хувилбараар дахин байршуулна уу.'};
    return {ok: false, msg: 'Скриптийн хариу танигдсангүй (HTTP ' + (res && res.status) + ').'};
  }
  R.diag = null;
  document.addEventListener('click', async e => {
    if(!e.target.closest('#resDiag')) return;
    R.diag = {ok: null, msg: 'Шалгаж байна…'}; renderResults();
    R.diag = await diagnose(); renderResults();
  });
  const diagHTML = () => `<div class="row" style="align-items:center"><button class="btn ghost" id="resDiag" type="button">Холболт шалгах</button><span class="small">Хаяг: ${esc(URL0() || '—')}</span></div>
    ${R.diag ? `<div class="status ${R.diag.ok ? 'ok' : R.diag.ok === false ? 'err' : ''}">${esc(R.diag.msg)}</div>` : ''}`;

  /* ---------- Багш: «Дүн» хэсэг ---------- */
  async function api(params){
    const u = URL0() + (URL0().includes('?') ? '&' : '?') + new URLSearchParams(params).toString();
    const res = await fetch(u); return res.json();
  }
  async function loadCodes(){
    R.loading = true; R.error = ''; renderResults();
    try {
      const j = await api({action: 'list', key: R.key});
      if(!j.ok){ R.error = j.error === 'key' ? 'Нууц үг буруу байна.' : 'Алдаа: ' + j.error; R.codes = null; }
      else { R.codes = j.codes; try { localStorage.setItem('ws_tkey', R.key); } catch(e){} }
    } catch(e){ R.error = 'Хүснэгттэй холбогдож чадсангүй. Доорх «Холболт шалгах» товчийг дарж шалтгааныг харна уу.'; }
    R.loading = false; renderResults();
  }
  async function loadCode(c){
    R.code = c; R.loading = true; R.error = ''; R.rows = null; renderResults();
    try {
      const j = await api({key: R.key, code: c});
      if(!j.ok) R.error = j.error === 'key' ? 'Нууц үг буруу байна.' : 'Алдаа: ' + j.error; else R.rows = j.rows;
    } catch(e){ R.error = 'Хүснэгттэй холбогдож чадсангүй.'; }
    R.loading = false; renderResults();
  }

  function setupHTML(){
    return `<section class="paper res"><h2 class="p-topic" style="font-size:24px">Дүн автоматаар цуглуулах</h2>
      <p>Сурагчдын дүнг багшийн Google Sheets хүснэгтэд автоматаар хадгалахын тулд нэг удаа тохируулна:</p>
      <ol class="res-steps">
        <li>Google Sheets дээр шинэ хүснэгт үүсгээд <b>Extensions → Apps Script</b> нээнэ.</li>
        <li>Сайтын код доторх <code>apps-script/Code.gs</code> файлын агуулгыг хуулж тавиад <code>TEACHER_KEY</code>-г өөрийн нууц үгээр солино.</li>
        <li><b>Deploy → New deployment → Web app</b>, <i>Execute as: Me</i>, <i>Who has access: Anyone</i> сонгоод байршуулна.</li>
        <li>Гарсан <code>…/exec</code> хаягийг GitHub дээрх <code>js/config.js</code> файлын <code>RESULTS_URL</code>-д хуулж хадгална.</li>
      </ol>
      <p class="small">Дэлгэрэнгүй заавар README.md-ийн «Дүн цуглуулах» хэсэгт байна.</p></section>`;
  }
  function loginHTML(){
    return `<section class="paper res"><h2 class="p-topic" style="font-size:24px">Багшийн дүн</h2>
      <form id="keyForm" class="res-login">
        <label class="f" for="tkey">Багшийн нууц үг<input type="password" id="tkey" autocomplete="current-password" value="${esc(R.key)}"></label>
        <button class="btn" type="submit">Нэвтрэх</button>
      </form>
      ${R.error ? `<div class="status err">${esc(R.error)}</div>` : ''}
      <p class="small">Нууц үг нь Apps Script доторх TEACHER_KEY. Энэ төхөөрөмж дээр хадгалагдана.</p>
      ${diagHTML()}</section>`;
  }
  function codesHTML(){
    const cur = code();
    const rows = (R.codes || []).map(c => `<tr><td><button class="linkbtn" data-rcode="${esc(c.code)}">${esc(c.code)}</button></td><td>${esc(c.grade)}</td><td>${Mx(esc(c.topic))}</td><td class="num">${c.count}</td><td class="num">${c.avg}%</td><td>${esc(c.last)}</td></tr>`).join('');
    return `<section class="paper res">
      <div class="res-head"><h2 class="p-topic" style="font-size:24px;margin:0">Илгээсэн дүнгүүд</h2>
        <div class="row"><button class="btn ghost" id="resReload" type="button">Шинэчлэх</button><button class="btn ghost" id="resLogout" type="button">Гарах</button></div></div>
      <p class="small">Одоо сонгосон хуудасны код: <button class="linkbtn" data-rcode="${cur}">${cur}</button></p>
      ${R.codes && R.codes.length ? `<div class="tbl-wrap"><table class="rtable"><thead><tr><th>Код</th><th>Анги</th><th>Сэдэв</th><th class="num">Сурагч</th><th class="num">Дундаж</th><th>Сүүлд</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : '<p>Одоогоор илгээсэн дүн алга. Сурагчдад холбоос өгсний дараа энд гарна.</p>'}
      ${diagHTML()}</section>`;
  }
  function detailHTML(){
    let rows = (R.rows || []).slice();
    const all = rows.length;
    if(R.firstOnly) rows = rows.filter(r => r.attempt === 1);
    rows.sort((a, b) => R.sort === 'score' ? b.pct - a.pct || a.name.localeCompare(b.name) : (a.group + a.name).localeCompare(b.group + b.name, 'mn'));
    const n = rows.length, total = rows[0] ? rows[0].total : 0;
    const avg = n ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / n) : 0;
    const hi = n ? Math.max(...rows.map(r => r.pct)) : 0, lo = n ? Math.min(...rows.map(r => r.pct)) : 0;
    const good = rows.filter(r => r.pct >= 80).length, weak = rows.filter(r => r.pct < 50).length;
    const items = Array.from({length: total}, (_, k) => { const ok = rows.filter(r => r.detail[k] === '1').length; return n ? Math.round(ok / n * 100) : 0; });
    const bars = items.map((v, k) => `<div class="ibar ${v < 50 ? 'low' : v < 80 ? 'mid' : ''}" title="${k + 1}-р даалгавар: ${v}% зөв"><span style="height:${Math.max(4, v)}%"></span><em>${k + 1}</em><b>${v}</b></div>`).join('');
    const weakItems = items.map((v, k) => [v, k + 1]).filter(x => x[0] < 50).map(x => x[1]);
    const body = rows.map((r, i) => `<tr><td class="num">${i + 1}</td><td>${esc(r.name)}</td><td>${esc(r.group)}</td><td class="num"><b>${r.score}</b>/${r.total}</td><td class="num ${r.pct < 50 ? 'bad' : r.pct >= 80 ? 'ok' : ''}">${r.pct}%</td>
      <td class="dots">${[...String(r.detail)].map((c, k) => `<i class="${c === '1' ? 'y' : c === '0' ? 'n' : 'e'}" title="${k + 1}"></i>`).join('')}</td><td class="num">${r.minutes}</td><td class="num">${r.attempt}</td><td>${esc(r.time)}</td></tr>`).join('');
    return `<section class="paper res">
      <div class="res-head"><div><button class="linkbtn" id="resBack" type="button">← Бүх код</button>
        <h2 class="p-topic" style="font-size:24px;margin:4px 0 0">Код ${esc(R.code)}</h2>
        <div class="small">${rows[0] ? Mx(esc(rows[0].topic)) + ' · ' + esc(rows[0].grade) + '-р анги · ' + esc(rows[0].level) : ''}</div></div>
        <div class="row"><button class="btn ghost" id="resReloadCode" type="button">Шинэчлэх</button><button class="btn" id="resCsv" type="button" ${n ? '' : 'disabled'}>Excel (CSV) татах</button></div></div>
      ${n ? `<div class="stats">
        <div><b>${n}</b><span>сурагч</span></div><div><b>${avg}%</b><span>дундаж</span></div>
        <div><b>${hi}% / ${lo}%</b><span>хамгийн их / бага</span></div><div><b>${good}</b><span>80%-иас дээш</span></div><div><b>${weak}</b><span>50%-иас доош</span></div></div>
      <h3 class="res-h3">Даалгавар бүрийн гүйцэтгэл (зөв хариулсан сурагчдын %)</h3>
      <div class="ibars" role="img" aria-label="Даалгавар бүрийн зөв хариултын хувь">${bars}</div>
      ${weakItems.length ? `<p class="small">Ангиараа давтах шаардлагатай: <b>${weakItems.join(', ')}</b>-р даалгавар (50%-иас бага зөв).</p>` : '<p class="small">Бүх даалгаврыг сурагчдын талаас илүү нь зөв гүйцэтгэжээ.</p>'}
      <div class="res-tools"><label class="check"><input type="checkbox" id="resFirst" ${R.firstOnly ? 'checked' : ''}> Зөвхөн эхний оролдлого${all !== n || !R.firstOnly ? '' : ''}</label>
        <label class="f" style="flex-direction:row;align-items:center;gap:8px">Эрэмбэ <select id="resSort"><option value="name" ${R.sort === 'name' ? 'selected' : ''}>Бүлэг, нэрээр</option><option value="score" ${R.sort === 'score' ? 'selected' : ''}>Оноогоор</option></select></label></div>
      <div class="tbl-wrap"><table class="rtable"><thead><tr><th class="num">№</th><th>Нэр</th><th>Бүлэг</th><th class="num">Оноо</th><th class="num">%</th><th>Даалгавар (ногоон — зөв)</th><th class="num">Мин</th><th class="num">Оролд.</th><th>Огноо</th></tr></thead><tbody>${body}</tbody></table></div>`
      : '<p>Энэ кодоор илгээсэн дүн алга.</p>'}
    </section>`;
  }
  window.renderResults = function(){
    const box = $('sheet');
    if(!URL0()){ box.innerHTML = setupHTML(); return; }
    if(R.loading){ box.innerHTML = '<section class="paper res"><p>Ачаалж байна…</p></section>'; return; }
    if(!R.codes && !R.rows) { box.innerHTML = loginHTML(); return; }
    box.innerHTML = (R.code && R.rows ? detailHTML() : codesHTML()) + (R.error ? `<div class="status err">${esc(R.error)}</div>` : '');
  };

  function csv(){
    const rows = (R.rows || []).filter(r => !R.firstOnly || r.attempt === 1);
    const total = rows[0] ? rows[0].total : 0;
    const head = ['Нэр', 'Бүлэг', 'Оноо', 'Нийт', 'Хувь', 'Хугацаа (мин)', 'Оролдлого', 'Огноо', 'Алдсан', ...Array.from({length: total}, (_, k) => `Д${k + 1}`), 'Сурагчийн хариу'];
    const q = v => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [head, ...rows.map(r => [r.name, r.group, r.score, r.total, r.pct, r.minutes, r.attempt, r.time, r.missed, ...Array.from({length: total}, (_, k) => r.detail[k] === '1' ? 1 : 0), r.answers])].map(a => a.map(q).join(','));
    const blob = new Blob(['﻿' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dun-${R.code}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }

  on('tabResults', 'click', () => { S.mode = 'results'; render(); if(URL0() && R.key && !R.codes && !R.loading) loadCodes(); });
  document.addEventListener('submit', e => { if(e.target.id === 'keyForm'){ e.preventDefault(); R.key = $('tkey').value.trim(); if(R.key) loadCodes(); } });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-rcode]'); if(c){ loadCode(c.dataset.rcode); return; }
    if(e.target.closest('#resBack')){ R.code = ''; R.rows = null; loadCodes(); return; }
    if(e.target.closest('#resReload')){ loadCodes(); return; }
    if(e.target.closest('#resReloadCode')){ loadCode(R.code); return; }
    if(e.target.closest('#resCsv')){ csv(); return; }
    if(e.target.closest('#resLogout')){ R.key = ''; R.codes = null; R.rows = null; try { localStorage.removeItem('ws_tkey'); } catch(err){} renderResults(); }
  });
  document.addEventListener('change', e => {
    if(e.target.id === 'resFirst'){ R.firstOnly = e.target.checked; renderResults(); }
    if(e.target.id === 'resSort'){ R.sort = e.target.value; renderResults(); }
  });
})();
