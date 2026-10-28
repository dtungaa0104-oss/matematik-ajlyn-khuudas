/* SAT шат: Хэрэглээ түвшнийг давсны дараах англи хэл дээрх SAT-ийн хэв маягтай бодлого (8–12-р анги); 6–7-р ангид «Англи гүүр».
   Ангиар хүндрэл: 8–9 → PSAT 8/9, 10 → PSAT 10, 11–12 → SAT. Бүх бодлого шинээр зохиомол (College Board-ийн бодлого биш).
   Англи бичвэрт томьёог ⟦…⟧ дотор бичнэ (mathfmt зөвхөн түүнийг томьёо болгоно).
   Даалгавар бүр: gl — нэр томьёо [англи, монгол], mn — юу асууж байгааг монголоор, sol — монгол бодолт. */
(function(){
  const W = window.WS; if(!W || !W.addSat || !W.H) return;
  const {fmt, par, frac, poly, num, so, gcd, sup} = W.H;
  const M = s => '⟦' + s + '⟧';
  const band = g => g >= 11 ? 3 : g >= 10 ? 2 : 1;
  /* Нэг хуудсанд олон хэлбэр холилдохоор: 8–9 → голдуу 1, 10 → 1–3, 11–12 → голдуу 2–3 */
  const tier = (r, g) => r.forceB || r.pick(g >= 11 ? [2, 3, 3] : g >= 10 ? [1, 2, 2, 3] : [1, 1, 2]);
  const sat = (p, gl, mn) => { if(p){ if(!p.q.includes('⟦')) p.q += '⟦⟧'; p.gl = gl; p.mn = mn; p.sat = true; } return p; };   // ⟦⟧ — бичвэрийг томьёо болгохгүй байх тэмдэг
  const usd = n => '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
  const sqrtS = n => { let o = 1, i = n; for(let k = 2; k * k <= i; k++) while(i % (k * k) === 0){ o *= k; i /= k * k; } return {o, i}; };   // √n = o√i
  const rootShow = n => { const {o, i} = sqrtS(n); return i === 1 ? fmt(o) : (o === 1 ? '' : o) + '√' + i; };
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

  const S = {
    /* Algebra: нэг хувьсагчтай шугаман тэгшитгэл */
    linEq(r, g){
      const b = tier(r, g), a = r.i(2, 9), x = r.nz(-9, 12), c = r.nz(-20, 20), d = a * x + c;
      const eq = `${poly([[a, 'x'], [c, '']])} = ${fmt(d)}`;
      const gl = [['value', 'утга'], ['solution', 'шийд'], ['equation', 'тэгшитгэл']];
      if(b === 1) return sat(so(num(`If ${M(eq)}, what is the value of ${M('x')}?`, x), `${fmt(c)}-г тэгшитгэлийн нөгөө тал руу шилжүүлнэ: ${a}x = ${fmt(d)} − ${par(c)} = ${fmt(a * x)}`, `x = ${fmt(a * x)} ÷ ${a} = ${fmt(x)}`), gl, `${eq} тэгшитгэлээс x-ийг ол.`);
      if(b === 2){ const k = r.i(2, 4), e = r.i(1, 15), val = k * a * x - e;
        return sat(so(num(`If ${M(eq)}, what is the value of ${M(`${k * a}x − ${e}`)}?`, val), `${a}x = ${fmt(d)} − ${par(c)} = ${fmt(a * x)}`, `${k * a}x нь ${a}x-ийн ${k} дахин: ${k * a}x = ${k} · ${fmt(a * x)} = ${fmt(k * a * x)}`, `${k * a}x − ${e} = ${fmt(k * a * x)} − ${e} = ${fmt(val)}`, 'x-ийг олохгүйгээр шууд илэрхийллийг олох нь цаг хэмнэнэ.'), gl, `${eq} бол ${k * a}x − ${e} илэрхийллийн утгыг ол.`); }
      const m = r.i(2, 6), q = r.i(1, 5), p = m + r.i(1, 4), s = p * x - m * (x - q);   // m(x − q) + s = px  →  x
      const eq3 = `${m}(x − ${q}) + ${fmt(s)} = ${p}x`;
      return sat(so(num(`What value of ${M('x')} is the solution to the equation ${M(eq3)}?`, x), `Хаалтыг задлана: ${m}x − ${m * q} + ${fmt(s)} = ${p}x`, `x-тэй гишүүдийг нэг тал руу: ${fmt(s - m * q)} = ${p - m}x`, `x = ${fmt(s - m * q)} ÷ ${p - m} = ${fmt(x)}`), gl, `${eq3} тэгшитгэлийн шийдийг ол.`);
    },
    /* Algebra: шугаман функц, налалт, огтлолцол */
    linFunc(r, g){
      const b = tier(r, g), gl = [['slope', 'налалт'], ['y-intercept', 'OY тэнхлэгтэй огтлолцох цэг'], ['passes through', 'дайрч гарна']];
      if(b === 1){ const x1 = r.i(-4, 3), m = r.nz(-5, 6), y1 = r.i(-6, 8), dx = r.i(1, 4), x2 = x1 + dx, y2 = y1 + m * dx;
        return sat(so(num(`A line in the ${M('xy')}-plane passes through the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)}. What is the slope of the line?`, m), `Налалт = (y₂ − y₁) / (x₂ − x₁)`, `= (${fmt(y2)} − ${par(y1)}) / (${fmt(x2)} − ${par(x1)}) = ${fmt(y2 - y1)} / ${dx} = ${fmt(m)}`), gl, `(${x1}; ${y1}) ба (${x2}; ${y2}) цэгийг дайрсан шулууны налалтыг ол.`); }
      if(b === 2){ const fee = r.i(4, 12) * 5, rate = r.i(3, 9) * 5, h1 = r.i(1, 3), h2 = h1 + r.i(2, 4);
        gl.push(['fixed fee', 'тогтмол төлбөр'], ['hourly rate', 'цагийн хөлс'], ['total charge', 'нийт төлбөр']);
        return sat(so(num(`A plumber charges a fixed fee plus an hourly rate. The total charge for ${h1} hour${h1 > 1 ? 's' : ''} of work is ${usd(fee + rate * h1)}, and the total charge for ${h2} hours of work is ${usd(fee + rate * h2)}. What is the fixed fee, in dollars?`, fee), `Цагийн хөлс = (${fee + rate * h2} − ${fee + rate * h1}) / (${h2} − ${h1}) = ${rate * (h2 - h1)} / ${h2 - h1} = ${rate} доллар`, `Тогтмол төлбөр = ${fee + rate * h1} − ${h1} · ${rate} = ${fee} доллар`), gl, `Сантехникч тогтмол төлбөр дээр цагийн хөлс нэмж авдаг. ${h1} цагийн ажилд ${fee + rate * h1}, ${h2} цагийнхад ${fee + rate * h2} доллар. Тогтмол төлбөр хэд вэ?`); }
      const m = r.nz(-4, 5), c = r.i(-9, 9), px = r.nz(-5, 5), py = r.i(-10, 10), bb = py - m * px;
      gl.push(['parallel', 'параллел']);
      return sat(so(num(`Line ${M('ℓ')} is parallel to the line ${M(`y = ${poly([[m, 'x'], [c, '']])}`)} and passes through the point ${M(`(${px}, ${py})`)}. What is the ${M('y')}-intercept of line ${M('ℓ')}?`, bb), `Параллел шулуунуудын налалт тэнцүү: ℓ: y = ${fmt(m)}x + b`, `(${px}; ${py}) цэгийг орлуулна: ${py} = ${fmt(m)} · ${par(px)} + b`, `b = ${py} − ${par(m * px)} = ${fmt(bb)}`), gl, `y = ${poly([[m, 'x'], [c, '']])} шулуунтай параллел, (${px}; ${py}) цэгийг дайрсан шулууны OY-тэй огтлолцох цэгийн y-ийг ол.`);
    },
    /* Algebra: хоёр хувьсагчтай шугаман систем */
    sys(r, g){
      const b = tier(r, g), gl = [['system of equations', 'тэгшитгэлийн систем'], ['solution', 'шийд']];
      if(b === 1){ const x = r.i(1, 12), y = r.i(-6, 10), s = x + y, d = x - y;
        return sat(so(num(`If ${M(`x + y = ${s}`)} and ${M(`x − y = ${d}`)}, what is the value of ${M('x')}?`, x), `Хоёр тэгшитгэлийг нэмбэл y устна: 2x = ${s} + ${par(d)} = ${2 * x}`, `x = ${x}`), gl, `x + y = ${s}, x − y = ${d} бол x-ийг ол.`); }
      if(b === 2){ const A = r.i(8, 15), B = r.i(3, 7), na = r.i(20, 80), nb = r.i(20, 80);
        gl.push(['ticket', 'тасалбар'], ['adult', 'насанд хүрэгч'], ['student', 'сурагч'], ['revenue', 'орлого']);
        return sat(so(num(`A theater sold ${na + nb} tickets for a show. Adult tickets cost ${usd(A)} each and student tickets cost ${usd(B)} each. The total revenue from the tickets was ${usd(A * na + B * nb)}. How many adult tickets were sold?`, na), `a — насанд хүрэгч, s — сурагчийн тасалбар: a + s = ${na + nb}, ${A}a + ${B}s = ${A * na + B * nb}`, `s = ${na + nb} − a-г орлуулна: ${A}a + ${B}(${na + nb} − a) = ${A * na + B * nb}`, `${A - B}a = ${A * na + B * nb} − ${B * (na + nb)} = ${(A - B) * na}`, `a = ${na}`), gl, `Нийт ${na + nb} тасалбар зарсан. Том хүний тасалбар ${A}, сурагчийнх ${B} доллар, нийт орлого ${A * na + B * nb} доллар. Хэдэн том хүний тасалбар зарсан бэ?`); }
      const a = r.i(2, 7), bb = r.nz(-6, 6), c = r.i(1, 20), m = r.i(2, 4), e = m * c + r.nz(-5, 5);
      gl.push(['no solution', 'шийдгүй'], ['constant', 'тогтмол']);
      return sat(so(num(`In the system of equations below, ${M('k')} is a constant. ${M(`${poly([[a, 'x'], [bb, 'y']])} = ${c}`)} and ${M(`kx ${m * bb < 0 ? '−' : '+'} ${Math.abs(m * bb)}y = ${e}`)}. For what value of ${M('k')} does the system have no solution?`, m * a), `Шийдгүй байхын тулд шулуунууд параллел (коэффициентууд пропорциональ), харин сул гишүүн пропорциональ биш байна`, `y-ийн коэффициент: ${fmt(m * bb)} = ${m} · ${par(bb)} тул k = ${m} · ${a} = ${m * a}`, `Шалгах: ${m} · ${c} = ${m * c} ≠ ${e}, тиймээс шийдгүй`), gl, `k-ийн ямар утгад систем шийдгүй вэ?`);
    },
    /* Algebra: шугаман тэнцэтгэл биш */
    ineq(r, g){
      const b = tier(r, g), gl = [['inequality', 'тэнцэтгэл биш'], ['greatest', 'хамгийн их'], ['integer', 'бүхэл тоо']];
      if(b === 1){ const a = r.i(2, 9), c = r.i(1, 20), d = r.i(10, 60), lim = (d + c) / a, ans = Number.isInteger(lim) ? lim - 1 : Math.floor(lim);
        return sat(so(num(`What is the greatest integer ${M('x')} that satisfies the inequality ${M(`${a}x − ${c} < ${d}`)}?`, ans), `${a}x < ${d} + ${c} = ${d + c}`, `x < ${frac(d + c, a)}${Number.isInteger(lim) ? '' : ' ≈ ' + fmt(Math.round(lim * 100) / 100)}`, `Хатуу тэнцэтгэл биш тул хамгийн их бүхэл тоо: ${ans}`), gl, `${a}x − ${c} < ${d} тэнцэтгэл бишийг хангах хамгийн их бүхэл x-ийг ол.`); }
      if(b === 2){ const fee = r.i(10, 30), per = r.i(3, 8), B = fee + per * r.i(5, 15) + r.i(0, per - 1), ans = Math.floor((B - fee) / per);
        gl.push(['at most', 'хамгийн ихдээ'], ['per month', 'сард'], ['budget', 'төсөв']);
        return sat(so(num(`A phone plan costs ${usd(fee)} per month plus ${usd(per)} for each gigabyte of data used. Bat wants to spend at most ${usd(B)} on the plan this month. What is the greatest number of whole gigabytes of data he can use?`, ans), `g — гигабайт: ${fee} + ${per}g ≤ ${B}`, `${per}g ≤ ${B - fee}, g ≤ ${frac(B - fee, per)}`, `Хамгийн их бүхэл тоо: ${ans}`), gl, `Сарын төлбөр ${fee} доллар дээр 1 ГБ тутамд ${per} доллар нэмэгдэнэ. ${B} доллараас ихгүй зарцуулах бол хамгийн ихдээ хэдэн ГБ хэрэглэх вэ?`); }
      const a = r.i(10, 40), k = r.i(2, 7), c = r.i(-10, 10), lim = (a - c) / k, ans = Math.ceil(lim) === lim ? lim : Math.ceil(lim);
      gl.push(['least', 'хамгийн бага']);
      return sat(so(num(`What is the least integer value of ${M('x')} that satisfies ${M(`${a} − ${k}x ≤ ${fmt(c)}`)}?`, ans), `−${k}x ≤ ${fmt(c)} − ${a} = ${fmt(c - a)}`, `Сөрөг тоонд хуваахад тэмдэг эргэнэ: x ≥ ${frac(a - c, k)}`, `Хамгийн бага бүхэл тоо: ${ans}`), gl, `${a} − ${k}x ≤ ${fmt(c)}-ийг хангах хамгийн бага бүхэл x-ийг ол.`);
    },
    /* Problem solving: процент */
    pct(r, g){
      const b = tier(r, g), gl = [['percent', 'хувь'], ['discount', 'хөнгөлөлт'], ['sales tax', 'борлуулалтын татвар']];
      if(b === 1){ const p = r.pick([5, 10, 15, 20, 25, 30, 40, 60, 75]), n = r.i(2, 30) * 20;
        return sat(so(num(`What is ${M(p + '%')} of ${M(n)}?`, p * n / 100), `${p}% = ${p}/100`, `${n} · ${p}/100 = ${fmt(p * n / 100)}`), gl, `${n}-ийн ${p}%-ийг ол.`); }
      if(b === 2){ const price = r.i(4, 20) * 20, d = r.pick([10, 20, 25, 30, 40]), t = r.pick([5, 10]), fin = Math.round(price * (100 - d) * (100 + t)) / 10000;
        return sat(so(num(`A jacket originally priced at ${usd(price)} is on sale for ${M(d + '%')} off. A ${M(t + '%')} sales tax is applied to the sale price. What is the final cost of the jacket, in dollars?`, fin), `Хөнгөлөлттэй үнэ: ${price} · ${fmt((100 - d) / 100)} = ${fmt(price * (100 - d) / 100)}`, `Татвартай: ${fmt(price * (100 - d) / 100)} · ${fmt((100 + t) / 100)} = ${fmt(fin)}`, `Түгээмэл алдаа: ${d}% ба ${t}%-ийг хооронд нь хасаж нэг удаа тооцох.`), gl, `${price} долларын хүрэм ${d}% хямдарч, хямдарсан үнэ дээр ${t}% татвар нэмэгдэнэ. Эцсийн үнэ хэд вэ?`); }
      const p = r.pick([20, 25, 50]), q = r.pick([10, 20, 40]), orig = r.i(2, 9) * 100, fin = orig * (100 + p) * (100 - q) / 10000;
      gl.push(['increased', 'өссөн'], ['decreased', 'буурсан'], ['original', 'анхны']);
      return sat(so(num(`The value of a stock increased by ${M(p + '%')} on Monday and then decreased by ${M(q + '%')} on Tuesday. At the end of Tuesday its value was ${usd(fin)}. What was the value of the stock, in dollars, before Monday?`, orig), `Анхны утга V: V · ${fmt((100 + p) / 100)} · ${fmt((100 - q) / 100)} = ${fmt(fin)}`, `V · ${fmt((100 + p) * (100 - q) / 10000)} = ${fmt(fin)}`, `V = ${fmt(fin)} ÷ ${fmt((100 + p) * (100 - q) / 10000)} = ${orig}`), gl, `Хувьцааны үнэ даваа гарагт ${p}% өсөж, мягмарт ${q}% буурч ${fmt(fin)} доллар болжээ. Анхны үнийг ол.`);
    },
    /* Problem solving: харьцаа, пропорц */
    ratio(r, g){
      const b = tier(r, g), gl = [['ratio', 'харьцаа'], ['proportional', 'пропорциональ']];
      if(b === 1){ const a = r.i(1, 5), c = r.i(2, 7), k = r.i(3, 12);
        return sat(so(num(`In a club, the ratio of boys to girls is ${M(`${a} : ${c}`)}. There are ${M(k * (a + c))} members in the club. How many girls are in the club?`, k * c), `Нийт хэсэг: ${a} + ${c} = ${a + c}`, `Нэг хэсэг: ${k * (a + c)} ÷ ${a + c} = ${k}`, `Охид: ${c} · ${k} = ${k * c}`), gl, `Хөвгүүд ба охидын харьцаа ${a} : ${c}, нийт ${k * (a + c)} гишүүн. Охид хэд вэ?`); }
      if(b === 2){ const mpg = r.i(18, 40), g1 = r.i(3, 9), g2 = g1 + r.i(2, 8);
        gl.push(['miles', 'миль (≈1.6 км)'], ['gallons', 'галлон (≈3.8 л)'], ['at this rate', 'энэ хурдаар']);
        return sat(so(num(`A car travels ${M(mpg * g1)} miles using ${M(g1)} gallons of gasoline. At this rate, how many miles can the car travel using ${M(g2)} gallons?`, mpg * g2), `1 галлонд: ${mpg * g1} ÷ ${g1} = ${mpg} миль`, `${g2} галлонд: ${mpg} · ${g2} = ${mpg * g2} миль`), gl, `${g1} галлон бензинээр ${mpg * g1} миль явдаг машин ${g2} галлоноор хэдэн миль явах вэ?`); }
      const k = r.i(2, 9), x1 = r.i(2, 8), x2 = x1 + r.i(2, 9), y1 = k * x1;
      gl.push(['directly proportional', 'шууд пропорциональ'], ['constant', 'тогтмол']);
      return sat(so(num(`The variable ${M('y')} is directly proportional to ${M('x')}. When ${M(`x = ${x1}`)}, ${M(`y = ${y1}`)}. What is the value of ${M('y')} when ${M(`x = ${x2}`)}?`, k * x2), `y = kx, k = ${y1} ÷ ${x1} = ${k}`, `y = ${k} · ${x2} = ${k * x2}`), gl, `y нь x-тэй шууд пропорциональ. x = ${x1} үед y = ${y1} бол x = ${x2} үед y-ийг ол.`);
    },
    /* Advanced math: квадрат тэгшитгэл */
    quad(r, g){
      const b = tier(r, g), gl = [['solution', 'шийд'], ['positive', 'эерэг'], ['quadratic equation', 'квадрат тэгшитгэл']];
      if(b === 1){ const p = r.i(1, 9), n = r.i(1, 9), s = p - n, q = -p * n;
        return sat(so(num(`What is the positive solution to the equation ${M(`${poly([[1, 'x²'], [-s, 'x'], [q, '']])} = 0`)}?`, p), `Үржигдэхүүнд задлана: (x − ${p})(x + ${n}) = 0`, `x = ${p} эсвэл x = −${n}`, `Эерэг шийд: ${p}`), gl, `Квадрат тэгшитгэлийн эерэг шийдийг ол.`); }
      if(b === 2){ const a = r.i(2, 5), bb = r.nz(-12, 12), c = -r.i(1, 9);
        gl.push(['sum', 'нийлбэр']);
        return sat(so(num(`What is the sum of the solutions to the equation ${M(`${poly([[a, 'x²'], [bb, 'x'], [c, '']])} = 0`)}?`, -bb / a, frac(-bb, a)), `Дискриминант: ${bb}² − 4 · ${a} · ${par(c)} > 0 тул хоёр шийдтэй`, `Виетийн теорем: x₁ + x₂ = −b/a = ${frac(-bb, a)}`), gl, `Квадрат тэгшитгэлийн шийдүүдийн нийлбэрийг ол.`); }
      const t = r.i(2, 9), c = t * t;
      gl.push(['exactly one real solution', 'яг нэг бодит шийд'], ['constant', 'тогтмол']);
      return sat(so(num(`In the equation ${M(`x² + kx + ${c} = 0`)}, ${M('k')} is a positive constant. If the equation has exactly one real solution, what is the value of ${M('k')}?`, 2 * t), `Яг нэг шийдтэй бол дискриминант 0: k² − 4 · ${c} = 0`, `k² = ${4 * c}, k > 0 тул k = ${2 * t}`), gl, `x² + kx + ${c} = 0 яг нэг бодит шийдтэй бол эерэг k-г ол.`);
    },
    /* Advanced math: парабол, орой */
    qgraph(r, g){
      const b = tier(r, g), gl = [['vertex', 'орой'], ['minimum value', 'хамгийн бага утга'], ['graph', 'график']];
      if(b === 1){ const h = r.nz(-6, 6), k = r.i(-9, 9);
        return sat(so(num(`What is the minimum value of the function ${M(`f(x) = (x ${h < 0 ? '+' : '−'} ${Math.abs(h)})² ${k < 0 ? '−' : '+'} ${Math.abs(k)}`)}?`, k), `(x ${h < 0 ? '+' : '−'} ${Math.abs(h)})² ≥ 0, хамгийн бага нь 0 (x = ${h} үед)`, `Хамгийн бага утга: 0 + ${par(k)} = ${k}`), gl, `Функцийн хамгийн бага утгыг ол.`); }
      if(b === 2){ const h = r.nz(-6, 6), k = r.i(-15, 10), c = h * h + k;
        gl.push(['xy-plane', 'координатын хавтгай']);
        return sat(so(num(`In the ${M('xy')}-plane, the graph of ${M(`y = ${poly([[1, 'x²'], [-2 * h, 'x'], [c, '']])}`)} has its vertex at ${M('(h, k)')}. What is the value of ${M('k')}?`, k), `Оройн x: h = −b/(2a) = ${fmt(2 * h)}/2 = ${h}`, `k = y(${h}) = ${h * h} − ${par(2 * h * h)} + ${c} = ${k}`), gl, `Параболын орой (h; k) бол k-г ол.`); }
      const m = r.i(1, 3), s = r.i(2, 30), v = 32 * m, hmax = s + 16 * m * m;
      gl.push(['height', 'өндөр'], ['feet', 'фут'], ['seconds', 'секунд'], ['maximum', 'хамгийн их']);
      return sat(so(num(`A ball is thrown upward. Its height, in feet, ${M('t')} seconds after it is thrown is given by ${M(`h(t) = −16t² + ${v}t + ${s}`)}. What is the maximum height of the ball, in feet?`, hmax), `Хамгийн их өндөр оройд: t = −b/(2a) = ${v}/32 = ${m}`, `h(${m}) = −16 · ${m * m} + ${v} · ${m} + ${s} = ${hmax}`), gl, `Дээш шидсэн бөмбөгийн өндөр h(t) = −16t² + ${v}t + ${s}. Хамгийн их өндрийг ол.`);
    },
    /* Advanced math: илтгэгч өсөлт, бууралт */
    expo(r, g){
      const b = tier(r, g), gl = [['doubles', 'хоёр дахин өснө'], ['population', 'тоо толгой, хүн ам'], ['exponential', 'илтгэгч']];
      if(b === 1){ const P = r.i(2, 9) * 100, d = r.i(2, 6), n = r.i(2, 4);
        return sat(so(num(`A population of bacteria doubles every ${M(d)} hours. If the initial population is ${M(P)}, what will the population be after ${M(d * n)} hours?`, P * 2 ** n), `${d * n} цагт ${n} удаа хоёр дахин өснө`, `${P} · 2${sup(n)} = ${P} · ${2 ** n} = ${P * 2 ** n}`), gl, `Бактери ${d} цаг тутам 2 дахин өсдөг. Эхэндээ ${P} байсан бол ${d * n} цагийн дараа хэд болох вэ?`); }
      if(b === 2){ const a = r.i(2, 9) * 1000, p = r.pick([2, 3, 4, 5, 6, 8, 12, 15]);
        gl.push(['percent increase', 'өсөлтийн хувь'], ['each year', 'жил бүр']);
        return sat(so(num(`The function ${M(`f(t) = ${a}(${fmt(1 + p / 100)})${sup('t')}`)} models the number of people who visit a museum each year, ${M('t')} years after 2020. By what percent does the number of visitors increase each year?`, p), `f(t) = a(1 + r)${sup('t')} хэлбэр: 1 + r = ${fmt(1 + p / 100)}`, `r = ${fmt(p / 100)} = ${p}%`), gl, `f(t) = ${a}(${fmt(1 + p / 100)})${sup('t')} загварт жил бүрийн өсөлт хэдэн хувь вэ?`); }
      const V = r.i(2, 8) * 10000, p = r.pick([10, 20, 30]), fin = V * (100 - p) ** 2 / 10000;
      gl.push(['decreases', 'буурна'], ['value', 'үнэ']);
      return sat(so(num(`The value of a car decreases by ${M(p + '%')} each year. If the car is worth ${usd(V)} today, what will its value be, in dollars, after 2 years?`, fin), `Жил бүр үнэ ${fmt((100 - p) / 100)} дахин болно`, `${V} · ${fmt((100 - p) / 100)}² = ${V} · ${fmt((100 - p) ** 2 / 10000)} = ${fmt(fin)}`), gl, `Машины үнэ жил бүр ${p}% буурна. Одоо ${V} доллар бол 2 жилийн дараа хэд болох вэ?`);
    },
    /* Geometry: Пифагорын теорем */
    pyth(r, g){
      const b = tier(r, g), gl = [['right triangle', 'тэгш өнцөгт гурвалжин'], ['hypotenuse', 'гипотенуз'], ['leg', 'катет']];
      const [a0, b0, c0] = r.pick(TRIPLES), k = r.i(1, 3), A = a0 * k, B = b0 * k, C = c0 * k;
      if(b === 1) return sat(so(num(`A right triangle has legs of length ${M(A)} and ${M(B)}. What is the length of the hypotenuse?`, C), `c² = ${A}² + ${B}² = ${A * A} + ${B * B} = ${C * C}`, `c = ${C}`), gl, `Катетууд нь ${A} ба ${B} бол гипотенузыг ол.`);
      if(b === 2){ gl.push(['ladder', 'шат'], ['wall', 'хана'], ['ground', 'газар'], ['feet', 'фут']);
        return sat(so(num(`A ${M(C)}-foot ladder leans against a vertical wall. The bottom of the ladder is ${M(A)} feet from the base of the wall. How high up the wall, in feet, does the top of the ladder reach?`, B), `Шат — гипотенуз: h² + ${A}² = ${C}²`, `h² = ${C * C} − ${A * A} = ${B * B}, h = ${B}`), gl, `${C} фут урт шат хананд налаатай, доод үзүүр нь хананаас ${A} фут зайтай. Шатны орой хэр өндөрт хүрэх вэ?`); }
      const s = r.i(2, 9), t45 = r.pick([0, 1]);
      if(t45) return sat(so(num(`In an isosceles right triangle, each leg has length ${M(s)}. What is the length of the hypotenuse?`, s * Math.SQRT2, rootShow(2 * s * s)), `c² = ${s}² + ${s}² = ${2 * s * s}`, `c = √${2 * s * s} = ${s}√2`), gl.concat([['isosceles', 'адил хажуут']]), `Адил хажуут тэгш өнцөгт гурвалжны катет ${s} бол гипотенузыг ол.`);
      return sat(so(num(`In a right triangle, one angle measures ${M('30°')} and the hypotenuse has length ${M(2 * s)}. What is the length of the side opposite the ${M('60°')} angle?`, s * Math.sqrt(3), rootShow(3 * s * s)), `30° өнцгийн эсрэг катет = гипотенузын хагас = ${s}`, `60°-ийн эсрэг катет = ${s}√3`), gl.concat([['opposite', 'эсрэг талын']]), `30° өнцөгтэй тэгш өнцөгт гурвалжны гипотенуз ${2 * s} бол 60°-ийн эсрэг катетыг ол.`);
    },
    /* Geometry & trig: тригонометр харьцаа */
    trig(r, g){
      const b = tier(r, g), gl = [['sine', 'синус'], ['cosine', 'косинус'], ['tangent', 'тангенс'], ['opposite', 'эсрэг'], ['adjacent', 'хажуугийн']];
      let [a0, b0, c0] = r.pick(TRIPLES.filter(t => gcd(t[0], t[1]) === 1));
      if(b === 1){ if(r.i(0, 1)) [a0, b0] = [b0, a0]; const f = r.pick(['sin', 'cos', 'tan']), val = f === 'sin' ? [a0, c0] : f === 'cos' ? [b0, c0] : [a0, b0];
        const why = f === 'sin' ? 'эсрэг катет / гипотенуз = BC / AB' : f === 'cos' ? 'хажуугийн катет / гипотенуз = AC / AB' : 'эсрэг катет / хажуугийн катет = BC / AC';
        return sat(so(num(`In right triangle ${M('ABC')}, angle ${M('C')} is a right angle, ${M(`BC = ${a0}`)}, ${M(`AC = ${b0}`)}, and ${M(`AB = ${c0}`)}. What is the value of ${M(f + ' A')}?`, val[0] / val[1], frac(val[0], val[1])), `${f} A = ${why}`, `${f} A = ${frac(val[0], val[1])}`), gl, `ABC тэгш өнцөгт гурвалжинд ${f} A-г ол.`); }
      if(b === 2){ const x = r.i(10, 80);
        gl.push(['acute angle', 'хурц өнцөг']);
        return sat(so(num(`If ${M(`sin(${x}°) = cos(y°)`)}, where ${M('0 < y < 90')}, what is the value of ${M('y')}?`, 90 - x), `sin x° = cos(90° − x°)`, `y = 90 − ${x} = ${90 - x}`), gl, `sin(${x}°) = cos(y°) бол y-ийг ол (0 < y < 90).`); }
      return sat(so(num(`In right triangle ${M('PQR')}, angle ${M('R')} is a right angle and ${M(`cos P = ${a0}/${c0}`)}. What is the value of ${M('tan P')}?`, b0 / a0, frac(b0, a0)), `cos P = хажуугийн / гипотенуз = ${a0}/${c0}: хажуугийн катет ${a0}, гипотенуз ${c0} гэж үзнэ`, `Эсрэг катет = √(${c0}² − ${a0}²) = ${b0}`, `tan P = эсрэг / хажуугийн = ${frac(b0, a0)}`), gl, `cos P = ${a0}/${c0} бол tan P-г ол.`);
    },
    /* Geometry: тойрог */
    circle(r, g){
      const b = tier(r, g), gl = [['radius', 'радиус'], ['area', 'талбай'], ['circumference', 'тойргийн урт']];
      if(b === 1){ const rad = r.i(2, 12);
        return sat(so(num(`A circle has an area of ${M(`${rad * rad}π`)} square units. What is the radius of the circle?`, rad), `S = πr² = ${rad * rad}π`, `r² = ${rad * rad}, r = ${rad}`), gl, `Талбай нь ${rad * rad}π дугуйн радиусыг ол.`); }
      if(b === 2){ const rad = r.i(2, 12), ang = r.pick([30, 40, 45, 60, 72, 90, 120, 135, 150]), k = 2 * rad * ang / 360;
        gl.push(['arc', 'нум'], ['central angle', 'төв өнцөг']);
        return sat(so(num(`A circle has radius ${M(rad)}. An arc of the circle is intercepted by a central angle of ${M(ang + '°')}. The length of the arc is ${M('kπ')}. What is the value of ${M('k')}?`, k, frac(2 * rad * ang, 360)), `Нумын урт = 2πr · (α/360) = 2π · ${rad} · ${ang}/360`, `= ${frac(2 * rad * ang, 360)}π, k = ${frac(2 * rad * ang, 360)}`), gl, `Радиус ${rad}, төв өнцөг ${ang}° нумын урт kπ бол k-г ол.`); }
      const h = r.nz(-6, 6), k = r.nz(-6, 6), rad = r.i(2, 9), F = h * h + k * k - rad * rad;
      gl.push(['equation of a circle', 'тойргийн тэгшитгэл'], ['center', 'төв']);
      return sat(so(num(`The equation ${M(`${poly([[1, 'x²'], [-2 * h, 'x'], [1, 'y²'], [-2 * k, 'y'], [F, '']])} = 0`)} defines a circle in the ${M('xy')}-plane. What is the radius of the circle?`, rad), `Бүтэн квадрат ялгана: (x ${h < 0 ? '+' : '−'} ${Math.abs(h)})² + (y ${k < 0 ? '+' : '−'} ${Math.abs(k)})² = ${h * h} + ${k * k} − ${par(F)}`, `= ${rad * rad}, r = ${rad}`), gl, `Тойргийн тэгшитгэлээс радиусыг ол.`);
    },
    /* Geometry: эзлэхүүн */
    vol(r, g){
      const b = tier(r, g), gl = [['volume', 'эзлэхүүн'], ['cubic', 'куб (нэгж)']];
      if(b === 1){ const l = r.i(2, 12), w = r.i(2, 9), h = r.i(2, 10);
        gl.push(['rectangular prism', 'тэгш өнцөгт параллелепипед']);
        return sat(so(num(`A rectangular prism has length ${M(l)} cm, width ${M(w)} cm, and height ${M(h)} cm. What is its volume, in cubic centimeters?`, l * w * h), `V = урт · өргөн · өндөр = ${l} · ${w} · ${h} = ${l * w * h}`), gl, `Тэгш өнцөгт параллелепипедийн эзлэхүүнийг ол.`); }
      if(b === 2){ const rad = r.i(2, 9), h = r.i(2, 12);
        gl.push(['cylinder', 'цилиндр'], ['base', 'суурь']);
        return sat(so(num(`A right circular cylinder has a radius of ${M(rad)} and a height of ${M(h)}. Its volume is ${M('kπ')}. What is the value of ${M('k')}?`, rad * rad * h), `V = πr²h = π · ${rad}² · ${h} = ${rad * rad * h}π`, `k = ${rad * rad * h}`), gl, `Цилиндрийн эзлэхүүн kπ бол k-г ол.`); }
      const rad = 3 * r.i(1, 4);
      gl.push(['sphere', 'бөмбөрцөг']);
      return sat(so(num(`A sphere has a radius of ${M(rad)}. Its volume is ${M('kπ')}. What is the value of ${M('k')}?`, 4 * rad ** 3 / 3), `V = (4/3)πr³ = (4/3)π · ${rad ** 3}`, `= ${4 * rad ** 3 / 3}π, k = ${4 * rad ** 3 / 3}`), gl, `Бөмбөрцгийн эзлэхүүн kπ бол k-г ол.`);
    },
    /* Data: дундаж, медиан */
    stats(r, g){
      const b = tier(r, g), gl = [['mean', 'дундаж (арифметик)'], ['median', 'медиан'], ['data set', 'өгөгдлийн олонлог']];
      if(b === 1){ const n = r.i(4, 6), xs = Array.from({length: n}, () => r.i(5, 40)), rem = xs.reduce((s, x) => s + x, 0) % n; xs[n - 1] += rem ? n - rem : 0; const m = xs.reduce((s, x) => s + x, 0) / n;
        return sat(so(num(`What is the mean of the data set ${M(xs.join(', '))}?`, m), `Нийлбэр: ${xs.join(' + ')} = ${m * n}`, `Дундаж: ${m * n} ÷ ${n} = ${m}`), gl, `Өгөгдлийн дунджийг ол.`); }
      if(b === 2){ const xs = Array.from({length: 6}, () => r.i(1, 40)), so2 = xs.slice().sort((a, c) => a - c), med = (so2[2] + so2[3]) / 2;
        return sat(so(num(`What is the median of the data set ${M(xs.join(', '))}?`, med), `Эрэмбэлнэ: ${so2.join(', ')}`, `Тэгш тоотой тул дунд хоёрын дундаж: (${so2[2]} + ${so2[3]}) / 2 = ${fmt(med)}`), gl, `Өгөгдлийн медианыг ол.`); }
      const n = r.i(5, 12), m = r.i(60, 85), m2 = m + r.nz(-3, 3), x = (n + 1) * m2 - n * m;
      gl.push(['test scores', 'шалгалтын оноо'], ['added', 'нэмэгдсэн']);
      return sat(so(num(`The mean score of ${M(n)} students on a test was ${M(m)}. When one more student's score was added, the mean score of all ${M(n + 1)} students became ${M(m2)}. What was the score of the additional student?`, x), `Эхний нийлбэр: ${n} · ${m} = ${n * m}`, `Шинэ нийлбэр: ${n + 1} · ${m2} = ${(n + 1) * m2}`, `Нэмэгдсэн оноо: ${(n + 1) * m2} − ${n * m} = ${x}`), gl, `${n} сурагчийн дундаж ${m}. Нэг сурагч нэмэгдэхэд дундаж ${m2} болсон бол шинэ сурагчийн оноо хэд вэ?`);
    },
    /* Data: хоёр хэмжээст хүснэгт, магадлал */
    prob(r, g){
      const b = tier(r, g), gl = [['probability', 'магадлал'], ['at random', 'санамсаргүйгээр'], ['selected', 'сонгогдсон']];
      const a = r.i(8, 40), c = r.i(8, 40), d = r.i(8, 40), e = r.i(8, 40);
      const tbl = `<table class="sat-tbl"><tr><th></th><th>Likes math</th><th>Does not</th><th>Total</th></tr><tr><th>Grade 9</th><td>${a}</td><td>${c}</td><td>${a + c}</td></tr><tr><th>Grade 10</th><td>${d}</td><td>${e}</td><td>${d + e}</td></tr><tr><th>Total</th><td>${a + d}</td><td>${c + e}</td><td>${a + c + d + e}</td></tr></table>`;
      const N = a + c + d + e;
      gl.push(['survey', 'судалгаа'], ['given that', '…нөхцөлд']);
      if(b === 1) return sat(so(num(`The table shows the results of a survey of ${M(N)} students. ${tbl} If one of these students is selected at random, what is the probability that the student likes math?`, (a + d) / N, frac(a + d, N)), `Математикт дуртай: ${a} + ${d} = ${a + d}`, `P = ${a + d}/${N} = ${frac(a + d, N)}`), gl, `Санамсаргүй сонгосон сурагч математикт дуртай байх магадлал.`);
      return sat(so(num(`The table shows the results of a survey of ${M(N)} students. ${tbl} If a student is selected at random from those in grade 10, what is the probability that the student does not like math?`, e / (d + e), frac(e, d + e)), `Зөвхөн 10-р ангийнхныг авна: ${d + e} сурагч`, `Математикт дургүй: ${e}`, `P = ${e}/${d + e} = ${frac(e, d + e)}`), gl, `10-р ангийн сурагчдаас санамсаргүй сонгоход математикт дургүй байх магадлал.`);
    },
    /* Advanced math: функцийн тэмдэглэгээ */
    func(r, g){
      const b = tier(r, g), gl = [['function', 'функц'], ['defined by', '-аар тодорхойлогдсон'], ['value', 'утга']];
      if(b === 1){ const a = r.nz(-6, 7), c = r.i(-10, 10), x = r.i(-5, 8);
        return sat(so(num(`The function ${M('f')} is defined by ${M(`f(x) = ${poly([[a, 'x'], [c, '']])}`)}. What is the value of ${M(`f(${x})`)}?`, a * x + c), `x = ${x}-ийг орлуулна: f(${x}) = ${fmt(a)} · ${par(x)} + ${par(c)} = ${fmt(a * x + c)}`), gl, `f(${x})-ийн утгыг ол.`); }
      if(b === 2){ const p = r.i(1, 9), bb = r.nz(-4, 4), c = r.i(-5, 5), x = r.i(-3, 4), gx = bb * x + c, val = gx * gx - p;
        gl.push(['composite', 'давхар функц']);
        return sat(so(num(`The functions ${M('f')} and ${M('g')} are defined by ${M(`f(x) = x² − ${p}`)} and ${M(`g(x) = ${poly([[bb, 'x'], [c, '']])}`)}. What is the value of ${M(`f(g(${x}))`)}?`, val), `Эхлээд g(${x}) = ${fmt(bb)} · ${par(x)} + ${par(c)} = ${fmt(gx)}`, `f(${fmt(gx)}) = ${par(gx)}² − ${p} = ${fmt(val)}`), gl, `f(g(${x}))-ийн утгыг ол.`); }
      const a = r.nz(-4, 5), c = r.i(-10, 10), x1 = r.i(1, 3), x2 = x1 + r.i(1, 3);
      gl.push(['constants', 'тогтмолууд']);
      return sat(so(num(`For the function ${M(`f(x) = ax² + b`)}, where ${M('a')} and ${M('b')} are constants, ${M(`f(${x1}) = ${a * x1 * x1 + c}`)} and ${M(`f(${x2}) = ${a * x2 * x2 + c}`)}. What is the value of ${M('a')}?`, a), `f(${x2}) − f(${x1}) = a(${x2 * x2} − ${x1 * x1}) = ${fmt(a * (x2 * x2 - x1 * x1))}`, `a = ${fmt(a * (x2 * x2 - x1 * x1))} ÷ ${x2 * x2 - x1 * x1} = ${fmt(a)}`), gl, `f(x) = ax² + b функцийн a-г ол.`);
    },
    /* Advanced math: олон гишүүнт, адилтгал */
    poly(r, g){
      const b = tier(r, g), gl = [['equivalent', 'адилтгал тэнцүү'], ['expression', 'илэрхийлэл'], ['constant', 'тогтмол']];
      if(b === 1){ const a = r.nz(-9, 9), c = r.nz(-9, 9);
        return sat(so(num(`If ${M(`(x ${a < 0 ? '−' : '+'} ${Math.abs(a)})(x ${c < 0 ? '−' : '+'} ${Math.abs(c)}) = x² + kx + ${fmt(a * c)}`)} for all values of ${M('x')}, what is the value of ${M('k')}?`, a + c), `Задлана: x² + ${par(a)}x + ${par(c)}x + ${fmt(a * c)}`, `k = ${fmt(a)} + ${par(c)} = ${fmt(a + c)}`), gl, `Адилтгал тэнцүү байх k-г ол.`); }
      if(b === 2){ const a = r.i(2, 5), bb = r.nz(-7, 7), c = r.i(2, 5), d = r.nz(-7, 7);
        return sat(so(num(`The expression ${M(`(${poly([[a, 'x'], [bb, '']])})(${poly([[c, 'x'], [d, '']])})`)} is equivalent to ${M('px² + qx + r')}, where ${M('p')}, ${M('q')}, and ${M('r')} are constants. What is the value of ${M('q')}?`, a * d + bb * c), `x-тэй гишүүд: ${a} · ${par(d)} + ${par(bb)} · ${c}`, `q = ${fmt(a * d)} + ${par(bb * c)} = ${fmt(a * d + bb * c)}`), gl, `Үржвэрийг задлахад x-ийн коэффициент q-г ол.`); }
      const a = r.nz(-6, 6), bb = r.i(-9, 9), c = r.nz(-3, 3), rem = c ** 3 + a * c + bb;
      gl.push(['remainder', 'үлдэгдэл'], ['divided by', '…-д хуваахад']);
      return sat(so(num(`What is the remainder when ${M(`p(x) = ${poly([[1, 'x³'], [a, 'x'], [bb, '']])}`)} is divided by ${M(`x ${c < 0 ? '+' : '−'} ${Math.abs(c)}`)}?`, rem), `Безугийн теорем: үлдэгдэл = p(${c})`, `p(${c}) = ${par(c)}³ + ${fmt(a)} · ${par(c)} + ${par(bb)} = ${fmt(rem)}`), gl, `Олон гишүүнтийг хуваахад гарах үлдэгдлийг ол.`);
    },
    /* Advanced math: модуль */
    abs(r, g){
      const b = tier(r, g), gl = [['absolute value', 'модуль'], ['solutions', 'шийдүүд'], ['sum', 'нийлбэр']];
      const a = r.i(-9, 12), d = r.i(1, 9);
      if(b < 3) return sat(so(num(`What is the sum of the solutions to the equation ${M(`|x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| = ${d}`)}?`, 2 * a), `x − ${par(a)} = ${d} эсвэл x − ${par(a)} = −${d}`, `x = ${a + d} эсвэл x = ${a - d}`, `Нийлбэр: ${2 * a}`), gl, `Модультай тэгшитгэлийн шийдүүдийн нийлбэр.`);
      gl.push(['how many', 'хэдэн'], ['integers', 'бүхэл тоо']);
      return sat(so(num(`How many integers ${M('x')} satisfy ${M(`|x ${a < 0 ? '+' : '−'} ${Math.abs(a)}| ≤ ${d}`)}?`, 2 * d + 1), `−${d} ≤ x − ${par(a)} ≤ ${d}`, `${a - d} ≤ x ≤ ${a + d}`, `Бүхэл тоо: ${a + d} − ${par(a - d)} + 1 = ${2 * d + 1}`), gl, `Модультай тэнцэтгэл бишийг хангах бүхэл тооны тоо.`);
    },
    /* Advanced math: шулуун ба парабол огтлолцох */
    nlsys(r, g){
      const gl = [['intersect', 'огтлолцох'], ['solution', 'шийд'], ['positive', 'эерэг']];
      const p = r.i(1, 9), n = r.i(1, 9), s = p - n, c = p * n;   // x² − c = s x  → (x − p)(x + n)
      return sat(so(num(`The graphs of ${M(`y = x² − ${c}`)} and ${M(`y = ${poly([[s, 'x']]) || '0'}`)} intersect at two points in the ${M('xy')}-plane. What is the ${M('x')}-coordinate of the point with the positive ${M('x')}-coordinate?`, p), `Тэнцүүлнэ: x² − ${c} = ${poly([[s, 'x']])}`, `x² ${s < 0 ? '+' : '−'} ${Math.abs(s)}x − ${c} = 0 → (x − ${p})(x + ${n}) = 0`, `Эерэг шийд: x = ${p}`), gl, `Парабол ба шулууны огтлолцлын эерэг x-ийг ол.`);
    },
    /* Geometry & trig: радиан */
    rad(r, g){
      const gl = [['radian', 'радиан'], ['degrees', 'градус'], ['measure', 'хэмжээ']];
      const d = r.pick([30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]);
      return sat(so(num(`An angle measures ${M(d + '°')}. Its measure in radians is ${M('kπ')}. What is the value of ${M('k')}?`, d / 180, frac(d, 180)), `180° = π радиан`, `${d}° = ${d}/180 · π = ${frac(d, 180)}π`, `k = ${frac(d, 180)}`), gl, `${d}°-ийг радианаар kπ гэж бичвэл k хэд вэ?`);
    }
  };
  const MAP = {
    // 8-р анги — PSAT 8/9
    pct8: 'pct', scale: 'ratio', inverse: 'ratio', sys8: 'sys', ineq8: 'ineq', linf: 'linFunc', parab: 'qgraph', pyth8: 'pyth', circle8: 'circle', solid8: 'vol', prob8: 'prob', means8: 'stats', factor8: 'poly', sqform: 'poly', poly8: 'poly', rateq: 'linEq',
    // 9-р анги — PSAT 8/9
    pct9: 'pct', ratio9: 'ratio', sys9: 'sys', gsys9: 'sys', ineqs9: 'ineq', quad9: 'quad', qgraph9: 'qgraph', trig9: 'trig', cprob9: 'prob', grp9: 'stats', alg9: 'poly', solid9: 'vol', inv9: 'linFunc', rat9: 'linEq',
    // 10-р анги — PSAT 10
    slope10: 'linFunc', line10: 'linFunc', circle10: 'circle', quadf10: 'qgraph', quad10: 'quad', expf10: 'expo', lineq10: 'ineq', trig180: 'trig', arc10: 'circle', solid10: 'vol', quart10: 'stats', comp10: 'prob', func10: 'func', fact10: 'poly',
    // 11-р анги — SAT
    quad11: 'quad', qineq11: 'quad', linsys11: 'sys', nlsys11: 'nlsys', func11: 'func', comp11: 'func', gp11: 'expo', rad11: 'rad', mean11: 'stats', perp11: 'linFunc', ap11: 'linEq',
    // 12-р анги — SAT
    abs12: 'abs', abseq12: 'abs', absineq12: 'abs', poly12: 'poly', pdiv12: 'poly', bezout12: 'poly', expi12: 'expo'
  };
  W.addSat(MAP, S);

  /* ---------- 6–7-р анги: «Англи гүүр» — энгийн англи өгүүлбэр, богино бодлого ---------- */
  const B = {
    b_int(r, g){ const a = r.i(-15, 10), d = r.i(3, 15) * (g >= 7 ? r.pick([1, -1]) : 1), t = a + d;
      if(r.i(0, 1)) return sat(so(num(`The temperature was ${M(a + '°C')} in the morning. By noon it had ${d > 0 ? 'risen' : 'fallen'} by ${M(Math.abs(d) + '°C')}. What was the temperature at noon, in degrees Celsius?`, t), `${fmt(a)} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${fmt(t)}`), [['temperature', 'температур'], ['risen', 'өссөн'], ['fallen', 'буурсан'], ['noon', 'үд']], `Өглөө ${fmt(a)}°C байсан температур үд гэхэд ${Math.abs(d)} хэмээр ${d > 0 ? 'өссөн' : 'буурсан'}. Үдийн температур хэд вэ?`);
      const x = r.i(-12, 12), y = r.nz(-12, 12); return sat(so(num(`What is the value of ${M(`${fmt(x)} + ${par(y)}`)}?`, x + y), `${fmt(x)} + ${par(y)} = ${fmt(x + y)}`), [['value', 'утга']], `Нийлбэрийг ол.`); },
    b_frac(r, g){ const d1 = r.pick([2, 3, 4, 5, 6, 8]), d2 = r.pick([2, 4, 6, 8, 10, 12]), n1 = r.i(1, d1 - 1), n2 = r.i(1, d2 - 1);
      if(r.i(0, 2)) return sat(so(num(`What is ${M(`${n1}/${d1} + ${n2}/${d2}`)}?`, n1 / d1 + n2 / d2, frac(n1 * d2 + n2 * d1, d1 * d2)), `Ерөнхий хуваарь: ${d1 * d2 / gcd(d1, d2)}`, `${n1}/${d1} + ${n2}/${d2} = ${frac(n1 * d2 + n2 * d1, d1 * d2)}`), [['fraction', 'энгийн бутархай'], ['sum', 'нийлбэр']], `Бутархайнуудыг нэм.`);
      const c = r.i(2, 9) * 5; return sat(so(num(`Write ${M('0.' + String(c).padStart(2, '0'))} as a fraction in lowest terms. Enter the fraction.`, c / 100, frac(c, 100)), `0.${String(c).padStart(2, '0')} = ${c}/100 = ${frac(c, 100)}`), [['decimal', 'аравтын бутархай'], ['lowest terms', 'хураасан хэлбэр']], `Аравтын бутархайг хураасан энгийн бутархайгаар бич.`); },
    b_pct(r, g){ const p = r.pick([10, 20, 25, 50, 75]), n = r.i(2, 20) * 20;
      if(g >= 7 && r.i(0, 1)){ const price = r.i(2, 12) * 10; return sat(so(num(`A book costs ${usd(price)}. It is on sale for ${M(p + '%')} off. What is the sale price, in dollars?`, price * (100 - p) / 100), `Хөнгөлөлт: ${price} · ${p}/100 = ${fmt(price * p / 100)}`, `Үнэ: ${price} − ${fmt(price * p / 100)} = ${fmt(price * (100 - p) / 100)}`), [['costs', 'үнэтэй'], ['on sale', 'хямдралтай'], ['off', 'хасагдсан'], ['sale price', 'хямдарсан үнэ']], `${price} долларын ном ${p}% хямдарсан. Хямдарсан үнэ хэд вэ?`); }
      return sat(so(num(`What is ${M(p + '%')} of ${M(n)}?`, p * n / 100), `${n} · ${p}/100 = ${fmt(p * n / 100)}`), [['percent', 'хувь'], ['of', '-ийн']], `${n}-ийн ${p}%-ийг ол.`); },
    b_ratio(r, g){ const a = r.i(1, 5), c = r.i(2, 7), k = r.i(2, 9);
      return sat(so(num(`In a bag, the ratio of red marbles to blue marbles is ${M(`${a} : ${c}`)}. There are ${M(a * k)} red marbles. How many blue marbles are in the bag?`, c * k), `Нэг хэсэг: ${a * k} ÷ ${a} = ${k}`, `Цэнхэр: ${c} · ${k} = ${c * k}`), [['ratio', 'харьцаа'], ['marbles', 'бөмбөлөг'], ['red', 'улаан'], ['blue', 'цэнхэр']], `Улаан ба цэнхэр бөмбөлгийн харьцаа ${a} : ${c}, улаан нь ${a * k}. Цэнхэр хэд вэ?`); },
    b_eq(r, g){ const x = r.i(1, 15), a = r.i(2, 9), c = r.i(1, 20), t = r.i(0, g >= 7 ? 2 : 1);
      const eq = t === 0 ? `x + ${c} = ${x + c}` : t === 1 ? `${a}x = ${a * x}` : `${a}x + ${c} = ${a * x + c}`;
      const st = t === 0 ? [`x = ${x + c} − ${c} = ${x}`] : t === 1 ? [`x = ${a * x} ÷ ${a} = ${x}`] : [`${a}x = ${a * x + c} − ${c} = ${a * x}`, `x = ${x}`];
      return sat(so(num(`If ${M(eq)}, what is the value of ${M('x')}?`, x), ...st), [['if', 'хэрэв'], ['value', 'утга']], `${eq} бол x-ийг ол.`); },
    b_area(r, g){ const l = r.i(3, 15), w = r.i(2, 12);
      if(g >= 7 && r.i(0, 1)){ const bb = r.i(2, 10) * 2, h = r.i(2, 12); return sat(so(num(`A triangle has a base of ${M(bb)} cm and a height of ${M(h)} cm. What is the area of the triangle, in square centimeters?`, bb * h / 2), `S = (суурь · өндөр) / 2 = ${bb} · ${h} / 2 = ${bb * h / 2}`), [['triangle', 'гурвалжин'], ['base', 'суурь'], ['height', 'өндөр'], ['area', 'талбай'], ['square centimeters', 'см²']], `Гурвалжны талбайг ол.`); }
      if(r.i(0, 1)) return sat(so(num(`A rectangle is ${M(l)} m long and ${M(w)} m wide. What is its perimeter, in meters?`, 2 * (l + w)), `P = 2(${l} + ${w}) = ${2 * (l + w)}`), [['rectangle', 'тэгш өнцөгт'], ['long', 'урт'], ['wide', 'өргөн'], ['perimeter', 'периметр']], `Тэгш өнцөгтийн периметрийг ол.`);
      return sat(so(num(`A rectangle is ${M(l)} m long and ${M(w)} m wide. What is its area, in square meters?`, l * w), `S = ${l} · ${w} = ${l * w}`), [['rectangle', 'тэгш өнцөгт'], ['area', 'талбай'], ['square meters', 'м²']], `Тэгш өнцөгтийн талбайг ол.`); },
    b_mean(r, g){ const n = r.i(3, 5), xs = Array.from({length: n}, () => r.i(2, 30)), rem = xs.reduce((a, x) => a + x, 0) % n; xs[n - 1] += rem ? n - rem : 0; const m = xs.reduce((a, x) => a + x, 0) / n;
      return sat(so(num(`Saraa's test scores are ${M(xs.join(', '))}. What is the mean (average) of her scores?`, m), `Нийлбэр: ${xs.join(' + ')} = ${m * n}`, `Дундаж: ${m * n} ÷ ${n} = ${m}`), [['test scores', 'шалгалтын оноо'], ['mean', 'дундаж'], ['average', 'дундаж']], `Сараагийн онооны дунджийг ол.`); },
    b_prob(r, g){ const a = r.i(1, 9), c = r.i(1, 9);
      return sat(so(num(`A bag contains ${M(a)} red marbles and ${M(c)} blue marbles. One marble is chosen at random. What is the probability that it is red?`, a / (a + c), frac(a, a + c)), `Нийт: ${a} + ${c} = ${a + c}`, `P(улаан) = ${a}/${a + c}${frac(a, a + c) !== a + '/' + (a + c) ? ' = ' + frac(a, a + c) : ''}`), [['bag', 'уут'], ['contains', 'агуулна'], ['chosen at random', 'санамсаргүй сонгосон'], ['probability', 'магадлал']], `Уутанд ${a} улаан, ${c} цэнхэр бөмбөлөг бий. Санамсаргүй авсан нь улаан байх магадлал.`); },
    b_pow(r, g){ const a = r.i(2, 15);
      if(r.i(0, 1)) return sat(so(num(`What is the value of ${M(`${a}²`)}?`, a * a), `${a}² = ${a} · ${a} = ${a * a}`), [['value', 'утга'], ['squared', 'квадрат']], 'Тооны квадратыг ол.');
      return sat(so(num(`What is the value of ${M(`√${a * a}`)}?`, a), `${a} · ${a} = ${a * a} тул √${a * a} = ${a}`), [['square root', 'квадрат язгуур']], `Квадрат язгуурыг ол.`); },
    b_expr(r, g){ const a = r.i(2, 9), c = r.i(1, 12), x = r.i(1, 9) * (g >= 7 ? r.pick([1, -1]) : 1);
      return sat(so(num(`What is the value of ${M(`${a}n + ${c}`)} when ${M(`n = ${x}`)}?`, a * x + c), `${a} · ${par(x)} + ${c} = ${fmt(a * x + c)}`), [['when', '…үед'], ['value', 'утга']], `n = ${x} үед ${a}n + ${c}-ийн утгыг ол.`); },
    b_seq(r, g){ const s0 = r.i(1, 20), d = r.i(2, 9) * (g >= 7 && r.i(0, 1) ? -1 : 1), xs = [0, 1, 2, 3].map(i => s0 + d * i);
      return sat(so(num(`What is the next number in the pattern ${M(xs.join(', ') + ', …')}?`, s0 + 4 * d), `Ялгавар: ${fmt(d)}`, `${fmt(xs[3])} ${d < 0 ? '−' : '+'} ${Math.abs(d)} = ${fmt(s0 + 4 * d)}`), [['next', 'дараагийн'], ['pattern', 'дараалал, зүй тогтол']], `Дарааллын дараагийн тоог ол.`); },
    b_ang(r, g){ const a = r.i(10, 80), sup = r.i(0, 1), b0 = sup ? r.i(20, 160) : a;
      if(sup) return sat(so(num(`Two angles are supplementary. One angle measures ${M(b0 + '°')}. What is the measure of the other angle, in degrees?`, 180 - b0), `Гүйцэд өнцгийн нийлбэр 180°`, `180 − ${b0} = ${180 - b0}`), [['supplementary', 'гүйцэд (нийлбэр 180°)'], ['angle', 'өнцөг'], ['measure', 'хэмжээ']], `Гүйцэд хоёр өнцгийн нэг нь ${b0}°. Нөгөөг ол.`);
      return sat(so(num(`Two angles are complementary. One angle measures ${M(a + '°')}. What is the measure of the other angle, in degrees?`, 90 - a), `Хамар өнцгийн нийлбэр 90°`, `90 − ${a} = ${90 - a}`), [['complementary', 'хамар (нийлбэр 90°)'], ['angle', 'өнцөг']], `Хамар хоёр өнцгийн нэг нь ${a}°. Нөгөөг ол.`); },
    b_vol(r, g){ const l = r.i(2, 12), w = r.i(2, 9), h = r.i(2, 10);
      return sat(so(num(`A box is ${M(l)} cm long, ${M(w)} cm wide, and ${M(h)} cm tall. What is the volume of the box, in cubic centimeters?`, l * w * h), `V = ${l} · ${w} · ${h} = ${l * w * h}`), [['box', 'хайрцаг'], ['tall', 'өндөр'], ['volume', 'эзлэхүүн'], ['cubic centimeters', 'см³']], `Хайрцагны эзлэхүүнийг ол.`); },
    b_func(r, g){ const a = r.i(2, 6), c = r.i(-5, 9), x = r.i(1, 8);
      return sat(so(num(`The rule for a function is ${M(`y = ${poly([[a, 'x'], [c, '']])}`)}. What is the value of ${M('y')} when ${M(`x = ${x}`)}?`, a * x + c), `y = ${a} · ${x} + ${par(c)} = ${a * x + c}`), [['rule', 'дүрэм'], ['function', 'функц']], `x = ${x} үед y-ийн утгыг ол.`); }
  };
  W.addSat({int6: 'b_int', pow6: 'b_pow', alg6: 'b_expr', ang6: 'b_ang', eq6: 'b_eq', mean6: 'b_mean', frac6: 'b_frac', pct6: 'b_pct', func6: 'b_func', area6: 'b_area', prob6: 'b_prob', ratio6: 'b_ratio', seq6: 'b_seq', vol6: 'b_vol',
    int7: 'b_int', pow7: 'b_pow', alg7: 'b_expr', ang7: 'b_ang', eq7: 'b_eq', stat7: 'b_mean', prob7: 'b_prob', pct7: 'b_pct', seq7: 'b_seq', area7: 'b_area', ratio7: 'b_ratio', linf7: 'b_func', surf7: 'b_vol'}, B);
  /* SAT Math жишиг тестэд (js/satexam.js): ур чадвар → SAT-ийн хэсэг (domain); r.forceB = 1/2/3 хүндрэлийг тогтооно */
  W.SATGEN = {S, MAP, DOM: {alg: ['linEq', 'linFunc', 'sys', 'ineq'], adv: ['quad', 'qgraph', 'expo', 'func', 'poly', 'abs', 'nlsys'], psda: ['pct', 'ratio', 'stats', 'prob'], geo: ['pyth', 'trig', 'circle', 'vol', 'rad']}};
  W.SAT_BAND = g => g >= 11 ? 'SAT' : g >= 10 ? 'PSAT 10' : g >= 8 ? 'PSAT 8/9' : 'Англи гүүр';
  W.SAT_NAME = g => g >= 8 ? 'SAT шат' : 'Англи гүүр';
  W.SAT_SHORT = g => g >= 8 ? 'SAT' : 'EN';
})();
