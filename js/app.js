/* Математикийн ажлын хуудас — хуудасны логик */
const W = window.WS;
const LV = {1: 'Мэдлэг, ойлголт', 2: 'Чадвар', 3: 'Хэрэглээ'};
const LETTER = ['А', 'Б', 'В', 'Г'];
const FORMS = {0: 'Задгай', 1: 'Тест', 2: 'Холимог'};
const PRESETS = [[10, 0, 'Тест 10'], [0, 10, 'Задгай 10'], [5, 5, '5 + 5'], [10, 5, '10 + 5']];
const S = { form: 0, choice: {}, grade: 8, topic: 0, level: 1, count: 10, seed: 1000 + Math.floor(Math.random() * 9000), mode: 'online', answers: {}, checked: false, reveal: false, items: [], student: false, allowReveal: false, mc: 5, op: 5, legacy: null };
/* Даалгаврын тоо: сонгох (mc) ба задгай (op). Хуучин кодыг (тоо + хэлбэр) legacy-д хадгалж яг ижил хуудсыг гаргана. */
const total = () => S.legacy ? S.legacy.count : S.mc + S.op;
const formArg = () => S.legacy ? S.legacy.form : {mc: S.mc};
const formLabel = () => { if(S.legacy) return FORMS[S.legacy.form]; return S.mc && S.op ? `${S.mc} сонгох + ${S.op} задгай` : S.mc ? 'Тест' : 'Задгай'; };
function applyLegacy(count, form){ count = Math.max(1, Math.min(40, count)); S.legacy = {count, form}; const m = form === 1 ? count : form === 2 ? Math.ceil(count / 2) : 0; S.mc = m; S.op = count - m; }
function parseCode(str){
  const m = String(str).match(/^(\d{1,2})-(\d{1,3})-([123])-(?:(\d{1,2})\+(\d{1,2})|(\d{1,2})-([012])|(\d{1,2}))-(\d{1,6})$/);
  if(!m) return null;
  const r = {grade: Number(m[1]), topic: Number(m[2]), level: Number(m[3]), seed: Number(m[9])};
  if(m[4] != null){ r.mc = Number(m[4]); r.op = Number(m[5]); if(r.mc + r.op < 1 || r.mc + r.op > 40) return null; }
  else { r.count = Number(m[6] ?? m[8]); r.form = m[7] != null ? Number(m[7]) : 0; }
  return r;
}
function applyCode(r){ Object.assign(S, {grade: r.grade, topic: r.topic, level: r.level, seed: r.seed}); if(r.mc != null){ S.mc = r.mc; S.op = r.op; S.legacy = null; } else applyLegacy(r.count, r.form); }
const $ = id => document.getElementById(id);
/* Элемент байхгүй (index.html хуучин хувилбартай) үед бүх хуудас зогсохоос сэргийлнэ */
const on = (id, ev, fn) => { const el = $(id); if(el) el.addEventListener(ev, fn); else missingParts.add('index.html'); };
const missingParts = new Set();
function showProblem(msg){
  let b = document.getElementById('siteProblem');
  if(!b){ b = document.createElement('div'); b.id = 'siteProblem'; b.setAttribute('role', 'alert');
    b.style.cssText = 'margin:12px auto;max-width:1200px;padding:12px 16px;border-radius:10px;background:#FBE9E7;color:#8A1F14;font:15px/1.5 system-ui,sans-serif;border:1px solid #E7B3AC';
    document.body.prepend(b); }
  if(!b.textContent.includes(msg)) b.textContent += (b.textContent ? ' ' : '') + msg;
}
(function(){
  const need = [['WS', 'js/generators.js'], ['katex', 'vendor/katex/katex.min.js'], ['MATHFMT', 'js/mathfmt.js']];
  const miss = need.filter(([g]) => !window[g]).map(x => x[1]);
  if(miss.length){ showProblem('Сайтын зарим файл олдсонгүй: ' + miss.join(', ') + '. GitHub дээрх файлуудаа шалгана уу.'); }
})();
/* index.html хуучин үлдсэн бол дутуу элементүүдийг нууцаар нөхөж, анхааруулга харуулна */
(function(){
  const ids = {tabResults: 'button', studentBar: 'div', sbTitle: 'b', sbMeta: 'span', stName: 'input', stClass: 'input', sharePanel: 'section', shareLink: 'input', shareReveal: 'input',
    copyLink: 'button', shareTime: 'select', startBox: 'div', startInfo: 'p', startBtn: 'button', timer: 'div', qr: 'div', qrBig: 'button', shareStatus: 'div', qrDlg: 'dialog', qrBigBox: 'div', qrCodeTxt: 'p', score: 'div', sheet: 'div', onlineTools: 'div', checkBtn: 'button', clearBtn: 'button', mcCount: 'select', opCount: 'select', cntNote: 'p'};
  const miss = Object.keys(ids).filter(id => !$(id));
  if(!miss.length) return;
  const box = document.createElement('div'); box.hidden = true; document.body.appendChild(box);
  miss.forEach(id => { const el = document.createElement(ids[id]); el.id = id; if(ids[id] === 'input' && id === 'shareReveal') el.type = 'checkbox'; box.appendChild(el); });
  showProblem('index.html файл хуучин хувилбартай байна (шинэ js/app.js-тэй таарахгүй). GitHub дээр index.html-ийг шинэ zip доторхоор солино уу.');
})();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let downloads = null;
if(window.claude && window.claude.use) window.claude.use('downloads').then(d => { downloads = d; }).catch(() => {});

function load(){ try { const v = JSON.parse(localStorage.getItem('ws_prefs') || '{}'); Object.assign(S, {grade: v.grade || S.grade, topic: v.topic ?? S.topic, level: v.level || S.level}); if(v.mc != null && v.op != null){ S.mc = v.mc; S.op = v.op; } else if(v.count) applyLegacy(v.count, v.form ?? 0); S.legacy = null; if(S.mc + S.op < 1) S.op = 10; $('school').value = v.school || ''; } catch(e){} }
function save(){ if(S.student) return; try { localStorage.setItem('ws_prefs', JSON.stringify({grade: S.grade, topic: S.topic, level: S.level, mc: S.mc, op: S.op, school: $('school').value})); } catch(e){} }
const code = (seed = S.seed) => S.legacy ? `${S.grade}-${S.topic}-${S.level}-${S.legacy.count}-${S.legacy.form}-${seed}` : `${S.grade}-${S.topic}-${S.level}-${S.mc}+${S.op}-${seed}`;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const chaptersOf = g => (W.CHAPTERS || {})[g] || null;
const validTopic = (g, t) => t === 0 || (t >= 1 && t <= W.topicsOf(g).length) || (t > 100 && !!chaptersOf(g) && !!chaptersOf(g)[t - 100]);
const Mx = s => (window.M ? window.M(String(s)) : String(s));
const topicTitle = () => {
  if(S.topic === 0) return 'Холимог давтлага';
  if(S.topic > 100){ const ch = S.topic - 100; return `${chapNo(ch)}. ${chaptersOf(S.grade)[ch]} (холимог)`; }
  return W.topicsOf(S.grade)[S.topic - 1].title;
};
const chapNo = ch => Object.keys(chaptersOf(S.grade) || {}).map(Number).indexOf(ch) + 1;
const bookRef = () => {
  const chs = chaptersOf(S.grade), base = `Хөтөлбөрийн уялдаа: Математикийн сургалтын хөтөлбөр, ${S.grade}-р анги`;
  if(!chs || S.topic === 0) return `${base} · бүх агуулга`;
  const ch = S.topic > 100 ? S.topic - 100 : W.topicsOf(S.grade)[S.topic - 1].ch;
  return `${base} · «${chs[ch]}» агуулга`;
};

function controls(){
  $('grades').innerHTML = W.GRADES.map(g => `<button class="chip" type="button" data-g="${g}" aria-pressed="${g === S.grade}" aria-label="${g}-р анги">${g}</button>`).join('');
  const opt = (v, label, extra, cls) => `<label class="topic ${cls || ''} ${v === S.topic ? 'on' : ''}"><input type="radio" name="topic" value="${v}" ${v === S.topic ? 'checked' : ''}><span>${Mx(esc(label))}</span>${extra ? `<em>${extra}</em>` : ''}</label>`;
  const all = W.topicsOf(S.grade), chs = chaptersOf(S.grade);
  let html = opt(0, chs ? 'Холимог давтлага (бүх агуулга)' : 'Холимог давтлага', '', 'mix');
  if(chs){
    Object.keys(chs).map(Number).forEach(ch => {
      html += `<div class="chap">${chapNo(ch)}. ${esc(chs[ch])}</div>` + opt(100 + ch, 'Энэ агуулгын холимог', '', 'mix');
      all.forEach((t, i) => { if(t.ch === ch) html += opt(i + 1, t.title, ''); });
    });
  } else all.forEach((t, i) => { html += opt(i + 1, t.title, ''); });
  $('topics').innerHTML = html;
  $('topics').classList.toggle('long', !!chs);
  $('bookNote').hidden = false;
  $('bookNote').innerHTML = `Сэдвүүдийг ерөнхий боловсролын сургуулийн <b>Математикийн сургалтын хөтөлбөр</b>-ийн ${S.grade}-р ангийн агуулгын хүрээгээр бүлэглэв. Бүх даалгаврыг энэ сайтад зориулж шинээр зохиосон; тоо, нөхцөл нь код бүрт өөр гарна.`;
  $('forms').innerHTML = PRESETS.map(([m, o, t], i) => `<button type="button" data-f="${i}" aria-pressed="${!S.legacy && S.mc === m && S.op === o}">${t}</button>`).join('');
  $('mcCount').value = String(Math.min(20, S.mc)); $('opCount').value = String(Math.min(20, S.op));
  $('cntNote').textContent = `Нийт ${S.mc + S.op} даалгавар: ${S.mc} сонгох, ${S.op} задгай.`;
  $('levels').innerHTML = [1, 2, 3].map(l => `<button type="button" data-l="${l}" aria-pressed="${l === S.level}">${LV[l]}</button>`).join('');
  $('codeOut').textContent = code();
  if(typeof updateShare === 'function') updateShare();
}

/* Алхамчилсан бодолт: шалгасны дараа алдсан даалгаврын доор. Сурагчид тоон бодолт зөвхөн багш «зөв хариу харуулах»-ыг зөвшөөрсөн үед,
   бусад үед зөвхөн «Бодох арга» (тоогүй ерөнхий заавар) харагдана. */
S.solOpen = {};
function solHTML(p, i, st){
  if(!S.checked || (S.student && st === true)) return '';
  const meth = (window.METHODS || {})[p.tid], steps = p.sol && p.sol.length && (!S.student || S.allowReveal);
  if(!meth && !steps) return '';
  return `<details class="sol" data-sol="${i}"${S.solOpen[i] ? ' open' : ''}><summary>${steps ? 'Бодолтыг харах' : 'Бодох арга'}</summary><div class="sol-body">
    ${meth ? `<p class="sol-m"><b>Бодох арга.</b> ${Mx(meth)}</p>` : ''}
    ${steps ? `<ol class="sol-s">${p.sol.map(x => `<li>${Mx(x)}</li>`).join('')}</ol><p class="sol-a">Хариу: <b>${Mx(p.show)}</b></p>` : ''}</div></details>`;
}
document.addEventListener('toggle', e => { const d = e.target; if(d && d.matches && d.matches('details[data-sol]')) S.solOpen[d.dataset.sol] = d.open; }, true);

function sheetHTML(items, opts){
  const {mode, letter, seed} = opts;
  const school = $('school').value.trim();
  const notes = [...new Set(items.filter(p => !p.mc).map(p => p.note).filter(Boolean))];
  const verdict = st => st === true ? '<span class="verdict">Зөв</span>' : st === false ? '<span class="verdict">Буруу</span>' : S.checked ? '<span class="verdict" style="background:var(--paper-rule);color:var(--paper-muted)">Хоосон</span>' : '';
  const item = (p, i) => {
    const st = S.checked && mode === 'online' ? S.results[i] : null;
    const cls = ['ws-item', p.mc ? 'mc' : '', p.wide ? 'wide' : '', st === true ? 'ok' : st === false ? 'bad' : ''].join(' ');
    let tail;
    if(p.mc){
      const long = p.mc.some(o => { const t = o.replace(/<[^>]+>/g, ''); return t.length > 9 || /[=<>≤≥]|\/.*\//.test(t) || /class="(sys|mat)/.test(o); });
      if(mode === 'print') tail = `<div class="p-opts ${long ? 'long' : ''}">${p.mc.map((o, k) => `<span><b>${LETTER[k]}</b><span class="ov">${Mx(o)}</span></span>`).join('')}</div>`;
      else tail = `<div class="p-mc ${long ? 'long' : ''}" role="group" aria-label="${i + 1}-р даалгаврын сонголт">${p.mc.map((o, k) => {
          const c = S.checked ? (k === p.ci && (S.reveal || st === true) ? 'right' : k === S.choice[i] && st === false ? 'wrong' : '') : '';
          return `<button type="button" class="opt ${c}" id="o${i}-${k}" data-mc="${i}" data-k="${k}" aria-pressed="${S.choice[i] === k}" ${S.checked ? 'disabled' : ''}><b>${LETTER[k]}</b><span>${Mx(o)}</span></button>`; }).join('')}</div>
        ${S.checked ? `<div class="p-mcv">${verdict(st)}</div>` : ''}`;
    } else if(mode === 'print') tail = `<div class="p-work" aria-hidden="true"></div><div class="p-ans">Хариу:<i></i></div>`;
    else {
      tail = `<div class="p-inrow"><input type="text" id="a${i}" data-i="${i}" value="${esc(S.answers[i] || '')}" aria-label="${i + 1}-р даалгаврын хариу" autocomplete="off" spellcheck="false" enterkeyhint="next" ${S.student && S.checked ? 'disabled' : ''}>
        ${p.root ? `<button class="root-btn" type="button" data-root="${i}" ${S.student && S.checked ? 'disabled' : ''} aria-label="Язгуурын тэмдэг оруулах">√</button>` : ''}
        ${verdict(st)}</div>
        ${S.checked && S.reveal && st !== true ? `<div class="reveal">Зөв хариу: <b>${Mx(p.show)}</b></div>` : ''}`;
    }
    return `<li class="${cls}"><span class="p-n">${i + 1}.</span><div class="p-q">${Mx(p.q)}</div>${p.fig ? `<div class="p-fig">${p.fig}</div>` : ''}${tail}${mode === 'online' ? solHTML(p, i, st) : ''}</li>`;
  };
  const nmc = items.filter(p => p.mc).length, nopen = items.length - nmc;
  const mcNote = mode === 'print' ? 'Зөв хариултын үсгийг дугуйлна.' : 'Зөв хариултыг сонгоно.';
  let rows = '';
  if(nmc && nopen){
    rows += `<li class="p-sec">А хэсэг. Сонгох даалгавар<small>${mcNote}</small></li>`;
    items.forEach((p, i) => { if(p.mc) rows += item(p, i); });
    rows += `<li class="p-sec">Б хэсэг. Задгай даалгавар<small>${mode === 'print' ? 'Бодолтоо бичиж, хариугаа зураасан дээр бичнэ.' : 'Хариугаа бичнэ.'}</small></li>`;
    items.forEach((p, i) => { if(!p.mc) rows += item(p, i); });
  } else rows = items.map(item).join('');
  const instr = nmc && nopen ? mcNote + ' ' + (mode === 'online' ? 'Задгай даалгаврын хариуг бичээд «Шалгах» товчийг дарна.' : 'Задгай даалгаврын бодолтыг мөрөнд, хариуг зураасан дээр бичнэ.')
    : nmc ? mcNote + (mode === 'online' ? ' Дараа нь «Шалгах» товчийг дарна.' : '')
    : notes.map(n => Mx(esc(n))).join(' ') + (mode === 'online' ? ' Хариугаа бичээд «Шалгах» товчийг дарна.' : nmc ? '' : ' Бодолтоо мөрөнд, хариугаа зураасан дээр бичнэ.');
  const label = code(seed);
  return `<article class="paper">
    <div class="p-head">
      <div class="p-school">${esc(school || 'Математикийн ажлын хуудас')}</div>
      <div class="p-grade">${S.grade}-р анги${letter ? ' · Хувилбар ' + letter : ''}</div>
      <h2 class="p-topic">${Mx(esc(topicTitle()))}</h2>
      ${bookRef() ? `<div class="p-book">${esc(bookRef())}</div>` : ''}
      <div class="p-meta">${LV[S.level]} түвшин · ${formLabel()} · ${items.length} даалгавар · Код ${label}</div>
      ${mode === 'print' ? `<div class="p-fields"><span>Нэр:<i></i></span><span>Бүлэг:<i></i></span><span>Огноо:<i></i></span><span>Оноо:<i></i>/${items.length}</span></div>` : ''}
    </div>
    <p class="p-instr"><b>Заавар.</b> ${instr}${nmc && nopen && notes.length ? '<br><b>Хариуны хэлбэр.</b> ' + notes.map(n => Mx(esc(n))).join(' ') : ''}</p>
    <ol class="p-items">${rows}</ol>
    <div class="p-foot"><span>${esc(school)}</span><span>Код ${label}</span></div>
  </article>`;
}
function keyHTML(items, letter, seed){
  return `<section class="paper key"><h3>Хариултын түлхүүр${letter ? ' · Хувилбар ' + letter : ''}</h3>
    <div class="p-meta">${S.grade}-р анги · ${Mx(esc(topicTitle()))} · ${LV[S.level]} · ${formLabel()} · Код ${code(seed)}</div>
    <ol class="key-list">${items.map((p, i) => `<li><span>${i + 1}.</span>${p.mc ? '<b style="font-family:var(--sans)">' + LETTER[p.ci] + '</b>&nbsp;<span class="ov">' + Mx(p.mc[p.ci]) + '</span>' : '<span class="ov">' + Mx(p.show) + '</span>'}</li>`).join('')}</ol></section>`;
}

function build(){
  S.items = W.makeSheet(S.grade, S.topic, S.level, total(), S.seed, formArg());
  S.answers = {}; S.choice = {}; S.checked = false; S.reveal = false; S.results = []; S.solOpen = {};
  render();
}
function render(){
  controls();
  $('tabOnline').setAttribute('aria-selected', S.mode === 'online');
  $('tabPrint').setAttribute('aria-selected', S.mode === 'print');
  $('onlineTools').hidden = S.mode !== 'online';
  $('tabResults').setAttribute('aria-selected', S.mode === 'results');
  document.body.classList.toggle('resmode', S.mode === 'results');
  if(S.mode === 'results'){ $('score').hidden = true; if(window.renderResults) renderResults(); return; }
  const focus = document.activeElement && document.activeElement.id;
  let html = sheetHTML(S.items, {mode: S.mode, seed: S.seed});
  if(S.mode === 'print' && $('withKey').checked) html += `<div class="paper-key">${keyHTML(S.items, '', S.seed)}</div>`;
  $('sheet').innerHTML = html;
  if(S.items.length < total()) $('sheet').insertAdjacentHTML('afterbegin', `<p class="status" style="margin:0 0 12px">Энэ сэдэв, түвшинд давтагдахгүй ${S.items.length} даалгавар үүслээ.</p>`);
  renderStudent();
  const sc = $('score');
  if(S.student && S.checked){
    const ok = S.results.filter(x => x === true).length, n = S.items.length, pct = Math.round(ok / n * 100);
    const miss = S.results.map((x, i) => x === true ? null : i + 1).filter(Boolean);
    sc.hidden = false;
    sc.innerHTML = `<div class="result-card">
      <div><b>${ok} / ${n}</b> <span class="small">зөв · ${pct}%</span></div>
      <div class="who">${esc(stWho())} · Код ${code()} · ${esc(S.doneAt || '')}</div>
      ${S.timedOut ? '<div class="status err">Хугацаа дууссан тул хариуг автоматаар шалгаж илгээлээ.</div>' : ''}
      ${miss.length ? `<div class="small">Алдсан эсвэл хоосон: ${miss.join(', ')}-р даалгавар. Тэдгээрийн доор «${S.allowReveal ? 'Бодолтыг харах' : 'Бодох арга'}» гэсэн тайлбар бий.</div>` : '<div class="small">Бүх даалгавар зөв. Баяр хүргэе!</div>'}
      ${window.APP_CONFIG && APP_CONFIG.RESULTS_URL ? '' : '<div class="small">Үр дүнгээ «Мессежээр илгээх» товчоор багшдаа илгээнэ үү, эсвэл энэ дэлгэцийн зургийг авна уу.</div>'}
      ${window.sendStateHTML ? sendStateHTML() : ''}
      ${window.MOTIV ? MOTIV.resultHTML(pct) : ''}
      ${S.daily ? '<p class="small">Маргааш шинэ бодлого гарна. Энэ холбоосоороо дахин ороорой.</p>' : pathHTML(pct)}
      <div class="result-actions"><button class="btn ghost" id="sendResult" type="button">Мессежээр илгээх</button>${S.allowReveal ? `<button class="btn ghost" id="revealBtn" type="button">${S.reveal ? 'Зөв хариуг нуух' : 'Зөв хариуг харах'}</button>` : ''}</div>
      <div class="status" id="sendStatus" hidden></div></div>`;
  } else if(S.mode === 'online' && S.checked){
    const ok = S.results.filter(x => x === true).length, n = S.items.length, pct = Math.round(ok / n * 100);
    sc.hidden = false;
    sc.innerHTML = `<div><b>${ok} / ${n}</b> <span class="small">зөв · ${pct}%</span></div>
      <div class="small" style="flex:1 1 220px">${pct >= 80 ? 'Сайн эзэмшжээ. Дараагийн түвшинг туршаарай.' : pct >= 50 ? 'Алдсан даалгавраа дахин бодоод шалгаарай.' : 'Энэ сэдвийг давтах хэрэгтэй. Зөв хариуг хараад дахин оролдоорой.'}</div>
      <button class="btn ghost" id="revealBtn" type="button">${S.reveal ? 'Зөв хариуг нуух' : 'Зөв хариуг харах'}</button>`;
  } else sc.hidden = true;
  if(focus && $(focus) && focus.startsWith('a')) $(focus).focus();
  save();
}

function check(force){
  if(S.student && !force && !$('stName').value.trim()){ $('stName').setCustomValidity('Нэрээ бичнэ үү'); $('stName').reportValidity(); $('stName').focus(); return; }
  if(S.student){ const d = new Date(), z = n => String(n).padStart(2, '0'); S.doneAt = `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`; }
  S.results = S.items.map((p, i) => p.mc ? (S.choice[i] == null ? null : S.choice[i] === p.ci) : W.check(p, S.answers[i]));
  S.checked = true; stopTimer(); render();
  if(S.student){ saveRun({done: true, doneAt: S.doneAt, timedOut: !!S.timedOut}); const prev = loadPath()[S.level]; savePath(); if(window.MOTIV) MOTIV.onCheck(prev); render(); }
  if(S.student && window.submitResult) submitResult();
}

// html2canvas KaTeX-ийн язгуур/сумны SVG-г (width="400em", slice) зөв зурахгүй тул бодит пикселийн хэмжээг онооно.
function fixSvgForCanvas(root){
  root.querySelectorAll('.katex svg').forEach(svg => {
    const host = svg.parentElement, r = host.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    const w = Math.max(1, Math.min(r.width || sr.width, sr.width || r.width)), h = sr.height || r.height;
    if(!w || !h) return;
    svg.setAttribute('width', w.toFixed(2)); svg.setAttribute('height', h.toFixed(2));
    svg.style.width = w.toFixed(2) + 'px'; svg.style.height = h.toFixed(2) + 'px';
  });
}
let restoreScroll = null;
async function exportPDF(){
  const st = $('pdfStatus'), btn = $('pdfBtn');
  const say = (t, c) => { st.hidden = false; st.className = 'status ' + (c || ''); st.textContent = t; };
  if(!window.html2pdf){ say('PDF бэлтгэх хэрэгсэл ачаалагдаагүй байна. Хуудсыг дахин ачаалаад оролдоно уу.', 'err'); return; }
  btn.disabled = true; say('PDF бэлтгэж байна…');
  const nv = Number($('variants').value), withKey = $('withKey').checked, box = $('exportBox');
  const sets = Array.from({length: nv}, (_, v) => ({ seed: S.seed + v, letter: nv > 1 ? LETTER[v] : '', items: v === 0 ? S.items : W.makeSheet(S.grade, S.topic, S.level, total(), S.seed + v, formArg()) }));
  const brk = '<div class="html2pdf__page-break"></div>';
  let html = sets.map(x => sheetHTML(x.items, {mode: 'print', letter: x.letter, seed: x.seed})).join(brk);
  if(withKey) html += brk + sets.map(x => keyHTML(x.items, x.letter, x.seed)).join('<div style="height:24px"></div>');
  box.innerHTML = html;
  try {
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    const sx = window.scrollX, sy = window.scrollY; window.scrollTo(0, 0); restoreScroll = () => window.scrollTo(sx, sy);
    fixSvgForCanvas(box);
    const name = `ajlyn-khuudas-${S.grade}-angi-${code().replace(/[^0-9-]/g, '')}.pdf`;
    const blob = await window.html2pdf().set({
      margin: [12, 12, 14, 12], filename: name, image: {type: 'jpeg', quality: 0.96},
      html2canvas: {scale: 2, backgroundColor: '#FFFFFF', useCORS: true, scrollX: 0, scrollY: 0},
      jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'},
      pagebreak: {mode: ['css', 'legacy'], avoid: ['.ws-item', '.key-list li']}
    }).from(box).outputPdf('blob');
    if(downloads) await downloads.save({filename: name, data: blob});
    else { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
    say('PDF бэлэн боллоо. Нээгээд хэвлэнэ үү.', 'ok');
  } catch(e){
    const code = e && e.code;
    if(code === 'declined' || code === 'cancelled' || code === 'canceled') say('Татахыг цуцаллаа.');
    else say('PDF үүсгэж чадсангүй. Дахин оролдоно уу.', 'err');
  } finally { btn.disabled = false; box.innerHTML = ''; if(restoreScroll) restoreScroll(); }
}

/* ---------- үйлдлүүд ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-g]'); if(g){ S.grade = Number(g.dataset.g); S.topic = 0; build(); return; }
  const l = e.target.closest('[data-l]'); if(l){ S.level = Number(l.dataset.l); build(); return; }
  const f = e.target.closest('[data-f]'); if(f){ const [m, o] = PRESETS[Number(f.dataset.f)]; S.mc = m; S.op = o; S.legacy = null; build(); return; }
  const o = e.target.closest('[data-mc]'); if(o && !S.checked){ const i = Number(o.dataset.mc), k = Number(o.dataset.k); S.choice[i] = S.choice[i] === k ? undefined : k; const id = o.id; render(); const el = $(id); if(el) el.focus(); return; }
  const rb = e.target.closest('[data-root]');
  if(rb){ const inp = $('a' + rb.dataset.root); const p = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, p) + '√' + inp.value.slice(inp.selectionEnd ?? p); S.answers[rb.dataset.root] = inp.value; inp.focus(); inp.setSelectionRange(p + 1, p + 1); return; }
  if(e.target.closest('#revealBtn')){ S.reveal = !S.reveal; render(); }
});
on('topics', 'change', e => { S.topic = Number(e.target.value); build(); });
const setCounts = (m, o, changed) => { if(m + o < 1){ if(changed === 'mc') o = 1; else m = 1; } S.mc = m; S.op = o; S.legacy = null; build(); };
on('mcCount', 'change', e => setCounts(Number(e.target.value), S.op, 'mc'));
on('opCount', 'change', e => setCounts(S.mc, Number(e.target.value), 'op'));
on('newVar', 'click', () => { S.seed = 1000 + Math.floor(Math.random() * 9000); build(); });
on('tabOnline', 'click', () => { S.mode = 'online'; render(); });
on('tabPrint', 'click', () => { S.mode = 'print'; render(); });
on('withKey', 'change', render);
on('school', 'input', () => { clearTimeout(render.t); render.t = setTimeout(render, 300); });
on('checkBtn', 'click', () => check());
on('clearBtn', 'click', () => { S.answers = {}; S.choice = {}; S.checked = false; S.reveal = false; S.solOpen = {}; render(); });
on('pdfBtn', 'click', exportPDF);

/* ---------- Сурагчдад цахимаар өгөх ---------- */
const shareURL = () => { const t = Number(($('shareTime') || {}).value || 0); return location.href.split('#')[0] + '#' + ($('shareReveal').checked ? 'sr-' : 's-') + code() + (t > 0 ? '~' + t : ''); };
function updateShare(){
  if(S.student) return;
  const url = shareURL(); $('shareLink').value = url;
  if(window.qrcode){ try { const q = qrcode(0, 'M'); q.addData(url); q.make(); $('qr').innerHTML = q.createSvgTag({cellSize: 4, margin: 2, scalable: true}); } catch(e){ $('qr').hidden = true; } }
}
function shareSay(id, t, c){ const st = $(id); st.hidden = false; st.className = 'status ' + (c || ''); st.textContent = t; }
async function copyText(t){
  try { await navigator.clipboard.writeText(t); return true; } catch(e){
    const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch(_){} ta.remove(); return ok; }
}
on('copyLink', 'click', async () => {
  const ok = await copyText(shareURL());
  shareSay('shareStatus', ok ? 'Холбоос хуулагдлаа. Чат эсвэл Classroom-д буулгаж илгээнэ үү.' : 'Хуулж чадсангүй. Дээрх холбоосыг гараар сонгож хуулна уу.', ok ? 'ok' : 'err');
});
on('shareLink', 'focus', e => e.target.select());
on('shareReveal', 'change', updateShare);
on('shareTime', 'change', updateShare);
on('qrBig', 'click', () => {
  if(!window.qrcode) return; const q = qrcode(0, 'M'); q.addData(shareURL()); q.make();
  $('qrBigBox').innerHTML = q.createSvgTag({cellSize: 8, margin: 2, scalable: true});
  $('qrCodeTxt').textContent = `${S.grade}-р анги · Код ${code()}`;
  const d = $('qrDlg'); if(d.showModal) d.showModal(); else d.setAttribute('open', '');
});

/* ---------- Сурагчийн горим ---------- */
const stWho = () => { const n = $('stName').value.trim(), c = $('stClass').value.trim(); return n + (c ? ' (' + c + ')' : ''); };
function renderStudent(){
  if(!S.student) return;
  $('studentBar').hidden = false;
  $('sbTitle').innerHTML = (S.daily ? 'Өдрийн бодлого · ' : '') + Mx(esc(topicTitle()));
  $('sbMeta').textContent = `${S.grade}-р анги · ${LV[S.level]} · ${S.items.length} даалгавар${S.limit ? ' · Хугацаа ' + S.limit + ' минут' : ''} · Код ${code()}`;
  let sp = document.getElementById('sbPath');
  if(!sp){ sp = document.createElement('div'); sp.id = 'sbPath'; const h = $('sbMeta').parentNode; if(h && h.parentNode) h.parentNode.insertBefore(sp, h.nextSibling); }
  sp.innerHTML = S.checked ? '' : (S.daily ? '' : ladderHTML(loadPath())) + (window.MOTIV ? MOTIV.barHTML() : '');
  $('stName').disabled = $('stClass').disabled = S.checked;
  $('clearBtn').hidden = S.checked;
  $('checkBtn').hidden = S.checked;
}
['stName', 'stClass'].forEach(id => $(id).addEventListener('input', () => { $(id).setCustomValidity(''); const sp = document.getElementById('sbPath'); if(sp && !S.checked) sp.innerHTML = ladderHTML(loadPath()); try { localStorage.setItem('ws_student', JSON.stringify({n: $('stName').value, c: $('stClass').value})); } catch(e){} }));
document.addEventListener('click', async e => {
  if(!e.target.closest('#sendResult')) return;
  const ok = S.results.filter(x => x === true).length, n = S.items.length;
  const miss = S.results.map((x, i) => x === true ? null : i + 1).filter(Boolean);
  const text = `Математикийн ажлын хуудас\nСурагч: ${stWho()}\n${S.grade}-р анги · ${topicTitle()}\nКод: ${code()}\nОноо: ${ok}/${n} (${Math.round(ok / n * 100)}%)\n${miss.length ? 'Алдсан: ' + miss.join(', ') : 'Бүгд зөв'}\nОгноо: ${S.doneAt}`;
  if(navigator.share){ try { await navigator.share({title: 'Ажлын хуудасны үр дүн', text}); return; } catch(err){ if(err && err.name === 'AbortError') return; } }
  const c = await copyText(text);
  shareSay('sendStatus', c ? 'Үр дүн хуулагдлаа. Багшийн чат руу буулгаж илгээнэ үү.' : 'Хуулж чадсангүй. Дэлгэцийн зургийг авч илгээнэ үү.', c ? 'ok' : 'err');
});
on('sheet', 'input', e => { if(e.target.dataset.i != null) S.answers[e.target.dataset.i] = e.target.value; });
on('sheet', 'keydown', e => {
  if(e.key === 'Enter' && e.target.dataset.i != null){ e.preventDefault(); const nx = $('a' + (Number(e.target.dataset.i) + 1)); if(nx) nx.focus(); else check(); }
});
on('codeForm', 'submit', e => {
  e.preventDefault();
  const r = parseCode($('codeIn').value.trim());
  if(!r || !W.GRADES.includes(r.grade) || !validTopic(r.grade, r.topic)){ $('codeIn').setCustomValidity('Код буруу байна'); $('codeIn').reportValidity(); return; }
  $('codeIn').setCustomValidity('');
  applyCode(r);
  S.mode = 'online'; build();
});
on('codeIn', 'input', () => $('codeIn').setCustomValidity(''));

/* ---------- Түвшнээр ахих зам (сурагчийн горим) ----------
   Мэдлэг, ойлголт → Чадвар → Хэрэглээ. 80%-д хүрвэл дараагийн түвшин нээгдэнэ, хүрэхгүй бол ижил түвшний шинэ хувилбар.
   Сурагч бүрийн хамгийн сайн дүнг энэ төхөөрөмж дээр (нэр, анги, сэдвээр) хадгална. */
const PASS = 80;
const pathKey = () => [$('stName').value, $('stClass').value].map(v => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim()).join('|') + '|' + S.grade + '-' + S.topic;
function loadPath(){ try { return (JSON.parse(localStorage.getItem('ws_path') || '{}') || {})[pathKey()] || {}; } catch(e){ return {}; } }
function savePath(){
  if(!S.student || !S.items.length) return;
  const pct = Math.round(S.results.filter(x => x === true).length / S.items.length * 100);
  try { const all = JSON.parse(localStorage.getItem('ws_path') || '{}') || {}, k = pathKey(), cur = all[k] || {};
    if(!(cur[S.level] >= pct)) cur[S.level] = pct; all[k] = cur; localStorage.setItem('ws_path', JSON.stringify(all)); } catch(e){}
}
function nextURL(level){
  const nmc = S.items.filter(p => p.mc).length, nop = S.items.length - nmc;
  const seed = 1000 + Math.floor(Math.random() * 98000);
  return location.pathname + location.search + `#${S.allowReveal ? 'sr' : 's'}-${S.grade}-${S.topic}-${level}-${nmc}+${nop}-${seed}${S.limit ? '~' + S.limit : ''}`;
}
function ladderHTML(best){
  return `<ol class="ladder" aria-label="Түвшнээр ахих зам">${[1, 2, 3].map(l => { const b = best[l], st = b >= PASS ? 'done' : l === S.level ? 'now' : '';
    return `<li class="${st}"${l === S.level ? ' aria-current="step"' : ''}><span class="lad-dot">${b >= PASS ? '✓' : l}</span><span class="lad-txt">${LV[l]}${b != null ? ` <em>${b}%</em>` : ''}</span></li>`; }).join('')}</ol>`;
}
function pathHTML(pct){
  const best = loadPath(); if(!(best[S.level] >= pct)) best[S.level] = pct;
  let msg, btn;
  if(pct >= PASS && S.level < 3){ msg = `Та «${LV[S.level]}» түвшинг давлаа. Дараагийн «${LV[S.level + 1]}» түвшин нээгдлээ.`; btn = `<a class="btn" href="${nextURL(S.level + 1)}" data-go>«${LV[S.level + 1]}» түвшинд шилжих</a>`; }
  else if(pct >= PASS){ msg = 'Та энэ сэдвийн гурван түвшнийг бүгдийг давлаа. Баяр хүргэе!'; btn = `<a class="btn ghost" href="${nextURL(3)}" data-go>Шинэ хувилбараар дахин бататгах</a>`; }
  else { msg = `Дараагийн түвшин нээгдэхэд ${PASS}% хэрэгтэй. Алдсан даалгавраа нягталж, ижил түвшний шинэ хувилбарыг бөглөөрэй.`; btn = `<a class="btn" href="${nextURL(S.level)}" data-go>Шинэ хувилбар бөглөх</a>`; }
  return `<div class="path">${ladderHTML(best)}<p class="small">${msg}</p><div class="result-actions">${btn}</div></div>`;
}
document.addEventListener('click', e => { const a = e.target.closest('a[data-go]'); if(!a) return; e.preventDefault(); location.href = a.getAttribute('href'); location.reload(); });

/* ---------- Гүйцэтгэх хугацаа (сурагчийн горим) ----------
   Явцыг энэ төхөөрөмж дээр (код бүрээр) хадгална: эхэлсэн цаг, нэр, хариу. Хуудсыг дахин ачаалсан ч цаг шинээр эхлэхгүй. */
const runKey = () => 'ws_run_' + code() + (S.limit ? '~' + S.limit : '');
function loadRun(){ try { return JSON.parse(localStorage.getItem(runKey()) || 'null') || {}; } catch(e){ return {}; } }
function saveRun(extra){ if(!S.student) return; try { const r = Object.assign(loadRun(), {answers: S.answers, choice: S.choice, n: $('stName').value, c: $('stClass').value}, extra || {}); localStorage.setItem(runKey(), JSON.stringify(r)); } catch(e){} }
let tickId = null;
function stopTimer(){ if(tickId){ clearInterval(tickId); tickId = null; } const t = $('timer'); if(t && S.checked) t.hidden = true; }
function tick(){
  if(!S.limit || !S.runStart || S.checked) return;
  const left = Math.max(0, S.runStart + S.limit * 60000 - Date.now()), m = Math.floor(left / 60000), sec = Math.floor(left % 60000 / 1000), t = $('timer');
  t.hidden = false; t.textContent = `⏱ ${m}:${String(sec).padStart(2, '0')}`; t.className = 'timer' + (left <= 60000 ? ' danger' : left <= 5 * 60000 ? ' warn' : '');
  t.setAttribute('aria-label', `${m} минут ${sec} секунд үлдлээ`);
  if(left <= 0){ S.timedOut = true; check(true); return; }
  if(Math.floor(Date.now() / 1000) % 3 === 0) saveRun();
}
function startTimer(){ document.body.classList.remove('pre-start'); $('startBox').hidden = true; S.startedAt = S.runStart; if(tickId) clearInterval(tickId); tickId = setInterval(tick, 500); tick(); }
function initRun(){
  if(!S.student) return;
  const r = loadRun();
  if(r.n) $('stName').value = r.n; if(r.c) $('stClass').value = r.c;
  if(r.answers) S.answers = r.answers; if(r.choice) S.choice = r.choice;
  if(r.done && !S.limit){ S.answers = {}; S.choice = {}; render(); return; } // хугацаагүй горимд дахин бөглөж болно
  if(r.done){ // өмнө нь илгээсэн: үр дүнг харуулж, дахин илгээхгүй
    S.timedOut = !!r.timedOut; S.doneAt = r.doneAt || '';
    S.results = S.items.map((p, i) => p.mc ? (S.choice[i] == null ? null : S.choice[i] === p.ci) : W.check(p, S.answers[i]));
    S.checked = true; S.sendState = {text: 'Энэ даалгаврыг өмнө нь шалгуулж илгээсэн.', cls: 'ok'}; render(); setTimeout(render, 0); return;
  }
  if(!S.limit){ render(); return; }
  if(r.start){ S.runStart = r.start; render(); startTimer(); return; }
  document.body.classList.add('pre-start'); $('startBox').hidden = false;
  $('startInfo').innerHTML = `Энэ ажлын хуудсыг <b>${S.limit} минутын</b> дотор гүйцэтгэнэ. Нэрээ бичээд «Эхлэх» дарахад цаг эхэлнэ. Хугацаа дуусахад хариу автоматаар шалгагдаж илгээгдэнэ.`;
  render();
}
on('startBtn', 'click', () => {
  if(!$('stName').value.trim()){ $('stName').setCustomValidity('Нэрээ бичнэ үү'); $('stName').reportValidity(); $('stName').focus(); return; }
  S.runStart = Date.now(); saveRun({start: S.runStart}); startTimer();
});
document.addEventListener('click', e => { if(S.student && e.target.closest('[data-mc]')) setTimeout(() => saveRun(), 0); });
on('sheet', 'change', () => { if(S.student) saveRun(); });

load();
/* Өдрийн бодлого: #d-9 → өнөөдрийн огнооноос тогтох нэг задгай даалгавар (чадварын түвшин). Ангийн бүх сурагчид ижил. */
function dailyHash(){
  const m = (location.hash || '').match(/^#d-(\d{1,2})$/); if(!m || !W.GRADES.includes(+m[1])) return null;
  const g = +m[1], d = new Date(), n = W.topicsOf(g).length, day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  S.daily = true; return `#s-${g}-${1 + (day * 37) % n}-2-0+1-${(d.getFullYear() % 100) * 10000 + (d.getMonth() + 1) * 100 + d.getDate()}`;
}
const hm = (dailyHash() || location.hash || '').match(/^#(w|s|sr)-([^~]+)(?:~(\d{1,3}))?$/), h = hm && parseCode(decodeURIComponent(hm[2]));
S.limit = hm && hm[3] ? Math.min(240, Number(hm[3])) : 0;
if(h && W.GRADES.includes(h.grade)){
  applyCode(h); S.mode = 'online';
  if(hm[1] !== 'w' && validTopic(S.grade, S.topic)){
    S.student = true; S.allowReveal = hm[1] === 'sr'; S.startedAt = Date.now(); document.body.classList.add('student');
    try { const v = JSON.parse(localStorage.getItem('ws_student') || '{}'); $('stName').value = v.n || ''; $('stClass').value = v.c || ''; } catch(e){}
  }
}
if(!validTopic(S.grade, S.topic)) S.topic = 0;
if(!S.legacy && (S.mc + S.op < 1 || S.mc + S.op > 40)){ S.mc = 5; S.op = 5; }
try { build(); initRun(); } catch(e){ showProblem('Хуудсыг ачаалахад алдаа гарлаа: ' + (e && e.message) + '. Бүх файлыг шинэ zip-ээс дахин оруулна уу.'); console.error(e); }
