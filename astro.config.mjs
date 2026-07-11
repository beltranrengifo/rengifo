import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

// https://astro.build/config
export default defineConfig({
  // Matches the primary contact domain (beltran@rengifo.es). Adjust if needed.
  site: 'https://rengifo.es',
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
  },
});
