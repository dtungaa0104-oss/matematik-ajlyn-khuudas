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
const CODE_RE = /^\d{1,2}-\d{1,3}-[123]-\d{1,2}-[012]-\d{1,6}$/;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

/** Багшийн «Дүн» хэсэгт өгөгдөл өгөх (нууц үгтэй) */
function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'ping') return out_({ ok: true, app: 'ajlyn-khuudas' });
  if (p.key !== TEACHER_KEY) return out_({ ok: false, error: 'key' });
  const sh = sheet_();
  const last = sh.getLastRow();
  const values = last > 1 ? sh.getRange(2, 1, last - 1, HEAD.length).getValues() : [];
  const tz = Session.getScriptTimeZone();
  const rows = values.map(r => ({
    time: r[0] instanceof Date ? Utilities.formatDate(r[0], tz, 'yyyy.MM.dd HH:mm') : String(r[0]),
    code: String(r[1]), grade: r[2], topic: r[3], level: r[4], form: r[5], name: String(r[6]), group: String(r[7]),
    score: Number(r[8]), total: Number(r[9]), pct: Number(r[10]), minutes: Number(r[11]),
    missed: String(r[12]), detail: String(r[13]), answers: String(r[14]), attempt: Number(r[15])
  }));
  if (p.code) return out_({ ok: true, rows: rows.filter(r => r.code === p.code) });
  // Код бүрийн товч жагсаалт
  const map = {};
  rows.forEach(r => {
    const m = map[r.code] || (map[r.code] = { code: r.code, grade: r.grade, topic: r.topic, count: 0, sum: 0, last: '' });
    m.count++; m.sum += r.pct; if (r.time > m.last) m.last = r.time;
  });
  const codes = Object.keys(map).map(k => ({ code: k, grade: map[k].grade, topic: map[k].topic, count: map[k].count, avg: Math.round(map[k].sum / map[k].count), last: map[k].last }))
    .sort((a, b) => (a.last < b.last ? 1 : -1));
  return out_({ ok: true, codes: codes });
}
