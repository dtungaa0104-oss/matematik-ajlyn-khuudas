/* Математик бичиглэлийг KaTeX-ээр зурах.
   Даалгаврын HTML (sup, sub, .sys, .mat, .lim) дахь математик хэсгийг танин TeX болгож, KaTeX-ээр хэвлэнэ.
   Монгол текст хэвээр үлдэнэ. KaTeX алдаа өгвөл анхны HTML-ийг буцаана. */
(function(root){
  const PROSE = /[А-Яа-яЁёӨөҮү«»₮]/;
  const LATIN = /[A-Za-z]/;
  const SUPS = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ⁿ':'n','ˣ':'x','⁻':'-'};
  const SUBS = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
  const FUNCS = {sin:'\\sin', cos:'\\cos', tg:'\\operatorname{tg}', ctg:'\\operatorname{ctg}', ln:'\\ln', log:'\\log', lg:'\\lg', Re:'\\operatorname{Re}', Im:'\\operatorname{Im}', max:'\\max', min:'\\min'};
  const WORDS = {UTC:'\\text{UTC}', dx:'\\,dx', dt:'\\,dt', du:'\\,du'};
  const OPS = {'−':'-', '-':'-', '+':'+', '=':'=', '<':'<', '>':'>', '≤':'\\le ', '≥':'\\ge ', '≠':'\\ne ', '≈':'\\approx ', '·':'\\cdot ', '×':'\\times ', '÷':'\\div ', ':':'\\mathbin{:}', '±':'\\pm ', '∓':'\\mp ',
    '∪':'\\cup ', '∩':'\\cap ', '∈':'\\in ', '∉':'\\notin ', '∅':'\\varnothing ', '∞':'\\infty ', 'π':'\\pi ', 'Σ':'\\Sigma ', 'Δ':'\\Delta ', '∆':'\\Delta ', '∠':'\\angle ', '~':'\\sim ', '⇔':'\\Leftrightarrow ',
    '|':'|', ',':',', ';':';', '%':'\\%', '!':'!', '[':'[', ']':']', '{':'\\{', '}':'\\}', '?':'?', '…':'\\ldots ', '′':"'", "'":"'", '°':'^{\\circ}', 'α':'\\alpha ', 'β':'\\beta ', 'γ':'\\gamma '};
  const WORTHY = /[=<>≤≥+×÷·\/√∛∫|^πΣ∞∠≈²³⁴⁵ⁿˣ₀-₉\u20d7\u0304]/;

  /* ---------- HTML → токен ---------- */
  function tokens(node){
    const out = [];
    node.childNodes.forEach(n => {
      if(n.nodeType === 3){ for(const ch of n.nodeValue) out.push({t: 'c', v: ch}); return; }
      if(n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase(), cls = n.getAttribute('class') || '';
      if(tag === 'sup' && cls.includes('ri')) out.push({t: 'ri', v: n.textContent.trim()});
      else if(tag === 'sup') out.push({t: 'sup', kids: tokens(n)});
      else if(tag === 'sub') out.push({t: 'sub', kids: tokens(n)});
      else if(cls.split(/\s+/).includes('sys')) out.push({t: 'sys', lines: [...n.children].map(c => tokens(c))});
      else if(cls.split(/\s+/).includes('mat')) out.push({t: 'mat', rows: [...n.children].map(c => c.textContent.split(/[\u2002\s]+/).filter(Boolean))});
      else if(cls.split(/\s+/).includes('lim')){ const s = n.querySelector('sup'), b = n.querySelector('sub'); out.push({t: 'lim', sup: s ? tokens(s) : [], sub: b ? tokens(b) : []}); }
      else if(tag === 'br') out.push({t: 'c', v: ' '});
      else tokens(n).forEach(x => out.push(x));
    });
    return out;
  }

  /* ---------- токен → TeX ---------- */
  function tex(toks){
    // 1-р шат: энгийн хэсгүүд
    const P = [];
    for(let i = 0; i < toks.length; i++){
      const k = toks[i];
      if(k.t === 'sup'){ P.push({k: 'post', s: '^{' + tex(k.kids) + '}'}); continue; }
      if(k.t === 'sub'){ P.push({k: 'post', s: '_{' + tex(k.kids) + '}'}); continue; }
      if(k.t === 'ri'){ P.push({k: 'rootidx', s: k.v}); continue; }
      if(k.t === 'sys'){ P.push({k: 'atom', s: '\\begin{cases}' + k.lines.map(tex).join('\\\\') + '\\end{cases}'}); continue; }
      if(k.t === 'mat'){ P.push({k: 'atom', s: '\\begin{pmatrix}' + k.rows.map(r => r.map(c => texOfText(c)).join('&')).join('\\\\') + '\\end{pmatrix}'}); continue; }
      if(k.t === 'lim'){ P.push({k: 'op', s: '\\int_{' + tex(k.sub) + '}^{' + tex(k.sup) + '}'}); continue; }
      const c = k.v;
      if(c === ' ' || c === ' ' || c === '\u2002' || c === ' '){ P.push({k: 'sp'}); continue; }
      if(/[0-9]/.test(c)){
        let s = c, grp = 1, dec = false;
        while(i + 1 < toks.length && toks[i + 1].t === 'c'){
          const n = toks[i + 1].v;
          if(/[0-9]/.test(n)){ s += n; grp++; i++; continue; }
          if(n === '.' && !dec && toks[i + 2] && toks[i + 2].t === 'c' && /[0-9]/.test(toks[i + 2].v)){ s += '.'; dec = true; i++; continue; }
          if(n === ' ' && !dec && grp <= 3){
            const d = toks.slice(i + 2, i + 6).map(t => t.t === 'c' ? t.v : '#').join('');
            if(/^[0-9]{3}(?![0-9.])/.test(d)){ s += '\\,'; grp = 0; i++; continue; }
          }
          break;
        }
        P.push({k: 'atom', s, num: true}); continue;
      }
      if(LATIN.test(c)){
        let w = c;
        while(i + 1 < toks.length && toks[i + 1].t === 'c' && LATIN.test(toks[i + 1].v)){ w += toks[i + 1].v; i++; }
        if(FUNCS[w]){ P.push({k: 'func', s: FUNCS[w]}); continue; }
        if(WORDS[w]){ P.push({k: 'atom', s: WORDS[w]}); continue; }
        if(/^d[a-z]$/.test(w) === false && w.length > 1 && /^(log|ln|sin|cos|tg)/.test(w)){ const f = w.match(/^(log|ln|sin|cos|tg)/)[0]; P.push({k: 'func', s: FUNCS[f]}); w = w.slice(f.length); }
        for(const ch of w) P.push({k: 'atom', s: ch, id: true});
        continue;
      }
      if(c === '\u20d7'){
        const run = lastAtomRun(P);
        if(run){ const name = run.map(x => x.s).join(''); P.splice(P.length - run.length, run.length, {k: 'atom', s: name.length > 1 ? '\\overrightarrow{' + name + '}' : '\\vec{' + name + '}'}); }
        continue;
      }
      if(c === '\u0304'){ const p = P[P.length - 1]; if(p) p.s = '\\bar{' + p.s + '}'; continue; }
      if(SUPS[c]){ let s = SUPS[c]; while(i + 1 < toks.length && toks[i + 1].t === 'c' && SUPS[toks[i + 1].v]){ s += SUPS[toks[i + 1].v]; i++; } P.push({k: 'post', s: '^{' + s.replace(/-/g, '-') + '}'}); continue; }
      if(SUBS[c]){ let s = SUBS[c]; while(i + 1 < toks.length && toks[i + 1].t === 'c' && SUBS[toks[i + 1].v]){ s += SUBS[toks[i + 1].v]; i++; } P.push({k: 'post', s: '_{' + s + '}'}); continue; }
      if(c === '√'){ P.push({k: 'sqrt', s: ''}); continue; }
      if(c === '∛'){ P.push({k: 'sqrt', s: '3'}); continue; }
      if(c === '∫'){ P.push({k: 'op', s: '\\int '}); continue; }
      if(c === '(' ){ P.push({k: 'open', s: '('}); continue; }
      if(c === ')' ){ P.push({k: 'close', s: ')'}); continue; }
      if(c === '/'){ P.push({k: 'slash'}); continue; }
      if(c === '.' ){
        if(toks[i + 1] && toks[i + 1].t === 'c' && toks[i + 1].v === '.' && toks[i + 2] && toks[i + 2].v === '.'){ P.push({k: 'op', s: '\\ldots '}); i += 2; continue; }
        P.push({k: 'op', s: '.'}); continue;
      }
      if(c === '^'){ P.push({k: 'op', s: '\\wedge '}); continue; }
      if(OPS[c] !== undefined){ P.push({k: c === '°' ? 'post' : 'op', s: OPS[c]}); continue; }
      P.push({k: 'op', s: '\\text{' + c.replace(/[\\{}$&#^_%~]/g, '') + '}'});
    }
    // 2-р шат: хаалт бүлэглэх, зай хасах
    const seq = P.filter(x => x.k !== 'sp');
    const tree = group(seq);
    return build(tree);
  }
  function lastAtomRun(P){ const run = []; for(let j = P.length - 1; j >= 0; j--){ if(P[j].id){ run.unshift(P[j]); } else break; } return run.length ? run : null; }
  function texOfText(s){ const d = document.createElement('div'); d.textContent = s; return tex(tokens(d)); }
  function group(seq){
    const root = [], stack = [root], gs = [];
    seq.forEach(x => {
      if(x.k === 'open'){ const g = {k: 'group', kids: [], open: true}; stack[stack.length - 1].push(g); stack.push(g.kids); gs.push(g); return; }
      if(x.k === 'close'){ if(stack.length > 1){ stack.pop(); gs.pop().open = false; } else stack[0].push({k: 'op', s: ')'}); return; }
      stack[stack.length - 1].push(x);
    });
    return root;
  }
  // элементийг TeX болгох; bare = хаалтгүй (бутархай, язгуурт)
  function piece(x, bare){
    if(x.k === 'group') return bare ? build(x.kids) : '(' + build(x.kids) + ')';
    return x.s;
  }
  function build(arr){
    // atom = atom/group/sqrt(+arg) + postfix
    const items = [];
    for(let i = 0; i < arr.length; i++){
      const x = arr[i];
      if(x.k === 'rootidx' && arr[i + 1] && arr[i + 1].k === 'sqrt'){ arr[i + 1].s = x.s; continue; }
      if(x.k === 'sqrt'){
        let j = i + 1, arg = '';
        if(arr[j]){
          if(arr[j].k === 'group'){ arg = build(arr[j].kids); j++; }
          else if(arr[j].k === 'atom'){ arg = arr[j].s; j++; }
        }
        items.push({k: 'atom', s: '\\sqrt' + (x.s ? '[' + x.s + ']' : '') + '{' + arg + '}', src: 'sqrt'}); i = j - 1; continue;
      }
      if(x.k === 'post' && items.length && (items[items.length - 1].k === 'atom' || items[items.length - 1].k === 'grp' || items[items.length - 1].k === 'func')){
        const last = items[items.length - 1]; last.s += x.s; last.post = true; continue;
      }
      if(x.k === 'group'){ items.push({k: x.open ? 'op' : 'grp', g: x, s: '(' + build(x.kids) + (x.open ? '' : ')')}); continue; }
      items.push(Object.assign({}, x));
    }
    // бутархай: A / B
    const out = [];
    for(let i = 0; i < items.length; i++){
      const x = items[i];
      if(x.k === 'slash' && out.length && items[i + 1] && isFracOperand(out[out.length - 1]) && isFracOperand(items[i + 1])){
        const a = out.pop(), b = items[i + 1];
        out.push({k: 'atom', s: '\\frac{' + operand(a) + '}{' + operand(b) + '}'}); i++; continue;
      }
      if(x.k === 'slash'){ out.push({k: 'op', s: '/'}); continue; }
      out.push(x);
    }
    let t = out.map(x => x.s).join(' ').replace(/\s+/g, ' ').trim();
    if(/^(\\times|\\cdot|\\div|\\pm|\+|=|<|>|\\le|\\ge|\\approx|\\mathbin)/.test(t)) t = '{}' + t;
    if(/(\\times|\\cdot|\\div|\+|=|\\approx|\\mathbin\{:\})\s*$/.test(t)) t = t + '{}';
    return t;
  }
  function isFracOperand(x){ return x && (x.k === 'atom' || x.k === 'grp') && !/^\\(sin|cos|ln|log)/.test(x.s); }
  function operand(x){ if(x.k === 'grp' && !x.post) return build(x.g.kids); return x.s; }

  /* ---------- текстийг хэсэглэх ---------- */
  function isProse(t){ return t.t === 'c' && PROSE.test(t.v); }
  function runText(run){ return run.map(t => t.t === 'c' ? t.v : '\u0001').join(''); }
  const EDGE = /[\s,.;:?!\-–—]/;
  function convert(html){
    if(!root.katex) return html;
    const host = document.createElement('div'); host.innerHTML = html;
    const toks = tokens(host), out = [];
    for(let q = 0; q < toks.length; q++){
      const t = toks[q];
      if(t.t === 'c' && t.v === '-' && toks[q + 1] && toks[q + 1].t === 'c' && /[0-9]/.test(toks[q + 1].v) && !(toks[q - 1] && toks[q - 1].t === 'c' && /[0-9A-Za-zА-Яа-яЁёӨөҮү)]/.test(toks[q - 1].v))) t.v = '−';
    }
    let i = 0;
    const emitText = arr => arr.forEach(t => out.push({raw: t}));
    while(i < toks.length){
      if(isProse(toks[i])){ out.push({raw: toks[i]}); i++; continue; }
      let j = i; while(j < toks.length && !isProse(toks[j])){ if(j > i && toks[j].t === 'c' && toks[j].v === '.' && (!toks[j + 1] || (toks[j + 1].t === 'c' && toks[j + 1].v === ' '))){ j++; break; } j++; }
      let run = toks.slice(i, j);
      let a = 0, b = run.length;
      while(a < b && run[a].t === 'c' && EDGE.test(run[a].v) && !(run[a].v === '-' && false)) a++;
      while(b > a && run[b - 1].t === 'c' && (EDGE.test(run[b - 1].v) || run[b - 1].v === '(')){
        if(run[b - 1].v === '?'){ let q = b - 2; while(q >= a && run[q].t === 'c' && run[q].v === ' ') q--; if(q >= a && run[q].t === 'c' && run[q].v === '=') break; }
        b--;
      }
      // "?"-ийг тэгшитгэлийн төгсгөлд үлдээх: "= ?" → математик
      emitText(run.slice(0, a));
      const core = run.slice(a, b), text = runText(core);
      const structural = core.some(t => t.t !== 'c');
      const worthy = core.length && (structural || LATIN.test(text) || WORTHY.test(text)) && (/[0-9A-Za-zπ√∛∫Σ∞]/.test(text) || structural);
      if(worthy) out.push({math: core}); else emitText(core);
      emitText(run.slice(b));
      i = j;
    }
    // Урт илэрхийлэл мөр шилжих боломжтой байхаар дээд түвшний таслал, цэгтэй таслалын дараа \allowbreak нэмнэ.
    function breaks(t){
      let d = 0, r = '';
      for(let k = 0; k < t.length; k++){
        const c = t[k];
        if(c === '\\'){ r += c + (t[k + 1] || ''); k++; continue; }
        if(c === '{') d++; else if(c === '}') d--;
        r += c;
        if(d === 0 && (c === ',' || c === ';') && t[k + 1] === ' ') r += '\\allowbreak';
      }
      return r;
    }
    return out.map(o => {
      if(o.raw) return rawHtml(o.raw);
      const t = breaks(tex(o.math));
      try { return root.katex.renderToString(t, {throwOnError: true, strict: 'ignore', output: 'html'}); }
      catch(e){ if(root.MATHFMT_DEBUG) root.MATHFMT_DEBUG.push({tex: t, err: String(e.message || e)}); return o.math.map(rawHtml).join(''); }
    }).join('');
  }
  const ESC = s => s.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function rawHtml(t){
    if(t.t === 'c') return ESC(t.v);
    if(t.t === 'sup') return '<sup>' + t.kids.map(rawHtml).join('') + '</sup>';
    if(t.t === 'sub') return '<sub>' + t.kids.map(rawHtml).join('') + '</sub>';
    if(t.t === 'ri') return '<sup class="ri">' + ESC(t.v) + '</sup>';
    if(t.t === 'sys') return '<span class="sys">' + t.lines.map(l => '<span>' + l.map(rawHtml).join('') + '</span>').join('') + '</span>';
    if(t.t === 'mat') return '<span class="mat">' + t.rows.map(r => '<span>' + r.map(ESC).join('&ensp;') + '</span>').join('') + '</span>';
    if(t.t === 'lim') return '∫<span class="lim"><sup>' + t.sup.map(rawHtml).join('') + '</sup><sub>' + t.sub.map(rawHtml).join('') + '</sub></span>';
    return '';
  }
  const cache = new Map();
  root.M = html => { const k = String(html ?? ''); if(!cache.has(k)){ if(cache.size > 5000) cache.clear(); cache.set(k, convert(k)); } return cache.get(k); };
  root.MATHFMT = { convert, tex, tokens };
})(typeof window !== 'undefined' ? window : globalThis);
