/**
 * Client behaviour for the résumé page — all progressive enhancement.
 * Print · reveals · cursor glow · parallax · copy-to-clipboard ·
 * accent switcher · keyboard shortcuts · a console hello.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ── Print / download-PDF buttons ─────────────────────────────
document.querySelectorAll('[data-print]').forEach((btn) => {
  btn.addEventListener('click', () => window.print());
});

// ── Reveals — fade + slide in on LOAD (staggered) and on SCROLL ──
const reveals = Array.from(
  document.querySelectorAll<HTMLElement>('[data-reveal]'),
);
if (!reduced) {
  const fold = window.innerHeight * 0.92;
  const aboveFold: HTMLElement[] = [];
  const belowFold: HTMLElement[] = [];
  // Measure BEFORE hiding (the hidden class shifts them).
  reveals.forEach((el) => {
    (el.getBoundingClientRect().top >= fold ? belowFold : aboveFold).push(el);
  });

  reveals.forEach((el) => el.classList.add('reveal-hidden'));

  // On load: the visible ones cascade in.
  aboveFold.forEach((el, i) => {
    window.setTimeout(() => el.classList.remove('reveal-hidden'), 120 + i * 90);
  });

  // On scroll: the rest slide in as they enter the viewport.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    belowFold.forEach((el) => io.observe(el));
  }
}
window.addEventListener('beforeprint', () => {
  reveals.forEach((el) => el.classList.remove('reveal-hidden'));
});

// ── Adaptive cursor glow — grows + brightens over interactive ─
const glow = document.querySelector<HTMLElement>('[data-cursor-glow]');
if (glow && !reduced && finePointer) {
  const HALF = 230;
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 3;
  let x = tx;
  let y = ty;
  let scale = 1;
  let hovering = false;
  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = hovering ? '0.85' : '0.5';
  });
  document.documentElement.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  document.querySelectorAll('a, button, .cat-stage').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      hovering = true;
      glow.style.opacity = '0.85';
    });
    el.addEventListener('mouseleave', () => {
      hovering = false;
      glow.style.opacity = '0.5';
    });
  });
  const tick = (): void => {
    x += (tx - x) * 0.045;
    y += (ty - y) * 0.045;
    scale += ((hovering ? 2.4 : 1) - scale) * 0.12;
    glow.style.transform = `translate(${x - HALF}px, ${y - HALF}px) scale(${scale})`;
    requestAnimationFrame(tick);
  };
  tick();
}

// ── Parallax on the drifting shapes (lagged mouse) ───────────
const parallaxEls = Array.from(
  document.querySelectorAll<HTMLElement>('[data-parallax]'),
);
if (parallaxEls.length && !reduced) {
  let tmx = 0;
  let tmy = 0;
  let cmx = 0;
  let cmy = 0;
  if (finePointer) {
    window.addEventListener(
      'mousemove',
      (e) => {
        tmx = e.clientX / window.innerWidth - 0.5;
        tmy = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true },
    );
  }
  const tick = (): void => {
    cmx += (tmx - cmx) * 0.06;
    cmy += (tmy - cmy) * 0.06;
    // Lag the shapes behind the scroll → they travel WITH the page, slower.
    const sy = window.scrollY;
    parallaxEls.forEach((el) => {
      const f = parseFloat(el.dataset.parallax || '0');
      const sf = parseFloat(el.dataset.parallaxScroll || '0');
      el.style.transform = `translate3d(${cmx * f}px, ${cmy * f + sy * sf}px, 0)`;
    });
    requestAnimationFrame(tick);
  };
  tick();
}

// ── Copy-to-clipboard on email addresses ─────────────────────
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
document.body.appendChild(toast);
let toastTimer = 0;
function flash(msg: string): void {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => toast.classList.remove('is-visible'),
    1600,
  );
}
const copyLabel =
  document.documentElement.lang === 'es' ? 'Copiado ✓' : 'Copied ✓';
document.querySelectorAll<HTMLElement>('[data-copy]').forEach((el) => {
  el.addEventListener('click', (e) => {
    const text = el.dataset.copy || el.textContent || '';
    if (navigator.clipboard && text) {
      e.preventDefault();
      navigator.clipboard
        .writeText(text)
        .then(() => flash(copyLabel))
        .catch(() => {});
    }
  });
});

// ── Accent switcher — tap the availability dot ───────────────
const ACCENTS = ['#2f5d8a', '#16181a', '#6b705c', '#8c4a3b'];
let accentIndex = 0;
try {
  const saved = localStorage.getItem('accent');
  const i = saved ? ACCENTS.indexOf(saved) : -1;
  if (i >= 0) {
    accentIndex = i;
    document.documentElement.style.setProperty('--accent', ACCENTS[i]);
  }
} catch {
  /* storage unavailable */
}
document.querySelectorAll('[data-accent-cycle]').forEach((el) => {
  el.addEventListener('click', () => {
    accentIndex = (accentIndex + 1) % ACCENTS.length;
    const c = ACCENTS[accentIndex];
    document.documentElement.style.setProperty('--accent', c);
    try {
      localStorage.setItem('accent', c);
    } catch {
      /* ignore */
    }
  });
});

// ── Keyboard shortcuts: L = language · P = print ─────────────
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const el = e.target as HTMLElement | null;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === 'l') {
    window.location.href =
      document.documentElement.lang === 'es' ? '/' : '/es/';
  } else if (k === 'p') {
    e.preventDefault();
    window.print();
  }
});

// ── A hello for anyone reading the source ────────────────────
console.log(
  '%c👋 Poking around the source?',
  'font:600 15px/1.5 ui-sans-serif,system-ui,sans-serif;color:#2f5d8a',
);
console.log(
  "%cI like you already. Let's talk → beltran@rengifo.es\n%c(psst — press L to switch language, P to print)",
  'font:14px/1.6 ui-sans-serif,system-ui,sans-serif;color:#3a3e42',
  'font:12px/1.6 ui-sans-serif,system-ui,sans-serif;color:#8a8e93',
);

// ── Scroll progress bar ──────────────────────────────────────
const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
if (bar) {
  const update = (): void => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// ── Click a cat → a heart floats up ──────────────────────────
if (!reduced) {
  document.querySelectorAll('.cat-stage').forEach((cat) => {
    cat.addEventListener('click', (e) => {
      const ev = e as MouseEvent;
      const heart = document.createElement('span');
      heart.className = 'cat-heart';
      heart.textContent = '♥';
      heart.style.left = `${ev.clientX}px`;
      heart.style.top = `${ev.clientY}px`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 900);
    });
  });
}

/* Paw-print cursor trail removed — too noisy. */
