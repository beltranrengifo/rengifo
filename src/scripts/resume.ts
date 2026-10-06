/**
 * Client behaviour for the résumé page — all progressive enhancement.
 * Print · reveals · cursor glow · parallax · copy-to-clipboard ·
 * accent picker · keyboard shortcuts · a console hello.
 */

// ── PDF ──
// `npm run pdf` prints from a local preview, so relative links would carry
// localhost into the file. Under ?pdf they point at the real site instead.
if (new URLSearchParams(location.search).has('pdf')) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
    a.href = new URL(a.getAttribute('href') ?? '/', import.meta.env.SITE).href;
  });
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ── Header — slims down once the page has scrolled ───────────
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const slim = () =>
    header.toggleAttribute('data-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', slim, { passive: true });
  slim();
}

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
  document.querySelectorAll('a, button, .poncho-footer').forEach((el) => {
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

// ── Parallax on the drifting shapes — mouse (lagged) + scroll ─
const parallaxEls = Array.from(
  document.querySelectorAll<HTMLElement>('[data-parallax]'),
);
if (parallaxEls.length && !reduced) {
  let tmx = 0;
  let tmy = 0;
  let cmx = 0;
  let cmy = 0;

  /*
   * Each shape's natural document centre, measured with no transform applied.
   * The scroll offset is then computed RELATIVE to the viewport centre rather
   * than from raw scrollY: a shape lags behind the scroll while it's on its
   * way in/out, but always lands back on its natural spot as it passes the
   * middle of the screen. (A raw `scrollY * factor` offset would shove the
   * lower shapes permanently down the page and they'd never be seen.)
   */
  let bases: number[] = [];
  const measure = (): void => {
    parallaxEls.forEach((el) => (el.style.transform = ''));
    bases = parallaxEls.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  };
  measure();
  window.addEventListener('resize', measure);

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
    const viewportCentre = window.scrollY + window.innerHeight / 2;
    parallaxEls.forEach((el, i) => {
      const f = parseFloat(el.dataset.parallax || '0');
      const sf = parseFloat(el.dataset.parallaxScroll || '0');
      const lag = (viewportCentre - bases[i]) * sf;
      el.style.transform = `translate3d(${cmx * f}px, ${cmy * f + lag}px, 0)`;
    });
    requestAnimationFrame(tick);
  };
  tick();
}

// ── Copy buttons — never on the mailto link itself ──────────
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
const isSpanish = document.documentElement.lang === 'es';
const copyLabel = isSpanish ? 'Copiado ✓' : 'Copied ✓';
document.querySelectorAll<HTMLElement>('[data-copy]').forEach((el) => {
  el.addEventListener('click', () => {
    const text = el.dataset.copy || '';
    if (navigator.clipboard && text) {
      navigator.clipboard
        .writeText(text)
        .then(() => flash(copyLabel))
        .catch(() => {});
    }
  });
});

// ── Accent picker — the swatches in the header ───────────────
const ACCENTS = ['#2f5d8a', '#16181a', '#6b705c', '#8c4a3b'];
const swatches = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-accent]'),
];
const setAccent = (colour: string, save: boolean) => {
  document.documentElement.style.setProperty('--accent', colour);
  for (const swatch of swatches) {
    const on = swatch.dataset.accent === colour;
    swatch.setAttribute('aria-checked', String(on));
    swatch.tabIndex = on ? 0 : -1;
  }
  if (!save) return;
  try {
    localStorage.setItem('accent', colour);
  } catch {
    /* ignore */
  }
};
try {
  const saved = localStorage.getItem('accent');
  if (saved && ACCENTS.includes(saved)) setAccent(saved, false);
} catch {
  /* storage unavailable */
}
swatches.forEach((swatch, i) => {
  swatch.addEventListener('click', () =>
    setAccent(swatch.dataset.accent!, true),
  );
  // Arrow keys move between swatches, as in any radio group.
  swatch.addEventListener('keydown', (event) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = swatches[(i + step + swatches.length) % swatches.length]!;
    next.focus();
    next.click();
  });
});

// ── A hello for anyone reading the source ────────────────────
console.log(
  '%c👋 Poking around the source?',
  'font:600 15px/1.5 ui-sans-serif,system-ui,sans-serif;color:#2f5d8a',
);
console.log(
  "%cI like you already. Let's talk → beltran@rengifo.es",
  'font:14px/1.6 ui-sans-serif,system-ui,sans-serif;color:#3a3e42',
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
  document.querySelectorAll('.poncho-footer').forEach((cat) => {
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

// ── Section rail — shows past the hero, marks where you are ──
const rail = document.querySelector<HTMLElement>('[data-section-nav]');
if (rail) {
  const links = [
    ...rail.querySelectorAll<HTMLAnchorElement>('[data-section-link]'),
  ];
  const sections = links
    .map((link) => document.getElementById(link.dataset.sectionLink!))
    .filter((section): section is HTMLElement => section !== null);
  const mark = () => {
    const y = window.scrollY;
    const line = y + window.innerHeight * 0.35;
    rail.toggleAttribute(
      'data-visible',
      sections[0] !== undefined &&
        y + window.innerHeight * 0.6 > sections[0].offsetTop,
    );
    // The section you are in is the last one whose top is above the line;
    // at the very bottom, the last one.
    const atEnd =
      y + window.innerHeight >= document.documentElement.scrollHeight - 2;
    let current = -1;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top + y <= line) current = i;
    });
    if (atEnd) current = sections.length - 1;
    links.forEach((link, i) =>
      link.setAttribute('aria-current', String(i === current)),
    );
  };
  let queued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        mark();
      });
    },
    { passive: true },
  );
  window.addEventListener('resize', mark);
  mark();
}
