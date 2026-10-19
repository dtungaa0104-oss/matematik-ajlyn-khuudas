/* Математикийн ажлын хуудас — хуудасны логик */
const W = window.WS;
const LV = {1: 'Суурь', 2: 'Дунд', 3: 'Ахисан'};
const LETTER = ['А', 'Б', 'В', 'Г'];
const FORMS = {0: 'Задгай', 1: 'Тест', 2: 'Холимог'};
const S = { form: 0, choice: {}, grade: 8, topic: 0, level: 1, count: 10, seed: 1000 + Math.floor(Math.random() * 9000), mode: 'online', answers: {}, checked: false, reveal: false, items: [] };
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let downloads = null;
if(window.claude && window.claude.use) window.claude.use('downloads').then(d => { downloads = d; }).catch(() => {});

function load(){ try { const v = JSON.parse(localStorage.getItem('ws_prefs') || '{}'); Object.assign(S, {grade: v.grade || S.grade, topic: v.topic ?? S.topic, level: v.level || S.level, count: v.count || S.count, form: v.form ?? S.form}); $('school').value = v.school || ''; } catch(e){} }
function save(){ try { localStorage.setItem('ws_prefs', JSON.stringify({grade: S.grade, topic: S.topic, level: S.level, count: S.count, form: S.form, school: $('school').value})); } catch(e){} }
const code = (seed = S.seed) => `${S.grade}-${S.topic}-${S.level}-${S.count}-${S.form}-${seed}`;
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
  $('forms').innerHTML = [0, 1, 2].map(f => `<button type="button" data-f="${f}" aria-pressed="${f === S.form}">${FORMS[f]}</button>`).join('');
  $('levels').innerHTML = [1, 2, 3].map(l => `<button type="button" data-l="${l}" aria-pressed="${l === S.level}">${LV[l]}</button>`).join('');
  $('count').value = String(S.count);
  $('codeOut').textContent = code();
}

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
      tail = `<div class="p-inrow"><input type="text" id="a${i}" data-i="${i}" value="${esc(S.answers[i] || '')}" aria-label="${i + 1}-р даалгаврын хариу" autocomplete="off" spellcheck="false" enterkeyhint="next">
        ${p.root ? `<button class="root-btn" type="button" data-root="${i}" aria-label="Язгуурын тэмдэг оруулах">√</button>` : ''}
        ${verdict(st)}</div>
        ${S.checked && S.reveal && st !== true ? `<div class="reveal">Зөв хариу: <b>${Mx(p.show)}</b></div>` : ''}`;
    }
    return `<li class="${cls}"><span class="p-n">${i + 1}.</span><div class="p-q">${Mx(p.q)}</div>${tail}</li>`;
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
      <div class="p-meta">${LV[S.level]} түвшин · ${FORMS[S.form]} · ${items.length} даалгавар · Код ${label}</div>
      ${mode === 'print' ? `<div class="p-fields"><span>Нэр:<i></i></span><span>Бүлэг:<i></i></span><span>Огноо:<i></i></span><span>Оноо:<i></i>/${items.length}</span></div>` : ''}
    </div>
    <p class="p-instr"><b>Заавар.</b> ${instr}${nmc && nopen && notes.length ? '<br><b>Хариуны хэлбэр.</b> ' + notes.map(n => Mx(esc(n))).join(' ') : ''}</p>
    <ol class="p-items">${rows}</ol>
    <div class="p-foot"><span>${esc(school)}</span><span>Код ${label}</span></div>
  </article>`;
}
function keyHTML(items, letter, seed){
  return `<section class="paper key"><h3>Хариултын түлхүүр${letter ? ' · Хувилбар ' + letter : ''}</h3>
    <div class="p-meta">${S.grade}-р анги · ${Mx(esc(topicTitle()))} · ${LV[S.level]} · ${FORMS[S.form]} · Код ${code(seed)}</div>
    <ol class="key-list">${items.map((p, i) => `<li><span>${i + 1}.</span>${p.mc ? '<b style="font-family:var(--sans)">' + LETTER[p.ci] + '</b>&nbsp;<span class="ov">' + Mx(p.mc[p.ci]) + '</span>' : '<span class="ov">' + Mx(p.show) + '</span>'}</li>`).join('')}</ol></section>`;
}

function build(){
  S.items = W.makeSheet(S.grade, S.topic, S.level, S.count, S.seed, S.form);
  S.answers = {}; S.choice = {}; S.checked = false; S.reveal = false; S.results = [];
  render();
}
function render(){
  controls();
  $('tabOnline').setAttribute('aria-selected', S.mode === 'online');
  $('tabPrint').setAttribute('aria-selected', S.mode === 'print');
  $('onlineTools').hidden = S.mode !== 'online';
  const focus = document.activeElement && document.activeElement.id;
  let html = sheetHTML(S.items, {mode: S.mode, seed: S.seed});
  if(S.mode === 'print' && $('withKey').checked) html += `<div class="paper-key">${keyHTML(S.items, '', S.seed)}</div>`;
  $('sheet').innerHTML = html;
  if(S.items.length < S.count) $('sheet').insertAdjacentHTML('afterbegin', `<p class="status" style="margin:0 0 12px">Энэ сэдэв, түвшинд давтагдахгүй ${S.items.length} даалгавар үүслээ.</p>`);
  const sc = $('score');
  if(S.mode === 'online' && S.checked){
    const ok = S.results.filter(x => x === true).length, n = S.items.length, pct = Math.round(ok / n * 100);
    sc.hidden = false;
    sc.innerHTML = `<div><b>${ok} / ${n}</b> <span class="small">зөв · ${pct}%</span></div>
      <div class="small" style="flex:1 1 220px">${pct >= 80 ? 'Сайн эзэмшжээ. Дараагийн түвшинг туршаарай.' : pct >= 50 ? 'Алдсан даалгавраа дахин бодоод шалгаарай.' : 'Энэ сэдвийг давтах хэрэгтэй. Зөв хариуг хараад дахин оролдоорой.'}</div>
      <button class="btn ghost" id="revealBtn" type="button">${S.reveal ? 'Зөв хариуг нуух' : 'Зөв хариуг харах'}</button>`;
  } else sc.hidden = true;
  if(focus && $(focus) && focus.startsWith('a')) $(focus).focus();
  save();
}

function check(){
  S.results = S.items.map((p, i) => p.mc ? (S.choice[i] == null ? null : S.choice[i] === p.ci) : W.check(p, S.answers[i]));
  S.checked = true; render();
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
async function exportPDF(){
  const st = $('pdfStatus'), btn = $('pdfBtn');
  const say = (t, c) => { st.hidden = false; st.className = 'status ' + (c || ''); st.textContent = t; };
  if(!window.html2pdf){ say('PDF бэлтгэх хэрэгсэл ачаалагдаагүй байна. Хуудсыг дахин ачаалаад оролдоно уу.', 'err'); return; }
  btn.disabled = true; say('PDF бэлтгэж байна…');
  const nv = Number($('variants').value), withKey = $('withKey').checked, box = $('exportBox');
  const sets = Array.from({length: nv}, (_, v) => ({ seed: S.seed + v, letter: nv > 1 ? LETTER[v] : '', items: v === 0 ? S.items : W.makeSheet(S.grade, S.topic, S.level, S.count, S.seed + v, S.form) }));
  const brk = '<div class="html2pdf__page-break"></div>';
  let html = sets.map(x => sheetHTML(x.items, {mode: 'print', letter: x.letter, seed: x.seed})).join(brk);
  if(withKey) html += brk + sets.map(x => keyHTML(x.items, x.letter, x.seed)).join('<div style="height:24px"></div>');
  box.innerHTML = html;
  try {
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    fixSvgForCanvas(box);
    const name = `ajlyn-khuudas-${S.grade}-angi-${code().replace(/[^0-9-]/g, '')}.pdf`;
    const blob = await window.html2pdf().set({
      margin: [12, 12, 14, 12], filename: name, image: {type: 'jpeg', quality: 0.96},
      html2canvas: {scale: 2, backgroundColor: '#FFFFFF', useCORS: true},
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
  } finally { btn.disabled = false; box.innerHTML = ''; }
}

/* ---------- үйлдлүүд ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-g]'); if(g){ S.grade = Number(g.dataset.g); S.topic = 0; build(); return; }
  const l = e.target.closest('[data-l]'); if(l){ S.level = Number(l.dataset.l); build(); return; }
  const f = e.target.closest('[data-f]'); if(f){ S.form = Number(f.dataset.f); build(); return; }
  const o = e.target.closest('[data-mc]'); if(o && !S.checked){ const i = Number(o.dataset.mc), k = Number(o.dataset.k); S.choice[i] = S.choice[i] === k ? undefined : k; const id = o.id; render(); const el = $(id); if(el) el.focus(); return; }
  const rb = e.target.closest('[data-root]');
  if(rb){ const inp = $('a' + rb.dataset.root); const p = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, p) + '√' + inp.value.slice(inp.selectionEnd ?? p); S.answers[rb.dataset.root] = inp.value; inp.focus(); inp.setSelectionRange(p + 1, p + 1); return; }
  if(e.target.closest('#revealBtn')){ S.reveal = !S.reveal; render(); }
});
$('topics').addEventListener('change', e => { S.topic = Number(e.target.value); build(); });
$('count').addEventListener('change', e => { S.count = Number(e.target.value); build(); });
$('newVar').addEventListener('click', () => { S.seed = 1000 + Math.floor(Math.random() * 9000); build(); });
$('tabOnline').addEventListener('click', () => { S.mode = 'online'; render(); });
$('tabPrint').addEventListener('click', () => { S.mode = 'print'; render(); });
$('withKey').addEventListener('change', render);
$('school').addEventListener('input', () => { clearTimeout(render.t); render.t = setTimeout(render, 300); });
$('checkBtn').addEventListener('click', check);
$('clearBtn').addEventListener('click', () => { S.answers = {}; S.choice = {}; S.checked = false; S.reveal = false; render(); });
$('pdfBtn').addEventListener('click', exportPDF);
$('sheet').addEventListener('input', e => { if(e.target.dataset.i != null) S.answers[e.target.dataset.i] = e.target.value; });
$('sheet').addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.target.dataset.i != null){ e.preventDefault(); const nx = $('a' + (Number(e.target.dataset.i) + 1)); if(nx) nx.focus(); else check(); }
});
$('codeForm').addEventListener('submit', e => {
  e.preventDefault();
  const m = $('codeIn').value.trim().match(/^(\d{1,2})-(\d{1,3})-([123])-(\d{1,2})-(?:([012])-)?(\d{1,6})$/);
  const g = m && Number(m[1]);
  if(!m || !W.GRADES.includes(g) || !validTopic(g, Number(m[2]))){ $('codeIn').setCustomValidity('Код буруу байна'); $('codeIn').reportValidity(); return; }
  $('codeIn').setCustomValidity('');
  Object.assign(S, {grade: g, topic: Number(m[2]), level: Number(m[3]), count: [6, 10, 15, 20].includes(Number(m[4])) ? Number(m[4]) : 10, form: Number(m[5] || 0), seed: Number(m[6])});
  S.mode = 'online'; build();
});
$('codeIn').addEventListener('input', () => $('codeIn').setCustomValidity(''));

load();
const h = (location.hash || '').match(/^#w-(\d{1,2})-(\d{1,3})-([123])-(\d{1,2})-(?:([012])-)?(\d{1,6})$/);
if(h && W.GRADES.includes(Number(h[1]))) Object.assign(S, {grade: Number(h[1]), topic: Number(h[2]), level: Number(h[3]), count: Number(h[4]), form: Number(h[5] || 0), seed: Number(h[6])});
if(![0, 1, 2].includes(S.form)) S.form = 0;
if(!validTopic(S.grade, S.topic)) S.topic = 0;
if(![6, 10, 15, 20].includes(S.count)) S.count = 10;
build();
