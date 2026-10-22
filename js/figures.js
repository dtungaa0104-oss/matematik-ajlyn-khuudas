/* Геометрийн бодлогын зураг (SVG) үүсгэгч.
   Бодлого бүрийн тоон өгөгдлөөр зургийг автоматаар зурна: тал, өнцөг, тэмдэглэгээ нь бодлоготой таарна.
   Ертөнцийн координат (y дээшээ) → SVG координат руу автоматаар масштаблана. */
(function(){
  const INK = '#1A1F2B', SOFT = '#5A6275', FILL = '#EAF0FB', FILL2 = '#FBEFD9', ACC = '#1F4FBF';
  const D = Math.PI / 180;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const P = (r, deg, c = [0, 0]) => [c[0] + r * Math.cos(deg * D), c[1] + r * Math.sin(deg * D)];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const cen = ps => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  class Fig {
    constructor(W = 240, H = 170){ this.W = W; this.H = H; this.ops = []; this.bb = []; this.pad = 26; this._tb = []; }
    _b(...ps){ ps.forEach(p => this.bb.push(p)); }
    poly(ps, o = {}){ this._b(...ps); this.ops.push(T => `<polygon points="${ps.map(p => T(p).map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${o.fill || FILL}" stroke="${o.stroke || INK}" stroke-width="${o.w || 1.6}" stroke-linejoin="round"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`); return this; }
    line(ps, o = {}){ this._b(...ps); this.ops.push(T => `<polyline points="${ps.map(p => T(p).map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${o.stroke || INK}" stroke-width="${o.w || 1.6}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`); return this; }
    seg(a, b, o = {}){ return this.line([a, b], o); }
    arrow(a, b, o = {}){
      this.seg(a, b, o);
      this.ops.push(T => { const [x1, y1] = T(a), [x2, y2] = T(b), t = Math.atan2(y2 - y1, x2 - x1), L = 9;
        const p1 = [x2 - L * Math.cos(t - .38), y2 - L * Math.sin(t - .38)], p2 = [x2 - L * Math.cos(t + .38), y2 - L * Math.sin(t + .38)];
        return `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="${o.stroke || INK}"/>`; });
      return this;
    }
    circle(c, r, o = {}){ this._b([c[0] - r, c[1] - r], [c[0] + r, c[1] + r]); this.ops.push((T, s) => { const [x, y] = T(c); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * s).toFixed(1)}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.w || 1.6}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`; }); return this; }
    ell(c, rx, ry, a0 = 0, a1 = 360, o = {}){ const ps = []; for(let t = a0; t <= a1 + 1e-9; t += (a1 - a0) / 48) ps.push([c[0] + rx * Math.cos(t * D), c[1] + ry * Math.sin(t * D)]); return this.line(ps, o); }
    sector(c, r, a0, a1, o = {}){ const ps = [c]; for(let t = a0; t <= a1 + 1e-9; t += (a1 - a0) / 40) ps.push(P(r, t, c)); return this.poly(ps, {fill: o.fill || FILL2, ...o}); }
    dot(p, o = {}){ this._b(p); this.ops.push(T => { const [x, y] = T(p); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.r || 2.6}" fill="${o.fill || INK}"/>`; }); return this; }
    /* Бичвэр: p цэгээс dir чиглэлд (ертөнцийн) dist пиксел зайд */
    text(p, s, dir = [0, 1], o = {}){
      this._b(p);
      this.ops.push(T => {
        const [x, y] = T(p), L = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / L, uy = -dir[1] / L, d = o.dist ?? 11;
        const tx = x + ux * d, ty = y + uy * d + 4.5 + uy * 2;
        const anchor = ux > .35 ? 'start' : ux < -.35 ? 'end' : 'middle';
        const style = o.pt ? 'font-style:italic;font-weight:700' : '';
        const fs = o.size || 13, tw = String(s).length * fs * .56, x0 = anchor === 'start' ? tx : anchor === 'end' ? tx - tw : tx - tw / 2; this._tb.push([x0 - 2, ty - fs, x0 + tw + 2, ty + 4]);
        return `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" font-size="${o.size || 13}" fill="${o.fill || INK}" style="${style}">${esc(s)}</text>`;
      });
      return this;
    }
    /* Оройн нэрс: төвөөс гадагш */
    names(ps, ns){ const c = cen(ps); ps.forEach((p, i) => ns[i] && this.text(p, ns[i], sub(p, c), {pt: true, dist: 10})); return this; }
    /* Талын урт: хэрчмийн дунд, дүрсийн төвөөс гадагш */
    side(a, b, s, inside, o = {}){ if(s == null || s === '') return this; const m = mid(a, b); let n = [-(b[1] - a[1]), b[0] - a[0]]; if(inside && (n[0] * (m[0] - inside[0]) + n[1] * (m[1] - inside[1])) < 0) n = mul(n, -1); return this.text(m, s, n, {dist: 9, fill: o.fill || ACC, size: o.size || 13}); }
    /* Өнцгийн нум ба тэмдэглэгээ (v орой, a ба b цацраг) — дэлгэцийн координатаар зурна */
    angle(v, a, b, s, o = {}){
      this._b(v);
      this.ops.push(T => {
        const [vx, vy] = T(v), [ax, ay] = T(a), [bx, by] = T(b);
        let t1 = Math.atan2(ay - vy, ax - vx), t2 = Math.atan2(by - vy, bx - vx), dt = t2 - t1;
        while(dt <= -Math.PI) dt += 2 * Math.PI; while(dt > Math.PI) dt -= 2 * Math.PI;
        if(o.reflex) dt = dt > 0 ? dt - 2 * Math.PI : dt + 2 * Math.PI;
        const R = o.r || 18, n = 24, pts = [];
        for(let i = 0; i <= n; i++){ const t = t1 + dt * i / n; pts.push([vx + R * Math.cos(t), vy + R * Math.sin(t)]); }
        const tm = t1 + dt / 2, lr = R + (o.ld || 11);
        let out = `<polyline points="${pts.map(p => p.map(q => q.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${o.stroke || ACC}" stroke-width="1.4"/>`;
        if(o.double){ const p2 = []; for(let i = 0; i <= n; i++){ const t = t1 + dt * i / n; p2.push([vx + (R + 4) * Math.cos(t), vy + (R + 4) * Math.sin(t)]); } out += `<polyline points="${p2.map(p => p.map(q => q.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${o.stroke || ACC}" stroke-width="1.4"/>`; }
        if(s != null && s !== ''){ const tx = vx + lr * Math.cos(tm), ty = vy + lr * Math.sin(tm) + 4.5, c = Math.cos(tm); const tw = String(s).length * 7, an = c > .45 ? 0 : c < -.45 ? 1 : .5; this._tb.push([tx - tw * an - 2, ty - 13, tx + tw * (1 - an) + 2, ty + 4]); out += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${c > .45 ? 'start' : c < -.45 ? 'end' : 'middle'}" font-size="12.5" fill="${o.fill || ACC}">${esc(s)}</text>`; }
        return out;
      });
      return this;
    }
    right(v, a, b){
      this._b(v);
      this.ops.push(T => { const [vx, vy] = T(v), [ax, ay] = T(a), [bx, by] = T(b), k = 9;
        const ua = [(ax - vx), (ay - vy)], ub = [(bx - vx), (by - vy)], la = Math.hypot(...ua), lb = Math.hypot(...ub);
        const p1 = [vx + ua[0] / la * k, vy + ua[1] / la * k], p3 = [vx + ub[0] / lb * k, vy + ub[1] / lb * k], p2 = [p1[0] + ub[0] / lb * k, p1[1] + ub[1] / lb * k];
        return `<polyline points="${[p1, p2, p3].map(p => p.map(q => q.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${INK}" stroke-width="1.2"/>`; });
      return this;
    }
    ticks(a, b, n = 1){
      this.ops.push(T => { const [x1, y1] = T(a), [x2, y2] = T(b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; let s = '';
        for(let i = 0; i < n; i++){ const o = (i - (n - 1) / 2) * 4, cx = mx + ux * o, cy = my + uy * o; s += `<line x1="${(cx - uy * 5).toFixed(1)}" y1="${(cy + ux * 5).toFixed(1)}" x2="${(cx + uy * 5).toFixed(1)}" y2="${(cy - ux * 5).toFixed(1)}" stroke="${INK}" stroke-width="1.3"/>`; } return s; });
      return this;
    }
    svg(){
      const xs = this.bb.map(p => p[0]), ys = this.bb.map(p => p[1]);
      const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
      const dx = Math.max(maxx - minx, 1e-6), dy = Math.max(maxy - miny, 1e-6), pad = this.pad;
      const s = Math.min((this.W - 2 * pad) / dx, (this.H - 2 * pad) / dy);
      const ox = (this.W - dx * s) / 2, oy = (this.H - dy * s) / 2;
      const T = p => [ox + (p[0] - minx) * s, this.H - oy - (p[1] - miny) * s];
      this._tb = []; const body = this.ops.map(f => f(T, s)).join('');
      let x0 = 0, y0 = 0, x1 = this.W, y1 = this.H; this._tb.forEach(b => { x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); });
      const vw = x1 - x0, vh = y1 - y0;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" width="${vw.toFixed(0)}" height="${vh.toFixed(0)}" font-family="'PT Serif', Georgia, serif" role="img" aria-label="Бодлогын зураг">${body}</svg>`;
    }
  }

  /* ---------- Бэлэн дүрсүүд ---------- */
  const F = {};
  F.Fig = Fig; F.P = P;

  /* Гурвалжин: A, B, C цэгүүд (ертөнц), o = {names, sides:{a,b,c}, angles:{A,B,C}, right:'A'|'B'|'C', ticks:{a,b,c}, extra:fn} */
  F.tri = (A, B, C, o = {}) => {
    const f = new Fig(o.W, o.H), c = cen([A, B, C]), V = {A, B, C};
    f.poly([A, B, C]);
    if(o.right){ const v = V[o.right], [p, q] = ['A', 'B', 'C'].filter(k => k !== o.right).map(k => V[k]); f.right(v, p, q); }
    const ang = o.angles || {};
    if(ang.A) f.angle(A, B, C, ang.A); if(ang.B) f.angle(B, C, A, ang.B); if(ang.C) f.angle(C, A, B, ang.C);
    const sd = o.sides || {};
    f.side(B, C, sd.a, c); f.side(C, A, sd.b, c); f.side(A, B, sd.c, c);
    const tk = o.ticks || {}; if(tk.a) f.ticks(B, C, tk.a); if(tk.b) f.ticks(C, A, tk.b); if(tk.c) f.ticks(A, B, tk.c);
    if(o.extra) o.extra(f, {A, B, C});
    f.names([A, B, C], o.names || ['A', 'B', 'C']);
    return f.svg();
  };
  /* Талуудаар гурвалжин байгуулах (a = BC, b = CA, c = AB) */
  F.triSides = (a, b, c) => { const A = [0, 0], B = [c, 0], x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(b * b - x * x, 1e-6)); return [A, B, [x, y]]; };
  /* Тэгш өнцөгт гурвалжин: C-д тэгш өнцөг, BC = a (хэвтээ), AC = b (босоо) */
  F.rightTri = (a, b, o = {}) => F.tri([0, b], [a, 0], [0, 0], {right: 'C', ...o});

  /* Зургийг хэт нарийн болгохгүйн тулд харьцааг хязгаарлана (зураг масштабгүй, тоо нь бодлогынх) */
  const fit = (w, h, lo = .32, hi = 1.4) => { const r = Math.min(hi, Math.max(lo, h / w)); return [1, r]; };
  const fit3 = (...v) => { const m = Math.max(...v); return v.map(x => Math.max(x, m * .38) / m); };
  F.rect = (w0, h0, o = {}) => { const [w, h] = o.exact ? [w0, h0] : fit(w0, h0), f = new Fig(o.W, o.H), ps = [[0, 0], [w, 0], [w, h], [0, h]], c = [w / 2, h / 2]; f.poly(ps); [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j]) => f.right(ps[i], ps[(i + 3) % 4], ps[j])); f.side(ps[0], ps[1], o.bottom, c); f.side(ps[1], ps[2], o.right, c); if(o.diag){ f.seg(ps[0], ps[2], {dash: true}); f.side(ps[0], ps[2], o.diag, [w, 0]); } if(o.names) f.names(ps, o.names); if(o.extra) o.extra(f, ps); return f.svg(); };
  F.trap = (b0, a0, h0, o = {}) => { const b = 1, a = Math.min(.8, Math.max(.3, a0 / b0)), h = Math.min(.8, Math.max(.3, h0 / b0)); const f = new Fig(o.W, o.H), sh = (b - a) * .35, ps = [[0, 0], [b, 0], [sh + a, h], [sh, h]], c = cen(ps); f.poly(ps); const H0 = [sh, 0]; f.seg(ps[3], H0, {dash: true}); f.right(H0, ps[3], ps[1]); f.side(ps[0], ps[1], o.bottom, c); f.side(ps[2], ps[3], o.top, c); f.text(mid(ps[3], H0), o.h || '', [1, 0], {fill: ACC, dist: 5}); if(o.names) f.names(ps, o.names); return f.svg(); };
  F.para = (b0, h0, o = {}) => { const [b, h] = fit(b0, h0, .35, .9); const f = new Fig(o.W, o.H), sh = b * .3, ps = [[0, 0], [b, 0], [b + sh, h], [sh, h]], c = cen(ps); f.poly(ps); if(o.angleA) f.angle(ps[0], ps[1], ps[3], o.angleA); if(o.angleB) f.angle(ps[1], ps[2], ps[0], o.angleB); if(o.h){ const H0 = [sh, 0]; f.seg(ps[3], H0, {dash: true}); f.right(H0, ps[3], ps[1]); f.text(mid(ps[3], H0), o.h, [1, 0], {fill: ACC, dist: 5}); } f.side(ps[0], ps[1], o.bottom, c); f.names(ps, o.names || ['A', 'B', 'C', 'D']); return f.svg(); };

  /* Нэг цэгээс гарсан цацрагууд (өнцгүүд градусаар, 0° = баруун), labels: өнцөг бүрийн тэмдэглэгээ */
  F.rays = (dirs, labels, o = {}) => { const f = new Fig(o.W || 220, o.H || 150), O = [0, 0]; dirs.forEach(t => f.seg(O, P(1, t))); if(o.line) f.seg(P(1, 180), P(1, 0)); for(let i = 0; i < labels.length; i++){ if(!labels[i]) continue; const a = dirs[i], b = dirs[(i + 1) % dirs.length], span = ((b - a) % 360 + 360) % 360; f.angle(O, P(1, a), P(1, b), labels[i], {r: 16 + (i % 2) * 7, reflex: span > 180, ld: span < 40 ? 11 + (40 - span) * .9 : 11}); } f.dot(O); if(o.half) f._b([-1, -.2], [1, 1]); else f._b([-1, -1], [1, 1]); return f.svg(); };

  /* a ∥ b, c огтлогч: өнцгийн тэмдэглэгээ */
  F.parallel = (theta, l1, l2, o = {}) => {
    const f = new Fig(o.W || 230, o.H || 150), y1 = 1, y2 = 0, t = Math.tan(theta * D), X1 = [.2 + 1 / t * 0, y1], p1 = [0.5, y1], p2 = [0.5 - 1 / t, y2];
    f.seg([-1.4, y1], [1.8, y1]); f.seg([-1.4, y2], [1.8, y2]);
    const dir = sub(p1, p2), e1 = add(p1, mul(dir, .45)), e2 = sub(p2, mul(dir, .45)); f.seg(e2, e1);
    f.text([1.8, y1], 'a', [1, 0], {pt: true}); f.text([1.8, y2], 'b', [1, 0], {pt: true}); f.text(e1, 'c', [1, 1], {pt: true, dist: 6});
    // l1: дээд огтлолцол дээр баруун-доод өнцөг; l2: доод огтлолцол дээр зүүн-дээд өнцөг (солбисон)
    if(l1) f.angle(p1, [1.8, y1], p2, l1, {r: 16});
    if(l2) f.angle(p2, [-1.4, y2], p1, l2, {r: 16});
    return f.svg();
  };

  /* Зөв олон өнцөгт */
  F.ngon = (n, o = {}) => { const f = new Fig(o.W || 190, o.H || 160), ps = Array.from({length: n}, (_, i) => P(1, 90 + 180 / n + i * 360 / n)); f.poly(ps); if(o.inner) f.angle(ps[0], ps[n - 1], ps[1], o.inner, {r: 14}); if(o.outer){ const e = add(ps[0], mul(sub(ps[0], ps[n - 1]), .6)); f.seg(ps[0], e, {dash: true}); f.angle(ps[0], e, ps[1], o.outer, {r: 14}); } for(let i = 0; i < n; i++) f.ticks(ps[i], ps[(i + 1) % n], 1); return f.svg(); };

  /* Тойрог: төв өнцөг ба багтсан өнцөг (нум AB, багтсан C) */
  F.inscribed = (arc0, o = {}) => { const arcDeg = Math.min(300, Math.max(56, arc0)), f = new Fig(o.W || 200, o.H || 170), O = [0, 0], a0 = -90 - arcDeg / 2, A = P(1, a0), B = P(1, a0 + arcDeg), C = P(1, a0 + arcDeg + (360 - arcDeg) / 2); f.circle(O, 1); f.line([A, C, B]); if(o.central !== false){ f.line([A, O, B]); f.angle(O, A, B, o.central || '', {r: 14}); } f.angle(C, A, B, o.ins || '', {r: 18}); f.dot(O); f.text(O, 'O', [-1, .6], {pt: true, dist: 8}); f.names([A, B, C], ['A', 'B', 'C'].map((s, i) => s)); return f.svg(); };

  /* Тойрогт хоёр хөвч K цэгт огтлолцох */
  F.chords = (lab, o = {}) => { const f = new Fig(o.W || 200, o.H || 170), O = [0, 0], A = P(1, 150), B = P(1, -20), C = P(1, 60), Dd = P(1, 230); f.circle(O, 1); f.seg(A, B); f.seg(C, Dd);
    const den = (A[0] - B[0]) * (C[1] - Dd[1]) - (A[1] - B[1]) * (C[0] - Dd[0]), t = ((A[0] - C[0]) * (C[1] - Dd[1]) - (A[1] - C[1]) * (C[0] - Dd[0])) / den, K = lerp(A, B, t);
    f.dot(K); f.text(K, o.K || 'K', [.2, -1], {pt: true, dist: 10}); f.names([A, B, C, Dd], o.names || ['A', 'B', 'C', 'D']);
    const L = lab || {}; f.side(A, K, L.AK, [0, -1]); f.side(K, B, L.KB, [0, 1]); f.side(C, K, L.CK, [-1, 0]); f.side(K, Dd, L.KD, [1, 0]); return f.svg(); };

  /* Шүргэгч ба огтлогч: P гадна цэг, PT шүргэгч, P-A-B огтлогч */
  F.tangent = (lab, o = {}) => { const f = new Fig(o.W || 240, o.H || 160), O = [0, 0], Pp = [-2.6, 0], d = 2.6, tA = Math.acos(1 / d) / D, T0 = P(1, 180 - tA), t2 = -18;
    const dir = [Math.cos(t2 * D), Math.sin(t2 * D)], bq = 2 * (dir[0] * (Pp[0]) + dir[1] * Pp[1]), cq = Pp[0] ** 2 + Pp[1] ** 2 - 1, disc = Math.sqrt(bq * bq - 4 * cq), s1 = (-bq - disc) / 2, s2 = (-bq + disc) / 2, A = add(Pp, mul(dir, s1)), B = add(Pp, mul(dir, s2));
    f.circle(O, 1); f.seg(Pp, T0); f.seg(Pp, B); f.dot(Pp); f.dot(T0); f.dot(A); f.dot(B); f.text(Pp, 'P', [-1, 0], {pt: true}); f.text(T0, 'T', [0, 1], {pt: true}); f.text(A, 'A', [.3, 1], {pt: true}); f.text(B, 'B', [1, -.3], {pt: true});
    const L = lab || {}; f.side(Pp, T0, L.PT, [0, -1]); f.side(Pp, A, L.PA, [0, 1]); f.side(A, B, L.AB, [0, 1]); return f.svg(); };

  /* Сектор: радиус, төв өнцөг */
  F.sector = (deg, o = {}) => { const f = new Fig(o.W || 200, o.H || 160), O = [0, 0], a0 = 90 - deg / 2; f.circle(O, 1, {dash: true, stroke: SOFT}); f.sector(O, 1, a0 - 0, a0 + deg); f.angle(O, P(1, a0), P(1, a0 + deg), o.ang || '', {r: 14, reflex: deg > 180}); f.side(O, P(1, a0), o.r || '', P(1, a0 + deg)); if(o.arc){ f.line(Array.from({length: 41}, (_, i) => P(1, a0 + deg * i / 40)), {stroke: ACC, w: 2.6}); f.text(P(1, a0 + deg / 2), o.arc, P(1, a0 + deg / 2), {fill: ACC, dist: 10}); } f.dot(O); return f.svg(); };

  /* Хойд зүгтэй үүсгэх өнцөг: хойд чиглэл, цагийн зүүний дагуу deg */
  F.bearing = (deg, o = {}) => { const f = new Fig(o.W || 200, o.H || 170), O = [0, 0]; f.arrow(O, [0, 1.1]); f.text([0, 1.1], 'Хойд', [0, 1], {dist: 9, size: 12, fill: SOFT}); f.seg([0, -1], [0, 0], {dash: true, stroke: SOFT}); f.seg([-1, 0], [1, 0], {dash: true, stroke: SOFT}); const T = P(1, 90 - deg); f.arrow(O, T, {stroke: ACC}); const dd = Math.min(deg, 360 - deg); f.angle(O, [0, 1], T, o.label || '', {r: 20, ld: dd < 35 ? 26 : 13, reflex: !o.small && deg > 180}); f.dot(O); const fd = deg > 90 && deg < 270 ? [-1, .35] : [-1, -.6]; f.text(O, o.from || 'A', fd, {pt: true, dist: 12, size: 12}); const ux = T[0], uy = T[1]; f.text(T, o.to || 'B', [ux + uy * .9, uy - ux * .9], {pt: true, dist: 11, size: 12}); f._b([-1.1, -1.1], [1.1, 1.2]); return f.svg(); };

  /* Хайрцаг (тэгш өнцөгт параллелепипед) — урт a, өргөн b (гүн), өндөр c */
  F.box = (a0, b0, c0, o = {}) => { const [a, b, c] = fit3(a0, b0, c0); const f = new Fig(o.W || 230, o.H || 160), k = .5, dv = [b * k * Math.cos(35 * D), b * k * Math.sin(35 * D)];
    const A = [0, 0], B = [a, 0], C = [a, c], Dd = [0, c], A2 = add(A, dv), B2 = add(B, dv), C2 = add(C, dv), D2 = add(Dd, dv);
    f.poly([A, B, C, Dd], {fill: FILL}); f.poly([B, B2, C2, C], {fill: '#DCE5F7'}); f.poly([Dd, C, C2, D2], {fill: '#F3F6FC'});
    f.seg(A, A2, {dash: true, stroke: SOFT, w: 1.2}); f.seg(A2, B2, {dash: true, stroke: SOFT, w: 1.2}); f.seg(A2, D2, {dash: true, stroke: SOFT, w: 1.2});
    f.side(A, B, o.a, [a / 2, c]); f.side(B, B2, o.b, [0, c]); f.side(B2, C2, o.c, A); return f.svg(); };

  F.cylinder = (r, h, o = {}) => { const f = new Fig(o.W || 200, o.H || 170), ry = r * .3; if(o.section) f.poly([[-r, 0], [r, 0], [r, h], [-r, h]], {fill: 'rgba(198,138,18,.22)', stroke: '#C68A12', w: 1.2}); f.ell([0, 0], r, ry, 180, 360); f.ell([0, 0], r, ry, 0, 180, {dash: true, stroke: SOFT, w: 1.2}); f.ell([0, h], r, ry, 0, 360); f.seg([-r, 0], [-r, h]); f.seg([r, 0], [r, h]); f.seg([0, 0], [r, 0], {stroke: ACC, w: 1.3}); f.dot([0, 0], {r: 2}); f.side([0, 0], [r, 0], o.r, [0, h]); f.seg([0, 0], [0, h], {dash: true, stroke: SOFT, w: 1.1}); f.text([r, h / 2], o.h || '', [1, 0], {fill: ACC}); return f.svg(); };
  F.cone = (r, h, o = {}) => { const f = new Fig(o.W || 200, o.H || 170), ry = r * .3, S = [0, h]; if(o.section) f.poly([[-r, 0], [r, 0], S], {fill: 'rgba(198,138,18,.22)', stroke: '#C68A12', w: 1.2}); f.ell([0, 0], r, ry, 180, 360); f.ell([0, 0], r, ry, 0, 180, {dash: true, stroke: SOFT, w: 1.2}); f.seg([-r, 0], S); f.seg([r, 0], S); f.seg([0, 0], S, {dash: true, stroke: SOFT, w: 1.1}); f.seg([0, 0], [r, 0], {stroke: ACC, w: 1.3}); f.dot([0, 0], {r: 2}); f.right([0, 0], S, [r, 0]); f.side([0, 0], [r, 0], o.r, [0, h]); f.text([0, h / 2], o.h || '', [-1, 0], {fill: ACC, dist: 5}); if(o.l) f.side([r, 0], S, o.l, [0, 0]); return f.svg(); };
  F.sphere = (R, o = {}) => { const f = new Fig(o.W || 180, o.H || 170); f.circle([0, 0], R, {fill: FILL}); f.ell([0, 0], R, R * .28, 180, 360); f.ell([0, 0], R, R * .28, 0, 180, {dash: true, stroke: SOFT, w: 1.1});
    if(o.cut != null){ const d = o.cut, rr = Math.sqrt(Math.max(R * R - d * d, 0)); f.ell([0, d], rr, rr * .28, 0, 360, {stroke: ACC}); f.seg([0, 0], [0, d], {stroke: ACC, w: 1.3}); f.seg([0, d], [rr, d], {dash: true, stroke: SOFT}); f.seg([0, 0], [rr, d], {stroke: SOFT, w: 1.1}); f.text([0, d / 2], o.d || '', [-1, 0], {fill: ACC, dist: 5}); f.side([0, 0], [rr, d], o.R || '', [-R, 0]); }
    else { f.seg([0, 0], [R, 0], {stroke: ACC, w: 1.3}); f.side([0, 0], [R, 0], o.R || '', [0, -R]); }
    f.dot([0, 0], {r: 2}); return f.svg(); };
  F.pyramid = (a, h, o = {}) => { const f = new Fig(o.W || 210, o.H || 170), dv = [a * .45 * Math.cos(30 * D), a * .45 * Math.sin(30 * D)], A = [0, 0], B = [a, 0], C = add(B, dv), Dd = add(A, dv), M = mul(add(A, C), .5), S = add(M, [0, h]);
    f.line([A, B, C], {}); f.seg(A, Dd, {dash: true, stroke: SOFT, w: 1.2}); f.seg(Dd, C, {dash: true, stroke: SOFT, w: 1.2}); f.seg(S, A); f.seg(S, B); f.seg(S, C); f.seg(S, Dd, {dash: true, stroke: SOFT, w: 1.2}); f.seg(S, M, {dash: true, stroke: ACC, w: 1.2}); f.dot(M, {r: 2});
    if(o.apo){ const E = mid(A, B); f.seg(S, E, {stroke: ACC, w: 1.3}); f.right(E, S, B); if(typeof o.apo === 'string') f.side(S, E, o.apo, B); } f.side(A, B, o.a, S); f.text(mid(S, M), o.h || '', [1, 0], {fill: ACC, dist: 5}); f.names([S], ['S']); return f.svg(); };
  F.prism3 = (p0, q0, H0, o = {}) => { const [p, q, H] = fit3(p0, q0, H0); const f = new Fig(o.W || 220, o.H || 160), dv = [q * .55 * Math.cos(40 * D), q * .55 * Math.sin(40 * D)], A = [0, 0], B = [p, 0], C = add(B, dv); const up = [0, H];
    f.poly([A, B, add(B, up), add(A, up)], {fill: FILL}); f.poly([B, C, add(C, up), add(B, up)], {fill: '#DCE5F7'}); f.poly([add(A, up), add(B, up), add(C, up)], {fill: '#F3F6FC'}); f.seg(A, C, {dash: true, stroke: SOFT, w: 1.2}); f.right(B, A, C);
    f.side(A, B, o.p, up); f.side(B, C, o.q || '', A); f.text(mid(B, add(B, up)), o.hl || '', [1, -.2], {fill: ACC, dist: 6}); return f.svg(); };

  /* Хоёр төсөөтэй гурвалжин зэрэгцээ */
  F.similar = (s, k, lab, o = {}) => { const f = new Fig(o.W || 270, o.H || 150), kd = Math.min(1.8, Math.max(1.35, k)), [A, B, C] = F.triSides(1.05, 1.2, 1.45), shift = 1.45 + 1.35;
    const A2 = [shift, 0], B2 = [shift + 1.45 * kd, 0], C2 = [shift + C[0] * kd, C[1] * kd];
    f.poly([A, B, C]); f.poly([A2, B2, C2], {fill: FILL2}); const c1 = cen([A, B, C]), c2 = cen([A2, B2, C2]); const L = lab || [[], []];
    f.side(B, C, L[0][0], c1); f.side(C, A, L[0][1], c1); f.side(A, B, L[0][2], c1); f.side(B2, C2, L[1][0], c2); f.side(C2, A2, L[1][1], c2); f.side(A2, B2, L[1][2], c2);
    f.angle(A, B, C, '', {r: 11}); f.angle(A2, B2, C2, '', {r: 11}); f.angle(B, C, A, '', {r: 11, double: true}); f.angle(B2, C2, A2, '', {r: 11, double: true});
    f.names([A, B, C], ['A', 'B', 'C']); f.names([A2, B2, C2], ['A₁', 'B₁', 'C₁']); return f.svg(); };

  /* Сүүдэр: хүн ба багана */
  F.shadow = (hp, sp, st, lab, o = {}) => { const f = new Fig(o.W || 260, o.H || 160), L = 2.4, H = 1.5, sd = L * .38, ph = H * sd / L; const G0 = [0, 0], P0 = [L - sd, 0], top = [0, H], E = [L, 0], pt = [L - sd, ph];
    f.seg([-.2, 0], [L + .25, 0], {stroke: SOFT}); f.line([top, E], {dash: true, stroke: '#C68A12'}); f.seg(G0, top, {w: 3.2}); f.seg(P0, pt, {w: 2.6, stroke: ACC}); f.circle([P0[0], ph + .07], .07, {fill: ACC, stroke: ACC});
    f.right(G0, top, E); f.text([0, H / 2], lab.H || '', [-1, 0], {fill: ACC}); f.text([P0[0], ph / 2], lab.hp || '', [-1, 0], {fill: ACC, dist: 7});
    f.line([[0, -.08], [0, -.16], [L, -.16], [L, -.08]], {stroke: SOFT, w: 1}); f.text([L / 2, -.16], lab.st || '', [0, -1], {fill: ACC, dist: 12});
    f.text([L - sd / 2, 0], lab.sp || '', [0, 1], {fill: ACC, dist: 8}); f._b([0, -.35]); return f.svg(); };

  /* Шат хананд налах */
  F.ladder = (h, d, lab, o = {}) => { const f = new Fig(o.W || 190, o.H || 170), W0 = [0, 0], T = [0, h], G = [d, 0]; f.seg([0, 0], [0, h * 1.12], {w: 3, stroke: SOFT}); f.seg([-.15 * d, 0], [d * 1.25, 0], {stroke: SOFT}); f.seg(T, G, {w: 2.2, stroke: ACC}); f.right(W0, T, G); f.side(T, G, lab.L || '', W0); f.text(mid(W0, T), lab.h || '', [-1, 0], {fill: ACC}); f.side(W0, G, lab.d || '', [0, 1]); return f.svg(); };

  /* Координатын хавтгай дээрх цэгүүд (сүлжээтэй) */
  F.grid = (pts, o = {}) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(0, ...xs) - 1, x1 = Math.max(0, ...xs) + 1, y0 = Math.min(0, ...ys) - 1, y1 = Math.max(0, ...ys) + 1;
    const f = new Fig(o.W || 230, o.H || 190); f.pad = 14; for(let x = x0; x <= x1; x++) f.seg([x, y0], [x, y1], {stroke: '#D9DEE7', w: .8}); for(let y = y0; y <= y1; y++) f.seg([x0, y], [x1, y], {stroke: '#D9DEE7', w: .8});
    f.arrow([x0, 0], [x1 + .4, 0], {stroke: SOFT, w: 1.2}); f.arrow([0, y0], [0, y1 + .4], {stroke: SOFT, w: 1.2}); f.text([x1 + .4, 0], 'x', [0, -1], {pt: true, dist: 9}); f.text([0, y1 + .4], 'y', [1, 0], {pt: true, dist: 6}); f.text([0, 0], 'O', [-1, -1], {dist: 7, size: 11});
    if(o.poly) f.poly(pts, {fill: 'rgba(31,79,191,.12)', stroke: ACC}); pts.forEach((p, i) => { f.dot(p, {fill: ACC}); if(o.names && o.names[i]) f.text(p, o.names[i], o.dirs ? o.dirs[i] : [1, 1], {pt: true, dist: 7, size: 12}); }); return f.svg(); };

  /* Дугуй: радиус эсвэл диаметр, цагираг (r0) */
  F.disc = (R, o = {}) => { const f = new Fig(o.W || 170, o.H || 160), O = [0, 0]; f.circle(O, R, {fill: o.r0 ? FILL2 : FILL}); if(o.r0){ f.circle(O, o.r0, {fill: '#FFFFFF'}); f.seg(O, P(o.r0, 210), {stroke: ACC, w: 1.3}); f.side(O, P(o.r0, 210), o.rl || '', [0, 1]); }
    if(o.diam){ f.seg(P(R, 180), P(R, 0), {stroke: ACC, w: 1.3}); f.side(P(R, 180), P(R, 0), o.label || '', [0, -1]); } else { f.seg(O, P(R, 30), {stroke: ACC, w: 1.3}); f.side(O, P(R, 30), o.label || '', [0, -1]); }
    f.dot(O); f.text(O, 'O', [-1, -.4], {pt: true, dist: 8}); return f.svg(); };
  /* A өнцөг нь deg байх параллелограмм */
  F.paraA = (deg, la, lb, o = {}) => { const f = new Fig(o.W || 220, o.H || 140), b = 1.7, A = [0, 0], B = [b, 0], Dd = P(1, deg), C = add(B, Dd), ps = [A, B, C, Dd]; f.poly(ps); f.angle(A, B, Dd, la, {r: 16}); f.angle(B, C, A, lb, {r: 16}); f.names(ps, ['A', 'B', 'C', 'D']); return f.svg(); };
  /* Хүрээ: дотоод A×B тэгш өнцөгтийг w өргөн зурвас тойрно */
  F.frame = (A, B, w, o = {}) => { const f = new Fig(o.W || 230, o.H || 160); f.poly([[-w, -w], [A + w, -w], [A + w, B + w], [-w, B + w]], {fill: '#DCEFD9'}); f.poly([[0, 0], [A, 0], [A, B], [0, B]], {fill: '#FFFFFF'}); f.side([0, 0], [A, 0], o.a || '', [A / 2, -B]); f.side([0, 0], [0, B], o.b || '', [-1, B / 2]); f.seg([A, B * .5], [A + w, B * .5], {stroke: ACC, w: 1.3}); f.text([A + w, B * .5], o.w || '', [1, 0], {fill: ACC, dist: 6}); return f.svg(); };

  F.rhombus = (d1, d2, o = {}) => { const f = new Fig(o.W || 210, o.H || 160), a = 1, b = Math.min(.85, Math.max(.35, d2 / d1)), ps = [[-a, 0], [0, -b], [a, 0], [0, b]]; f.poly(ps); f.seg(ps[0], ps[2], {dash: true, stroke: ACC}); f.seg(ps[1], ps[3], {dash: true, stroke: ACC}); f.right([0, 0], ps[2], ps[3]);
    f.text([a * .5, 0], o.d1 || '', [0, -1], {fill: ACC, dist: 12}); f.text([0, b * .5], o.d2 || '', [1, 0], {fill: ACC, dist: 6}); for(let i = 0; i < 4; i++) f.ticks(ps[i], ps[(i + 1) % 4], 1); f.names(ps, ['A', 'B', 'C', 'D']); return f.svg(); };
  /* Хойд зүгийн жижиг сум */
  F.north = (f, p, L = .35) => { f.arrow(p, [p[0], p[1] + L], {stroke: SOFT, w: 1.1}); f.text([p[0], p[1] + L], 'Х', [0, 1], {dist: 7, size: 10, fill: SOFT}); };

  window.FIG = F;
})();
