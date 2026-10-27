/* Самбарын урсдаг мөр: алдартай томьёонуудыг KaTeX-ээр бичиж, тасралтгүй гүйлгэнэ. */
(function(){
  const F = [
    ['Пифагорын теорем', 'a^2+b^2=c^2'],
    ['Квадрат тэгшитгэлийн шийд', 'x=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}'],
    ['Тойргийн урт', 'C=2\\pi r'],
    ['Дугуйн талбай', 'S=\\pi r^2'],
    ['Тригонометрийн үндсэн адилтгал', '\\sin^2\\alpha+\\cos^2\\alpha=1'],
    ['Хоёр гишүүнтийн квадрат', '(a+b)^2=a^2+2ab+b^2'],
    ['Арифметик прогрессын нийлбэр', 'S_n=\\dfrac{(a_1+a_n)\\,n}{2}'],
    ['Геометр прогрессын гишүүн', 'b_n=b_1q^{\\,n-1}'],
    ['Косинусын теорем', 'c^2=a^2+b^2-2ab\\cos\\gamma'],
    ['Логарифмын чанар', '\\log_a(xy)=\\log_a x+\\log_a y'],
    ['Зэргийн уламжлал', '(x^n)\'=n\\,x^{n-1}'],
    ['Ньютон–Лейбницийн томьёо', '\\int_a^b f(x)\\,dx=F(b)-F(a)'],
    ['Бөмбөрцгийн эзлэхүүн', 'V=\\tfrac{4}{3}\\pi r^3'],
    ['Эйлерийн адилтгал', 'e^{i\\pi}+1=0']
  ];
  const track = document.getElementById('tickerTrack'); if(!track) return;
  const tex = t => { try { return window.katex ? katex.renderToString(t, {throwOnError: false}) : t; } catch(e){ return t; } };
  const one = F.map(([name, t]) => `<span class="tk"><span class="tk-name">${name}</span>${tex(t)}</span>`).join('');
  track.innerHTML = `<div class="tk-run">${one}</div><div class="tk-run" aria-hidden="true">${one}</div>`;
})();
