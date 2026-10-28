/* Математик тэмдэгтийн мөр: задгай хариуны талбарт бичиж байх үед доор нь гарна.
   Утасны гар дээр олдохгүй −, /, √, ², ^, ;, π тэмдгийг нэг товшилтоор оруулж, бичсэн хариуг томьёо хэлбэрээр урьдчилан харуулна.
   Тоон хариутай даалгаварт утсан дээр тооны гар (inputmode=decimal) нээгдэнэ; «АБВ» товчоор энгийн гар руу шилжинэ. */
(function(){
  if(typeof S === 'undefined') return;
  const coarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  const KEYS = [['−', '-', 'Хасах тэмдэг'], ['/', '/', 'Бутархайн зураас'], ['√', '√', 'Квадрат язгуур'], ['²', '²', 'Квадрат зэрэг'], ['^', '^', 'Зэрэг'], ['(', '(', 'Нээх хаалт'], [')', ')', 'Хаах хаалт'], [';', '; ', 'Хариуг тусгаарлах'], ['π', 'π', 'Пи']];
  const isTarget = el => el && el.tagName === 'INPUT' && (el.matches('.ws-item input[data-i], input.ex-ans') || el.id === 'coIn') && !el.disabled;
  const itemOf = el => el.id === 'coIn' ? (window.COACH && COACH.state.cur) : el.dataset.exin != null ? (window.EXAM && EXAM.item(+el.dataset.exin)) : S.items[Number(el.dataset.i)];
  let bar = null, cur = null, hideT = null;
  function make(){
    bar = document.createElement('div'); bar.className = 'mkb'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Математик тэмдэгт оруулах');
    bar.innerHTML = `<div class="mkb-keys">${KEYS.map(([t, v, l]) => `<button type="button" tabindex="-1" data-mk="${v}" aria-label="${l}">${t}</button>`).join('')}<button type="button" tabindex="-1" class="mkb-abc" data-mkabc aria-label="Үсгийн гар руу шилжих">АБВ</button></div><div class="mkb-prev" aria-live="polite"></div>`;
    bar.addEventListener('pointerdown', e => { if(e.target.closest('button')) e.preventDefault(); });   // талбараас фокус алдахгүй
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b || !cur) return;
      if(b.hasAttribute('data-mkabc')){ const t = cur.getAttribute('inputmode') === 'decimal'; cur.setAttribute('inputmode', t ? 'text' : 'decimal'); b.textContent = t ? '123' : 'АБВ'; cur.blur(); const c = cur; setTimeout(() => c.focus(), 30); return; }
      insert(cur, b.dataset.mk);
    });
  }
  function insert(inp, txt){
    const a = inp.selectionStart ?? inp.value.length, z = inp.selectionEnd ?? a;
    const t = txt;
    inp.value = inp.value.slice(0, a) + t + inp.value.slice(z);
    const p = a + t.length; inp.setSelectionRange(p, p); inp.focus();
    inp.dispatchEvent(new Event('input', {bubbles: true}));
  }
  function preview(){
    if(!bar || !cur) return; const v = cur.value.trim(), pv = bar.querySelector('.mkb-prev');
    if(!v || !/[\/√^²³]/.test(v)){ pv.innerHTML = ''; pv.hidden = true; return; }
    pv.hidden = false; pv.innerHTML = 'Таны хариу: ' + toTex(v);
  }
  /* Бичсэн хариуг KaTeX-ээр зурах: 3/4 → бутархай, √2 → язгуур, 2^3, 5² → зэрэг */
  function toTex(v){
    const strip = x => x.replace(/^\((.*)\)$/, '$1');
    const AT = '(-?\\d+(?:[.,]\\d+)?|\\\\sqrt\\{[^{}]*\\}|\\([^()]*\\)|\\\\pi)';
    let t = v.replace(/[−–]/g, '-').replace(/[²³]/g, c => '^' + (c === '²' ? 2 : 3)).replace(/π/g, '\\pi ');
    t = t.replace(/√(\d+(?:[.,]\d+)?|\([^()]*\))/g, (m, x) => '\\sqrt{' + strip(x) + '}');
    t = t.replace(new RegExp(AT + '\\^\\(?(-?\\d+(?:[.,]\\d+)?)\\)?', 'g'), (m, a, e) => a + '^{' + e + '}');
    t = t.replace(new RegExp(AT + '(\\^\\{[^}]*\\})?\\/' + AT + '(\\^\\{[^}]*\\})?', 'g'), (m, a, ea, b, eb) => (a[0] === '-' ? (a = a.slice(1), '-') : '') + '\\frac{' + strip(a) + (ea || '') + '}{' + strip(b) + (eb || '') + '}');
    t = t.replace(/;/g, ';\\;');
    try { return window.katex ? katex.renderToString(t, {throwOnError: false}) : esc(v); } catch(e){ return esc(v); }
  }
  document.addEventListener('focusin', e => {
    const el = e.target; if(!isTarget(el)) return;
    clearTimeout(hideT); if(!bar) make(); cur = el;
    const p = itemOf(el);
    if(coarse() && p && !el.dataset.mkSet){ el.dataset.mkSet = '1'; el.setAttribute('inputmode', p.type === 'num' ? 'decimal' : 'text'); }
    bar.querySelector('.mkb-abc').textContent = el.getAttribute('inputmode') === 'decimal' ? 'АБВ' : '123';
    const host = el.closest('.p-inrow, .co-ans') || el.parentNode; host.after(bar); bar.hidden = false; preview();
  });
  document.addEventListener('focusout', e => { if(e.target === cur){ hideT = setTimeout(() => { if(bar && document.activeElement !== cur) bar.hidden = true; }, 150); } });
  document.addEventListener('input', e => { if(e.target === cur) preview(); });
  window.MATHKB = {insert};
})();
