/**
 * Prints the résumé to a real PDF, one per locale, into `public/`.
 *
 *   npm run pdf
 *
 * Recruiters need a file to attach to an applicant tracking system, and
 * `window.print()` is not that. The output is committed, so the deploy needs
 * neither a browser nor this script — run it whenever the copy changes.
 *
 * It builds the site, serves `dist/`, and drives headless Chrome's
 * print-to-PDF against each page, so the PDF is the print stylesheet's own
 * output rather than a second layout to keep in sync.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const PORT = 4329;

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const pages = [
  { path: '/', file: 'beltran-rengifo-cv.pdf' },
  { path: '/es/', file: 'beltran-rengifo-cv-es.pdf' },
];

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME} — install it or edit CHROME.`);
  process.exit(1);
}

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts });

console.log('› building');
if (run('npm', ['run', 'build']).status !== 0) process.exit(1);

console.log('› serving dist');
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  cwd: root,
  stdio: 'ignore',
});

const waitForServer = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};

try {
  if (!(await waitForServer())) throw new Error('preview server never came up');

  for (const page of pages) {
    const out = join(root, 'public', page.file);
    const status = run(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--virtual-time-budget=6000',
      `--print-to-pdf=${out}`,
      `http://localhost:${PORT}${page.path}`,
    ]).status;
    if (status !== 0) throw new Error(`Chrome failed on ${page.path}`);
    console.log(`✓ ${page.file}`);
  }
} finally {
  server.kill();
}
