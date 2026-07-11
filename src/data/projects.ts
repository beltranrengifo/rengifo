export interface SideProject {
  name: string; // brand name — not translated
  href?: string; // public link (opens in a new tab)
  descKey: string; // Paraglide message key for the description
  stack?: string[]; // small tech line; from the repos where available
}

// One entry per side project. Copy lives in src/i18n/messages/{en,es}.json.
export const projects: SideProject[] = [
  {
    name: 'Ensayadero.studio',
    href: 'https://ensayadero.studio/',
    descKey: 'proj_ensayadero_desc',
    stack: ['TypeScript', 'Python (audio/MIDI)', 'Docker'],
  },
  {
    name: 'Tartaytantas',
    href: 'https://tartaytantas.es/',
    descKey: 'proj_tartaytantas_desc',
    stack: ['Astro', 'React', 'Supabase', 'Tailwind', 'Vercel'],
  },
  {
    name: 'Carabanchel Creativa',
    href: 'https://carabanchelcreativa.com/',
    descKey: 'proj_carabanchel_desc',
    stack: ['Mapbox', 'Strapi', 'Node'],
  },
  {
    name: 'Triscaideca',
    href: 'https://triscaideca.com/',
    descKey: 'proj_triscaideca_desc',
  },
  {
    name: 'PaellaLab',
    href: 'https://paella-lab.vercel.app/',
    descKey: 'proj_paellalab_desc',
    stack: ['Astro', 'React · Radix', 'Supabase', 'Framer Motion', 'PWA'],
  },
];
