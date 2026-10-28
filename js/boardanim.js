/* Самбарын хөдөлгөөнт зураг (толгой хэсгийн баруун тал).
   1) Парабол дээгүүр цэг гулсаж, шүргэгч шулуун эргэнэ.
   2) Тойрогт багтсан гурвалжны C орой нумаар гүйхэд ∠C өөрчлөгдөхгүй (багтсан өнцгийн теорем).
   3) Тэгш өнцөгт гурвалжны катетууд сунаж агшина: a² + b² = c².
   Эхэндээ шохойгоор зурж буй мэт гарч ирнэ. «Хөдөлгөөнийг багасгах» тохиргоотой үед, мөн «⏸» дарахад зогсоно. */
(function(){
  /* Арын видео (media/hero-*.mp4): толгой хэсгийг бүтэн дүүргэнэ. Сурагчийн горим, «хөдөлгөөнийг багасгах», дата хэмнэх үед ачаалахгүй. */
  const header = document.querySelector('header.board'), video = header && header.querySelector('video.board-video');
  const reduceM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, saveData = navigator.connection && navigator.connection.saveData;
  if(video && !document.body.classList.contains('student') && !/^#(s|sr|d|st|e|a|me|q)-?/.test(location.hash) && !saveData){
    video.poster = 'media/hero-poster.jpg';
    const q = window.innerWidth < 760 ? '480' : '720';   // H.264 (mp4) — ихэнх хөтөч; VP9 (webm) — mp4 тоглуулж чадахгүй хөтөчид
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(([ext, type]) => { const so = document.createElement('source'); so.src = `media/hero-${q}.${ext}`; so.type = type; video.appendChild(so); });
    video.hidden = false; header.querySelector('.board-shade').hidden = false; header.classList.add('has-video');
    let on = !reduceM; try { if(localStorage.getItem('ws_anim') === '0') on = false; } catch(e){}
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'anim-btn'; (header.querySelector('.board-in') || header).appendChild(btn);
    const sync = () => { btn.textContent = on ? '⏸' : '▶'; btn.setAttribute('aria-label', on ? 'Видеог зогсоох' : 'Видеог тоглуулах'); btn.title = btn.getAttribute('aria-label');
      if(on && document.visibilityState === 'visible'){ const p = video.play(); if(p && p.catch) p.catch(() => {}); } else video.pause(); };
    btn.addEventListener('click', () => { on = !on; try { localStorage.setItem('ws_anim', on ? '1' : '0'); } catch(e){} sync(); });
    document.addEventListener('visibilitychange', sync);
    if('IntersectionObserver' in window) new IntersectionObserver(es => { if(!on) return; if(es[0].isIntersecting) sync(); else video.pause(); }).observe(header);
    if(on) video.preload = 'auto';
    sync();
    window.BOARDANIM = {video: true, get running(){ return !video.paused; }};
    return;   // видеотой үед шохойн хөдөлгөөнт зураг шаардлагагүй
  }
  const svg = document.querySelector('header.board svg.chalk'); if(!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); (parent || svg).appendChild(e); return e; };
  const chalkG = svg.querySelector('g[filter]'), textG = svg.querySelector('g[font-family]');

  /* Хөдөлгөөнт давхарга: шохойн шүүлтүүргүй (утсан дээр хөнгөн) */
  const L = el('g', {class: 'anim', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  // 1. Парабол: P0(26,30) P1(70,270) P2(114,30) — квадрат Безье
  const tan = el('line', {stroke: '#9FD8C3', 'stroke-width': 1.8, opacity: .9}, L);
  const pdot = el('circle', {r: 4.2, fill: '#F4D35E', stroke: 'none'}, L);
  // 2. Тойрог: төв O(300,98), r = 64, A(244,129), B(356,129)
  const O = [300, 98], R = 64, A = [244, 129], B = [356, 129];
  const tri = el('path', {stroke: '#9FD8C3', 'stroke-width': 2}, L);
  const arcC = el('path', {stroke: '#F4D35E', 'stroke-width': 2}, L);
  const cdot = el('circle', {r: 2.6, fill: '#EEF0E8', stroke: 'none'}, L);
  const lblC = el('text', {fill: '#EEF0E8', 'font-family': "'PT Serif', Georgia, serif", 'font-style': 'italic', 'font-size': 14, stroke: 'none', opacity: .9}, L); lblC.textContent = 'C';
  const lblAng = el('text', {x: 192, y: 24, fill: '#F4D35E', 'font-family': "'PT Serif', Georgia, serif", 'font-style': 'italic', 'font-size': 13, stroke: 'none', opacity: .9}, L); lblAng.textContent = '∠C = 61° үргэлж';
  // 3. Тэгш өнцөгт гурвалжин: тэгш өнцөг (384,178)
  const rt = el('path', {stroke: '#EEF0E8', 'stroke-width': 2, opacity: .85}, L);
  const lblA = el('text', {fill: '#EEF0E8', 'font-family': "'PT Serif', Georgia, serif", 'font-style': 'italic', 'font-size': 13, stroke: 'none', opacity: .85}, L);
  const lblB = lblA.cloneNode(), lblCc = lblA.cloneNode(); L.appendChild(lblB); L.appendChild(lblCc); lblA.textContent = 'a'; lblB.textContent = 'b'; lblCc.textContent = 'c';

  /* Хуучин хөдөлгөөнгүй гурвалжин, тэмдэглэгээг нуух (хөдөлгөөнт хувилбар нь орлоно) */
  if(chalkG) chalkG.querySelectorAll('path').forEach(p => { const d = p.getAttribute('d') || ''; if(/^M244 129 L356 129 L322 38|^M262 129 a18|^M384 178 L424|^M384 170 h8/.test(d)) p.style.display = 'none'; });
  if(textG) textG.querySelectorAll('text').forEach(t => { if(['C', 'α', 'a', 'b', 'c'].includes(t.textContent.trim())) t.style.display = 'none'; });

  function frame(t){
    const s = t / 1000;
    // 1. Парабол дээрх цэг ба шүргэгч
    const u = .5 + .4 * Math.sin(s * .7), x = 26 + 88 * u, y = 30 * (1 - u) ** 2 + 540 * (1 - u) * u + 30 * u * u;
    const dx = 88, dy = 480 * (1 - 2 * u), len = Math.hypot(dx, dy), k = 22 / len;
    pdot.setAttribute('cx', x); pdot.setAttribute('cy', y);
    tan.setAttribute('x1', x - dx * k); tan.setAttribute('y1', y - dy * k); tan.setAttribute('x2', x + dx * k); tan.setAttribute('y2', y + dy * k);
    // 2. C орой дээд нумаар
    const phi = (90 + 55 * Math.sin(s * .45)) * Math.PI / 180, C = [O[0] + R * Math.cos(phi), O[1] - R * Math.sin(phi)];
    tri.setAttribute('d', `M${A} L${B} L${C} Z`);
    cdot.setAttribute('cx', C[0]); cdot.setAttribute('cy', C[1]);
    lblC.setAttribute('x', C[0] + (C[0] - O[0]) * .22 - 4); lblC.setAttribute('y', C[1] + (C[1] - O[1]) * .22 + 4);
    const a1 = Math.atan2(A[1] - C[1], A[0] - C[0]), a2 = Math.atan2(B[1] - C[1], B[0] - C[0]), r = 14;
    arcC.setAttribute('d', `M${C[0] + r * Math.cos(a1)} ${C[1] + r * Math.sin(a1)} A${r} ${r} 0 0 0 ${C[0] + r * Math.cos(a2)} ${C[1] + r * Math.sin(a2)}`);
    // 3. Катетууд
    const a = 32 + 10 * Math.sin(s * .9), b = 46 + 12 * Math.sin(s * .6 + 1);
    rt.setAttribute('d', `M384 178 L${384 + a} 178 L384 ${178 - b} Z M384 170 h8 v8`);
    lblA.setAttribute('x', 384 + a / 2 - 3); lblA.setAttribute('y', 194);
    lblB.setAttribute('x', 370); lblB.setAttribute('y', 178 - b / 2 + 4);
    lblCc.setAttribute('x', 384 + a / 2 + 6); lblCc.setAttribute('y', 178 - b / 2 - 2);
  }

  /* Шохойгоор зурах эхлэл (нэг удаа) */
  if(!reduce && chalkG){
    chalkG.querySelectorAll('path, circle').forEach((p, i) => { if(p.style.display === 'none' || p.getAttribute('fill') === '#EEF0E8') return; p.setAttribute('pathLength', 1); p.classList.add('draw'); p.style.animationDelay = (i * .12) + 's'; });
    svg.classList.add('drawing');
  }

  /* Тоглуулах / зогсоох */
  let on = !reduce, raf = 0, visible = true, t0 = performance.now(), paused = 0;
  try { if(localStorage.getItem('ws_anim') === '0') on = false; } catch(e){}
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'anim-btn';
  const head = svg.closest('.board-in') || svg.parentNode; head.appendChild(btn);
  const loop = t => { frame(t - t0); raf = requestAnimationFrame(loop); };
  function sync(){
    cancelAnimationFrame(raf); raf = 0;
    btn.textContent = on ? '⏸' : '▶'; btn.setAttribute('aria-label', on ? 'Хөдөлгөөнийг зогсоох' : 'Хөдөлгөөнийг эхлүүлэх'); btn.title = btn.getAttribute('aria-label');
    if(on && visible && document.visibilityState === 'visible'){ t0 = performance.now() - paused; raf = requestAnimationFrame(loop); }
  }
  btn.addEventListener('click', () => { if(raf) paused = performance.now() - t0; on = !on; try { localStorage.setItem('ws_anim', on ? '1' : '0'); } catch(e){} sync(); });
  document.addEventListener('visibilitychange', () => { if(raf) paused = performance.now() - t0; sync(); });
  if('IntersectionObserver' in window) new IntersectionObserver(es => { if(raf) paused = performance.now() - t0; visible = es[0].isIntersecting; sync(); }).observe(svg);
  frame(1500);   // зогссон үед ч зөв байрлалтай
  sync();
  window.BOARDANIM = {frame, get running(){ return !!raf; }};
})();
