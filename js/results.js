/* Математикийн ажлын хуудас — дүн цуглуулах (Google Sheets / Apps Script)
   Сурагч: «Шалгах» дарахад дүн автоматаар илгээгдэнэ.
   Багш: «Дүн» хэсэгт нууц үгээрээ нэвтэрч код бүрийн дүн, даалгаврын шинжилгээг харна. */
(function(){
  const URL0 = () => ((window.APP_CONFIG || {}).RESULTS_URL || '').trim();
  const R = { key: '', codes: null, rows: null, code: '', loading: false, error: '', firstOnly: true, sort: 'name', view: 'class', all: null, cg: 0, cgrp: '', stu: '', prog: '', note: '' };
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

  /* Ангийн хүснэгтэд бүх дүнг ачаалах. Шинэ скрипт (v3) нэг хүсэлтээр өгнө; хуучин скрипт бол код бүрээр татна. */
  async function loadAll(){
    R.loading = true; R.error = ''; R.prog = ''; renderResults();
    try {
      const j = await api({key: R.key, all: 1});
      if(!j.ok){ R.error = j.error === 'key' ? 'Нууц үг буруу байна.' : 'Алдаа: ' + j.error; R.all = null; }
      else {
        try { localStorage.setItem('ws_tkey', R.key); } catch(e){}
        R.codes = j.codes || R.codes || [];
        if(Array.isArray(j.rows)) R.all = j.rows;
        else {
          const q = R.codes.map(c => c.code), out = [], n = q.length; let done = 0;
          const worker = async () => { while(q.length){ const c = q.shift(); try { const k = await api({key: R.key, code: c}); if(k.ok) out.push(...k.rows); } catch(e){} done++; R.prog = done + '/' + n; renderResults(); } };
          await Promise.all(Array.from({length: Math.min(5, n)}, worker));
          R.all = out;
        }
      }
    } catch(e){ R.error = 'Хүснэгттэй холбогдож чадсангүй. Доорх «Холболт шалгах» товчийг дарж шалтгааныг харна уу.'; }
    R.loading = false; renderResults();
  }

  /* ---------- Ангийн хүснэгт: сурагч × нэгж × түвшин ---------- */
  const NK = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  function unitOf(c){
    const a = String(c).split('-').map(Number), g = a[0], t = a[1], l = a[2];
    let ch = null;
    if(t === 0) ch = 0; else if(t > 100) ch = t - 100; else { const tp = (W.topicsOf(g) || [])[t - 1]; ch = tp && tp.ch != null ? tp.ch : null; }
    return {g, t, l, ch};
  }
  const pctCls = v => v >= 80 ? 'g' : v >= 50 ? 'm' : 'b';
  function classModel(){
    const all = (R.all || []).map(r => Object.assign({}, r, {u: unitOf(r.code)})).filter(r => W.GRADES.includes(r.u.g) && r.u.ch != null && LV[r.u.l]);
    const grades = [...new Set(all.map(r => r.u.g))].sort((a, b) => a - b);
    if(!grades.includes(R.cg)){ const last = all.reduce((m, r) => !m || r.time > m.time ? r : m, null); R.cg = last ? last.u.g : 0; }  // хамгийн сүүлд дүн ирсэн анги
    const inG = all.filter(r => r.u.g === R.cg);
    const groups = [...new Map(inG.filter(r => NK(r.group)).map(r => [NK(r.group), String(r.group).trim()])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'mn'));
    if(R.cgrp && !groups.some(x => x[0] === R.cgrp)) R.cgrp = '';
    const rs = inG.filter(r => !R.cgrp || NK(r.group) === R.cgrp).sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    const chs = chaptersOf(R.cg) || {}, keys = Object.keys(chs).map(Number);
    const cols = keys.map((ch, i) => ({ch, no: i + 1, name: chs[ch]}));
    if(rs.some(r => r.u.ch === 0)) cols.push({ch: 0, no: 0, name: 'Холимог давтлага'});
    const colName = c => (c.no ? c.no + '. ' : '') + c.name;
    const st = new Map();
    rs.forEach(r => {
      const k = NK(r.name) + '|' + NK(r.group);
      let s = st.get(k); if(!s) st.set(k, s = {k, name: String(r.name).trim(), group: String(r.group).trim(), cells: {}, list: []});
      s.list.push(r);
      const c = s.cells[r.u.ch] || (s.cells[r.u.ch] = {1: [], 2: [], 3: []});
      c[r.u.l].push(r.pct);
    });
    const students = [...st.values()];
    students.forEach(s => {
      const lasts = []; s.flags = [];
      cols.forEach(c => { const cell = s.cells[c.ch]; if(!cell) return;
        [1, 2, 3].forEach(l => { const a = cell[l]; if(!a.length) return; const v = a[a.length - 1]; lasts.push(v);
          if(v < 50) s.flags.push({ch: c.ch, l, kind: 'low', text: `${colName(c)} · ${LV[l]}: ${v}%`});
          else if(a.length > 1 && v <= a[a.length - 2] - 15) s.flags.push({ch: c.ch, l, kind: 'down', text: `${colName(c)} · ${LV[l]}: ${a[a.length - 2]}% → ${v}%`});
        });
      });
      s.avg = lasts.length ? Math.round(lasts.reduce((x, y) => x + y, 0) / lasts.length) : null;
      s.base = s.flags.some(f => f.kind === 'low' && f.l === 1);
    });
    students.sort((a, b) => (a.group + ' ' + a.name).localeCompare(b.group + ' ' + b.name, 'mn'));
    const colAvg = cols.map(c => [1, 2, 3].map(l => { const v = students.map(s => s.cells[c.ch] && s.cells[c.ch][l]).filter(a => a && a.length).map(a => a[a.length - 1]); return v.length ? {avg: Math.round(v.reduce((x, y) => x + y, 0) / v.length), n: v.length} : null; }));
    const watch = students.filter(s => s.flags.length || (s.avg != null && s.avg < 50)).sort((a, b) => (b.base - a.base) || (a.avg - b.avg));
    return {grades, groups, cols, colName, students, colAvg, watch, rs};
  }
  const repLink = (g, ch, l) => location.origin + location.pathname + `#s-${g}-${ch ? 100 + ch : 0}-${l}-5+5-${1000 + Math.floor(Math.random() * 98000)}`;
  const flagBtn = (f, g) => `<button class="flag ${f.kind}" type="button" data-replink="${g}|${f.ch}|${f.l}" title="Энэ нэгж, түвшний давтлагын хуудасны холбоосыг хуулах">${f.kind === 'down' ? '↓ ' : ''}${esc(f.text)}</button>`;
  function viewSwitch(){
    return `<div class="seg res-view" role="group" aria-label="Дүнг харах хэлбэр"><button type="button" data-rview="class" aria-pressed="${R.view === 'class'}">Ангийн хүснэгт</button><button type="button" data-rview="codes" aria-pressed="${R.view === 'codes'}">Код бүрээр</button></div>`;
  }
  function classHTML(){
    const M = classModel(), g = R.cg;
    const head = `<div class="res-head"><h2 class="p-topic" style="font-size:24px;margin:0">Ангийн дүнгийн хүснэгт</h2>
        <div class="row"><button class="btn ghost" id="resReloadAll" type="button">Шинэчлэх</button><button class="btn ghost" id="resLogout" type="button">Гарах</button></div></div>${viewSwitch()}`;
    if(!M.grades.length) return `<section class="paper res">${head}<p>Одоогоор илгээсэн дүн алга. Сурагчдад холбоос өгсний дараа энд гарна.</p>${diagHTML()}</section>`;
    const filt = `<div class="res-tools">
        <label class="f inline">Анги <select id="cGrade">${M.grades.map(x => `<option value="${x}" ${x === g ? 'selected' : ''}>${x}-р анги</option>`).join('')}</select></label>
        <label class="f inline">Бүлэг <select id="cGroup"><option value="">Бүх бүлэг</option>${M.groups.map(([k, v]) => `<option value="${esc(k)}" ${k === R.cgrp ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
        <button class="btn ghost" id="cCsv" type="button" ${M.students.length ? '' : 'disabled'}>Excel (CSV) татах</button></div>`;
    const n = M.students.length;
    const avgAll = n ? Math.round(M.students.filter(s => s.avg != null).reduce((x, s) => x + s.avg, 0) / Math.max(1, M.students.filter(s => s.avg != null).length)) : 0;
    const weakUnits = [];
    M.cols.forEach((c, i) => M.colAvg[i].forEach((a, j) => { if(a && a.avg < 60) weakUnits.push({c, l: j + 1, a}); }));
    const stats = `<div class="stats"><div><b>${n}</b><span>сурагч</span></div><div><b>${M.rs.length}</b><span>илгээсэн ажил</span></div><div><b>${avgAll}%</b><span>дундаж (сүүлийн дүнгээр)</span></div><div><b>${M.watch.length}</b><span>анхаарах сурагч</span></div></div>`;
    const watch = M.watch.length ? `<h3 class="res-h3">Анхаарах сурагчид</h3>
      <p class="small">Сүүлийн оролдлогодоо 50%-иас бага авсан, эсвэл дүн нь 15-аас дээш хувиар буурсан нэгж. Нэгж дээр дарахад тухайн нэгж, түвшний шинэ давтлагын хуудасны холбоос хуулагдана. Түүнийг сурагчдаа илгээнэ үү.</p>
      <ul class="watch">${M.watch.map(s => `<li><div class="w-who"><button class="linkbtn" data-stu="${esc(s.k)}">${esc(s.name)}</button> <span class="small">${esc(s.group)}${s.avg != null ? ' · дундаж ' + s.avg + '%' : ''}${s.base ? ' · <b class="tbad">суурь мэдлэг дутуу</b>' : ''}</span></div>
        <div class="w-flags">${s.flags.map(f => flagBtn(f, g)).join('') || '<span class="small">Нийт дундаж 50%-иас бага</span>'}</div></li>`).join('')}</ul>`
      : '<p class="status ok">Анхаарах сурагч алга: бүх сурагч сүүлийн оролдлогодоо 50%-иас дээш авсан байна.</p>';
    const units = weakUnits.length ? `<h3 class="res-h3">Ангиараа давтах нэгж</h3><p class="small">Ангийн дундаж 60%-иас бага байгаа нэгж, түвшин.</p><div class="w-flags">${weakUnits.map(w => `<button class="flag low" type="button" data-replink="${g}|${w.c.ch}|${w.l}" title="Ангид өгөх давтлагын холбоос хуулах">${esc(M.colName(w.c))} · ${LV[w.l]}: ${w.a.avg}% (${w.a.n} сурагч)</button>`).join('')}</div>` : '';
    const seg = (a, l) => !a || !a.length ? `<i class="lv e" title="${LV[l]}: өгөөгүй"></i>` : `<i class="lv ${pctCls(a[a.length - 1])}" title="${LV[l]}: ${a.join('% → ')}%${a.length > 1 ? ' (' + a.length + ' оролдлого)' : ''}">${a[a.length - 1]}</i>`;
    const th = M.cols.map(c => `<th class="mx-h" title="${esc(M.colName(c))}"><span>${esc(M.colName(c))}</span><em><i>М</i><i>Ч</i><i>Х</i></em></th>`).join('');
    const body = M.students.map((s, i) => `<tr><td class="num">${i + 1}</td><td class="mx-name"><button class="linkbtn" data-stu="${esc(s.k)}">${esc(s.name)}</button>${s.flags.length ? ' <span class="dot-flag" title="Анхаарах">●</span>' : ''}</td><td>${esc(s.group)}</td>
      ${M.cols.map(c => `<td class="mx">${[1, 2, 3].map(l => seg(s.cells[c.ch] && s.cells[c.ch][l], l)).join('')}</td>`).join('')}<td class="num ${s.avg == null ? '' : s.avg < 50 ? 'bad' : s.avg >= 80 ? 'ok' : ''}">${s.avg == null ? '—' : s.avg + '%'}</td></tr>`).join('');
    const foot = `<tr class="mx-foot"><td></td><td class="mx-name">Ангийн дундаж</td><td></td>${M.colAvg.map(a => `<td class="mx">${a.map((x, j) => x ? `<i class="lv ${pctCls(x.avg)}" title="${LV[j + 1]}: ${x.avg}%, ${x.n} сурагч">${x.avg}</i>` : `<i class="lv e"></i>`).join('')}</td>`).join('')}<td class="num">${avgAll}%</td></tr>`;
    const legend = `<p class="small mx-legend">Нүд бүрт гурван түвшин: <b>М</b> — мэдлэг, ойлголт, <b>Ч</b> — чадвар, <b>Х</b> — хэрэглээ. Тоо нь сүүлийн оролдлогын хувь. <i class="lv g">80</i> 80%-иас дээш <i class="lv m">65</i> 50–79% <i class="lv b">40</i> 50%-иас доош <i class="lv e"></i> өгөөгүй. Нүдэн дээр хулганаар заахад бүх оролдлого харагдана.</p>`;
    return `<section class="paper res">${head}${filt}${stats}${watch}${units}
      <h3 class="res-h3">Сурагч × нэгж</h3>${legend}
      <div class="tbl-wrap"><table class="rtable mxt"><thead><tr><th class="num">№</th><th class="mx-name">Нэр</th><th>Бүлэг</th>${th}<th class="num">Дундаж</th></tr></thead><tbody>${body}${foot}</tbody></table></div>
      ${R.note ? `<div class="status ok" role="status">${esc(R.note)}</div>` : ''}${diagHTML()}</section>`;
  }
  function studentHTML(){
    const M = classModel(), s = M.students.find(x => x.k === R.stu);
    if(!s){ R.stu = ''; return classHTML(); }
    const list = s.list.slice().reverse().map(r => `<tr><td>${esc(r.time)}</td><td>${Mx(esc(r.topic))}</td><td>${esc(LV[r.u.l])}</td><td class="num"><b>${r.score}</b>/${r.total}</td><td class="num ${r.pct < 50 ? 'bad' : r.pct >= 80 ? 'ok' : ''}">${r.pct}%</td>
      <td class="dots">${[...String(r.detail)].map((c, k) => `<i class="${c === '1' ? 'y' : c === '0' ? 'n' : 'e'}" title="${k + 1}"></i>`).join('')}</td><td><button class="linkbtn" data-rcode="${esc(r.code)}">${esc(r.code)}</button></td></tr>`).join('');
    const prog = M.cols.filter(c => s.cells[c.ch]).map(c => `<div class="sp-row"><span>${esc(M.colName(c))}</span>${[1, 2, 3].map(l => { const a = s.cells[c.ch][l]; return `<span class="sp-lv">${LV[l]}: ${a.length ? a.map(v => `<i class="lv ${pctCls(v)}">${v}</i>`).join('<b class="arr">→</b>') : '<i class="lv e"></i>'}</span>`; }).join('')}</div>`).join('');
    return `<section class="paper res"><div class="res-head"><div><button class="linkbtn" id="stuBack" type="button">← Ангийн хүснэгт</button>
      <h2 class="p-topic" style="font-size:24px;margin:4px 0 0">${esc(s.name)}</h2><div class="small">${esc(s.group)} · ${R.cg}-р анги · ${s.list.length} ажил${s.avg != null ? ' · дундаж ' + s.avg + '%' : ''}</div></div></div>
      ${s.flags.length ? `<h3 class="res-h3">Анхаарах нэгж</h3><p class="small">Дарахад давтлагын хуудасны холбоос хуулагдана.</p><div class="w-flags">${s.flags.map(f => flagBtn(f, R.cg)).join('')}</div>` : ''}
      <h3 class="res-h3">Нэгж, түвшин бүрийн ахиц (оролдлогын дарааллаар)</h3><div class="sp">${prog}</div>
      <h3 class="res-h3">Бүх ажил</h3><div class="tbl-wrap"><table class="rtable"><thead><tr><th>Огноо</th><th>Сэдэв</th><th>Түвшин</th><th class="num">Оноо</th><th class="num">%</th><th>Даалгавар</th><th>Код</th></tr></thead><tbody>${list}</tbody></table></div>
      ${R.note ? `<div class="status ok" role="status">${esc(R.note)}</div>` : ''}</section>`;
  }
  function classCsv(){
    const M = classModel();
    const q = v => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = ['Нэр', 'Бүлэг', ...M.cols.flatMap(c => [1, 2, 3].map(l => M.colName(c) + ' — ' + LV[l])), 'Дундаж', 'Анхаарах'];
    const lines = [head, ...M.students.map(s => [s.name, s.group, ...M.cols.flatMap(c => [1, 2, 3].map(l => { const a = s.cells[c.ch] && s.cells[c.ch][l]; return a && a.length ? a[a.length - 1] : ''; })), s.avg ?? '', s.flags.map(f => f.text).join('; ')])].map(a => a.map(q).join(','));
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `angi-${R.cg}${R.cgrp ? '-' + R.cgrp : ''}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }
  async function copyRep(spec){
    const [g, ch, l] = spec.split('|').map(Number), url = repLink(g, ch, l);
    let ok = false; try { await navigator.clipboard.writeText(url); ok = true; } catch(e){}
    R.note = ok ? `Давтлагын холбоос хуулагдлаа (${LV[l]}, 5 сонгох + 5 задгай): ${url}` : `Давтлагын холбоос: ${url}`;
    renderResults();
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
        <div class="row"><button class="btn ghost" id="resReload" type="button">Шинэчлэх</button><button class="btn ghost" id="resLogout" type="button">Гарах</button></div></div>${viewSwitch()}
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
    if(R.loading){ box.innerHTML = `<section class="paper res"><p>Ачаалж байна…${R.prog ? ' (' + R.prog + ' код)' : ''}</p></section>`; return; }
    if(!R.codes && !R.rows && !R.all) { box.innerHTML = loginHTML(); return; }
    const main = R.code && R.rows ? detailHTML() : R.view === 'class' && R.all ? (R.stu ? studentHTML() : classHTML()) : codesHTML();
    box.innerHTML = main + (R.error ? `<div class="status err">${esc(R.error)}</div>` : '');
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

  on('tabResults', 'click', () => { S.mode = 'results'; render(); if(URL0() && R.key && !R.codes && !R.all && !R.loading) (R.view === 'class' ? loadAll() : loadCodes()); });
  document.addEventListener('submit', e => { if(e.target.id === 'keyForm'){ e.preventDefault(); R.key = $('tkey').value.trim(); if(R.key) (R.view === 'class' ? loadAll() : loadCodes()); } });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-rcode]'); if(c){ loadCode(c.dataset.rcode); return; }
    if(e.target.closest('#resBack')){ R.code = ''; R.rows = null; if(R.view === 'class' && R.all) renderResults(); else loadCodes(); return; }
    const v = e.target.closest('[data-rview]'); if(v){ R.view = v.dataset.rview; R.note = ''; if(R.view === 'class' && !R.all) loadAll(); else if(R.view === 'codes' && !R.codes) loadCodes(); else renderResults(); return; }
    const st = e.target.closest('[data-stu]'); if(st){ R.stu = st.dataset.stu; R.note = ''; renderResults(); window.scrollTo(0, 0); return; }
    if(e.target.closest('#stuBack')){ R.stu = ''; R.note = ''; renderResults(); return; }
    const rl = e.target.closest('[data-replink]'); if(rl){ copyRep(rl.dataset.replink); return; }
    if(e.target.closest('#resReloadAll')){ R.note = ''; loadAll(); return; }
    if(e.target.closest('#cCsv')){ classCsv(); return; }
    if(e.target.closest('#resReload')){ loadCodes(); return; }
    if(e.target.closest('#resReloadCode')){ loadCode(R.code); return; }
    if(e.target.closest('#resCsv')){ csv(); return; }
    if(e.target.closest('#resLogout')){ R.key = ''; R.codes = null; R.rows = null; R.all = null; R.stu = ''; R.code = ''; try { localStorage.removeItem('ws_tkey'); } catch(err){} renderResults(); }
  });
  document.addEventListener('change', e => {
    if(e.target.id === 'resFirst'){ R.firstOnly = e.target.checked; renderResults(); }
    if(e.target.id === 'resSort'){ R.sort = e.target.value; renderResults(); }
    if(e.target.id === 'cGrade'){ R.cg = Number(e.target.value); R.cgrp = ''; R.note = ''; renderResults(); }
    if(e.target.id === 'cGroup'){ R.cgrp = e.target.value; R.note = ''; renderResults(); }
  });
})();
