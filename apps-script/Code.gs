/**
 * Математикийн ажлын хуудас — сурагчдын дүнг Google Sheets-д цуглуулах
 *
 * Суулгах:
 *  1. Google Sheets дээр шинэ хүснэгт үүсгэнэ.
 *  2. Өргөтгөл (Extensions) → Apps Script. Энэ файлын бүх кодыг Code.gs-д хуулж тавина.
 *  3. Доорх TEACHER_KEY-г зөвхөн өөрөө мэдэх нууц үгээр солино.
 *  4. Байршуулах (Deploy) → Шинэ байршуулалт (New deployment) → Төрөл: Вэб апп (Web app)
 *       Гүйцэтгэх (Execute as): Би (Me)
 *       Хандах эрх (Who has access): Хэн ч (Anyone)
 *  5. Гарсан ".../exec" хаягийг сайтын js/config.js файлд RESULTS_URL болгон хуулна.
 */

const TEACHER_KEY = 'ЭНИЙГ-СОЛИНО-УУ';   // Багшийн нууц үг: сайтын «Дүн» хэсэгт оруулна
const SHEET_NAME = 'Дүн';
const HEAD = ['Илгээсэн огноо', 'Код', 'Анги', 'Сэдэв', 'Түвшин', 'Хэлбэр', 'Нэр', 'Бүлэг',
  'Оноо', 'Нийт', 'Хувь (%)', 'Хугацаа (мин)', 'Алдсан даалгавар', 'Даалгавар бүрийн дүн', 'Сурагчийн хариу', 'Оролдлого'];
const CODE_RE = /^\d{1,2}-\d{1,3}-[123]-(\d{1,2}-[012]|\d{1,2}\+\d{1,2})-\d{1,6}$/;  // хуучин: 9-5-2-10-2-2024, шинэ: 9-5-2-10+5-2024

/** Хүснэгтийг олох: Sheets-ээс нээсэн бол тэр хүснэгт, script.google.com-оос шууд үүсгэсэн бол шинэ хүснэгтийг автоматаар үүсгэнэ */
function ss_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const ss = SpreadsheetApp.create('Математикийн ажлын хуудас — дүн');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

/** ЭХЛЭЭД НЭГ УДАА АЖИЛЛУУЛНА: дээрх цэснээс «setup»-ийг сонгоод ▷ Выполнить / Run дарна.
 *  Google зөвшөөрөл олгоод, дүн хадгалах хүснэгтийн холбоосыг Журнал (Execution log)-д харуулна. */
function setup() {
  const sh = sheet_();
  Logger.log('Дүн хадгалах хүснэгт бэлэн: ' + sh.getParent().getUrl());
  Logger.log(TEACHER_KEY === 'ЭНИЙГ-СОЛИНО-УУ' ? 'АНХААР: TEACHER_KEY-г өөрийн нууц үгээр солиорой!' : 'Нууц үг тохируулагдсан.');
}

function sheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#E2E8F8');
    sh.setColumnWidth(7, 180);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

const clean_ = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').replace(/^[=+\-@]/, "'$&").trim().slice(0, max);
const norm_ = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

/** Сурагчийн дүн хүлээн авах */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.action === 'archive') {                         // багш: улирал архивлах
      if (d.key !== TEACHER_KEY) return out_({ ok: false, error: 'key' });
      return out_(archive_(d.name));
    }
    if (d.action === 'setroster') {                       // багш: ангийн нэрсийн жагсаалт хадгалах
      if (d.key !== TEACHER_KEY) return out_({ ok: false, error: 'key' });
      const k = rosterKey_(d.group || ''); if (!norm_(d.group || '')) return out_({ ok: false, error: 'group' });
      const seen = {}, names = String(d.names || '').split(/\r?\n/).map(x => clean_(x, 60)).filter(x => x && !seen[norm_(x)] && (seen[norm_(x)] = 1)).slice(0, 200);
      const pr = PropertiesService.getScriptProperties();
      if (!names.length) pr.deleteProperty(k); else pr.setProperty(k, JSON.stringify({ label: clean_(d.group, 20), names: names }));
      return out_({ ok: true, rosters: listRosters_() });
    }
    const code = String(d.code || '');
    if (!CODE_RE.test(code)) return out_({ ok: false, error: 'code' });
    const name = clean_(d.name, 60), group = clean_(d.group, 20);
    if (!name) return out_({ ok: false, error: 'name' });
    const total = Math.max(1, Math.min(40, parseInt(d.total, 10) || 0));
    const score = Math.max(0, Math.min(total, parseInt(d.score, 10) || 0));

    const sh = sheet_();
    const last = sh.getLastRow();
    let attempt = 1;
    if (last > 1) {
      const rows = sh.getRange(2, 2, last - 1, 7).getValues(); // Код … Бүлэг
      const key = norm_(name) + '|' + norm_(group);
      rows.forEach(r => { if (String(r[0]) === code && norm_(r[5]) + '|' + norm_(r[6]) === key) attempt++; });
    }
    sh.appendRow([
      new Date(), "'" + code, Number(d.grade) || '', clean_(d.topic, 120), clean_(d.level, 20), clean_(d.form, 20),
      name, group, score, total, Math.round(score / total * 100),
      Math.round((Number(d.minutes) || 0) * 10) / 10, clean_(d.missed, 200), "'" + String(d.detail || '').replace(/[^01-]/g, '').slice(0, 40), clean_(d.answers, 1500), attempt
    ]);
    return out_({ ok: true, attempt: attempt });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/** Хуудасны дүнгийн мөрүүдийг сайтад өгөх хэлбэрт оруулна */
function rowsOf_(sh) {
  const last = sh.getLastRow(), tz = Session.getScriptTimeZone();
  const values = last > 1 ? sh.getRange(2, 1, last - 1, HEAD.length).getValues() : [];
  return values.filter(r => r[1] !== '').map(r => ({
    time: r[0] instanceof Date ? Utilities.formatDate(r[0], tz, 'yyyy.MM.dd HH:mm') : String(r[0]),
    code: String(r[1]), grade: r[2], topic: r[3], level: r[4], form: r[5], name: String(r[6]), group: String(r[7]),
    score: Number(r[8]), total: Number(r[9]), pct: Number(r[10]), minutes: Number(r[11]),
    missed: String(r[12]), detail: String(r[13]), answers: String(r[14]), attempt: Number(r[15])
  }));
}

/** Улирал архивлах: «Дүн» хуудсын бүх мөрийг «Архив: нэр» хуудас руу хуулж, «Дүн»-г хоосолно */
const ARCH_PREFIX = 'Архив: ';
function listArchives_() {
  return ss_().getSheets().filter(x => x.getName().indexOf(ARCH_PREFIX) === 0)
    .map(x => ({ name: x.getName().slice(ARCH_PREFIX.length), rows: Math.max(0, x.getLastRow() - 1) }));
}
function archive_(name) {
  const ss = ss_(), sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return { ok: false, error: 'empty' };
  const base = clean_(name || '', 80).replace(/[\[\]*?:\/\\]/g, ' ').trim() || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  let full = ARCH_PREFIX + base, k = 2;
  while (ss.getSheetByName(full)) full = ARCH_PREFIX + base + ' (' + (k++) + ')';
  sh.copyTo(ss).setName(full);
  if (last > 2) sh.deleteRows(3, last - 2);   // бүх мөрийг устгаж болохгүй тул нэгийг үлдээгээд цэвэрлэнэ
  sh.getRange(2, 1, 1, HEAD.length).clearContent();
  return { ok: true, moved: last - 1, name: full.slice(ARCH_PREFIX.length), archives: listArchives_() };
}

/** Ангийн нэрсийн жагсаалт (бүлэг бүрт Script Properties-д тусдаа) */
function rosterKey_(g) { return 'ROSTER_' + Utilities.base64EncodeWebSafe(norm_(g)).slice(0, 200); }
function getRoster_(g) { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(rosterKey_(g)) || 'null'); } catch (e) { return null; } }
function listRosters_() {
  const all = PropertiesService.getScriptProperties().getProperties();
  return Object.keys(all).filter(k => k.indexOf('ROSTER_') === 0).map(k => { try { return JSON.parse(all[k]); } catch (e) { return null; } }).filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Ангийн хамтын зорилгууд (Script Properties-д хадгална) */
function goals_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('GOALS') || '{}'); } catch (e) { return {}; } }
/** Зорилго тавьснаас хойш тухайн бүлгийн зөв бодсон даалгаврын нийт тоо */
function goalDone_(key, start) {
  const sh = sheet_(), last = sh.getLastRow(); if (last < 2) return 0;
  const t0 = new Date(start).getTime(); let sum = 0;
  sh.getRange(2, 1, last - 1, 9).getValues().forEach(r => { const d = r[0] instanceof Date ? r[0].getTime() : 0; if (d >= t0 && norm_(r[7]) === key) sum += Number(r[8]) || 0; });
  return sum;
}
function listGoals_() { const G = goals_(); return Object.keys(G).map(k => ({ key: k, label: G[k].label, title: G[k].title, target: G[k].target, start: G[k].start, done: goalDone_(k, G[k].start) })); }

/** Багшийн «Дүн» хэсэгт өгөгдөл өгөх (нууц үгтэй) */
function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'ping') return out_({ ok: true, app: 'ajlyn-khuudas', v: 6 });
  // Ангийн хамтын зорилго: сурагчид зөвхөн бүлгийнхээ нийт тоог харна (нэр харагдахгүй)
  // Ангийн нэрсийн жагсаалт: сурагч нэрээ жагсаалтаас сонгоно
  if (p.action === 'roster') { const r = getRoster_(p.group || ''); return out_({ ok: true, label: r ? r.label : '', names: r ? r.names : null }); }
  if (p.action === 'goal') {
    const key = norm_(p.group || ''), G = goals_()[key];
    if (!G) return out_({ ok: true, goal: null });
    const cache = CacheService.getScriptCache(), ck = 'goal_' + Utilities.base64EncodeWebSafe(key).slice(0, 200);
    let done = cache.get(ck);
    if (done == null) { done = goalDone_(key, G.start); cache.put(ck, String(done), 60); }
    return out_({ ok: true, goal: { label: G.label, title: G.title, target: G.target, done: Number(done), start: G.start } });
  }
  if (p.key !== TEACHER_KEY) return out_({ ok: false, error: 'key' });
  if (p.action === 'archives') return out_({ ok: true, archives: listArchives_() });
  if (p.action === 'archived') { const ash = ss_().getSheetByName(ARCH_PREFIX + (p.name || '')); return ash ? out_({ ok: true, rows: rowsOf_(ash) }) : out_({ ok: false, error: 'name' }); }
  if (p.action === 'goals') return out_({ ok: true, goals: listGoals_() });
  if (p.action === 'rosters') return out_({ ok: true, rosters: listRosters_() });
  if (p.action === 'setgoal') {
    const G = goals_(), key = norm_(p.group || '');
    if (!key) return out_({ ok: false, error: 'group' });
    const t = parseInt(p.target, 10) || 0;
    if (t <= 0) delete G[key];
    else G[key] = { label: clean_(p.group, 20), title: clean_(p.title || '', 80), target: Math.min(100000, t), start: p.keep === '1' && G[key] ? G[key].start : new Date().toISOString() };
    PropertiesService.getScriptProperties().setProperty('GOALS', JSON.stringify(G));
    try { CacheService.getScriptCache().remove('goal_' + Utilities.base64EncodeWebSafe(key).slice(0, 200)); } catch (e) {}
    return out_({ ok: true, goals: listGoals_() });
  }
  const rows = rowsOf_(sheet_());
  if (p.code) return out_({ ok: true, rows: rows.filter(r => r.code === p.code) });
  // Код бүрийн товч жагсаалт
  const map = {};
  rows.forEach(r => {
    const m = map[r.code] || (map[r.code] = { code: r.code, grade: r.grade, topic: r.topic, count: 0, sum: 0, last: '' });
    m.count++; m.sum += r.pct; if (r.time > m.last) m.last = r.time;
  });
  const codes = Object.keys(map).map(k => ({ code: k, grade: map[k].grade, topic: map[k].topic, count: map[k].count, avg: Math.round(map[k].sum / map[k].count), last: map[k].last }))
    .sort((a, b) => (a.last < b.last ? 1 : -1));
  if (p.all) return out_({ ok: true, codes: codes, rows: rows });  // ангийн хүснэгтэд бүх дүн нэг дор
  return out_({ ok: true, codes: codes });
}
