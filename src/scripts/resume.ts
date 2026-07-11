/**
 * Client behaviour for the résumé page — all progressive enhancement.
 * Print · scroll reveals · cursor glow. (Language is handled by routing.)
 */

// Print / download-PDF buttons.
document.querySelectorAll('[data-print]').forEach((btn) => {
  btn.addEventListener('click', () => window.print());
});

// Scroll reveals — hide only below-the-fold elements, then reveal on intersect.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = Array.from(
  document.querySelectorAll<HTMLElement>('[data-reveal]'),
);

if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-hidden');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  reveals.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.classList.add('reveal-hidden');
    io.observe(el);
  });
}

// Never print a hidden reveal.
window.addEventListener('beforeprint', () => {
  reveals.forEach((el) => el.classList.remove('reveal-hidden'));
});

// Cursor-following glow (lagging, soft) — fine pointers only.
const glow = document.querySelector<HTMLElement>('[data-cursor-glow]');
if (glow && !reduced && window.matchMedia('(pointer: fine)').matches) {
  const HALF = 230;
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 3;
  let x = tx;
  let y = ty;
  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = '0.55';
  });
  document.documentElement.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  const tick = (): void => {
    x += (tx - x) * 0.045;
    y += (ty - y) * 0.045;
    glow.style.transform = `translate(${x - HALF}px, ${y - HALF}px)`;
    requestAnimationFrame(tick);
  };
  tick();
}
