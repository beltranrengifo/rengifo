import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

// https://astro.build/config
export default defineConfig({
  // The apex 308-redirects here in production, so canonicals point at www.
  site: 'https://www.rengifo.es',
  // EN at "/", ES at "/es/". Static output → one language per prerendered page.
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
      }),
    ],
    // transformers.js (the board's search) loads its own WASM at runtime;
    // pre-bundling it breaks the lazy import in dev.
    optimizeDeps: {
      exclude: ['@huggingface/transformers'],
    },
  },
});
