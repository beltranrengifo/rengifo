/**
 * Builds the Open Graph share cards (one per locale) into `public/`.
 *
 * Run it whenever the hero copy or the palette changes:
 *
 *   npm run og
 *
 * The output is committed — nothing renders these at build or request time.
 * Fonts are read from `scripts/og/fonts` (OFL, see OFL.txt) and handed to resvg
 * directly, because system font lookup is not reliable across machines and CI.
 */
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fontFiles = ['SchibstedGrotesk.ttf', 'Newsreader-Italic.ttf'].map((f) =>
  join(here, 'fonts', f),
);

// Kept in sync by hand with the @theme block in src/styles/global.css.
const CANVAS = '#F6F5F2';
const INK = '#16181A';
const BODY = '#3A3E42';
const MUTED = '#5C6166';
const ACCENT = '#2F5D8A';

// The logomark, lifted from src/components/Logo.astro (viewBox 0 0 148 200).
const LOGO = [
  'M148,100A74,74,0,0,0,48,30.73V0H0V200H48V169.27A73.55,73.55,0,0,0,74,174a26,26,0,0,1,26,26h48a73.72,73.72,0,0,0-19.5-50A73.72,73.72,0,0,0,148,100ZM48,100a26,26,0,1,1,26,26A26,26,0,0,1,48,100Z',
  'M0,100v74.88A105.46,105.46,0,0,0,40.9,200H48V169.27h0A74.1,74.1,0,0,1,0,100Z',
];

const cards = [
  {
    file: 'og.png',
    kicker: 'SENIOR SOFTWARE ENGINEER · MADRID',
    // The H1, split at the italic phrase so the serif can take over.
    lines: [
      { text: 'I build software', italic: false },
      { text: 'end to end, with', italic: false },
      { text: 'a frontend heart.', italic: true },
    ],
    foot: 'Design systems · Frontend · Full-stack — rengifo.es',
  },
  {
    file: 'og-es.png',
    kicker: 'INGENIERO DE SOFTWARE SENIOR · MADRID',
    lines: [
      { text: 'Construyo software', italic: false },
      { text: 'de punta a punta,', italic: false },
      { text: 'con alma de frontend.', italic: true },
    ],
    foot: 'Design systems · Frontend · Full-stack — rengifo.es',
  },
];

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card({ kicker, lines, foot }) {
  const headline = lines
    .map((line, i) => {
      const y = 250 + i * 88;
      const font = line.italic
        ? `font-family="Newsreader" font-style="italic" font-weight="300" fill="${ACCENT}"`
        : `font-family="Schibsted Grotesk" font-weight="500" fill="${INK}"`;
      return `<text x="90" y="${y}" font-size="76" letter-spacing="-2" ${font}>${escape(line.text)}</text>`;
    })
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${CANVAS}"/>

    <!-- The ambient accent glow, flattened to a single static orb. -->
    <defs>
      <radialGradient id="orb" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.22"/>
        <stop offset="70%" stop-color="${ACCENT}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="1010" cy="130" r="380" fill="url(#orb)"/>

    <g transform="translate(90 74) scale(0.26)" fill="${INK}">
      ${LOGO.map((d) => `<path d="${d}"/>`).join('')}
    </g>

    <text x="90" y="160" font-family="Schibsted Grotesk" font-weight="500" font-size="21" letter-spacing="4" fill="${MUTED}">${escape(kicker)}</text>

    ${headline}

    <rect x="90" y="522" width="1020" height="1" fill="${INK}" fill-opacity="0.12"/>
    <text x="90" y="570" font-family="Schibsted Grotesk" font-size="24" fill="${BODY}">${escape(foot)}</text>
    <text x="1110" y="570" text-anchor="end" font-family="Schibsted Grotesk" font-weight="600" font-size="24" fill="${INK}">Beltrán Rengifo</text>
  </svg>`;
}

for (const spec of cards) {
  const png = new Resvg(card(spec), {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: 'Schibsted Grotesk',
    },
  })
    .render()
    .asPng();
  const out = join(here, '..', '..', 'public', spec.file);
  writeFileSync(out, png);
  console.log(`✓ ${spec.file} — ${(png.length / 1024).toFixed(0)} KB`);
}
