import type { ImageMetadata } from 'astro';
import billingOverview from '../assets/work/billing-overview.png';
import ensayaderoLibrary from '../assets/work/ensayadero-library.png';
import ensayaderoSession from '../assets/work/ensayadero-session.png';
import ensayaderoChart from '../assets/work/ensayadero-chart.png';
import billingAdvance from '../assets/work/billing-advance.png';

export interface Screenshot {
  src: ImageMetadata;
  altKey: string;
  captionKey: string;
}

/** One idea worth explaining: what was decided, and why. */
export interface Note {
  headingKey: string;
  bodyKey: string;
}

export interface CaseStudy {
  slug: string; // the URL segment, shared by both locales
  name: string; // brand name — not translated
  rowKey: string; // the one-liner in the index
  taglineKey: string;
  introKey: string;
  stack: string[];
  notes: Note[];
  screenshots: Screenshot[];
  /** Public repository, or the reason there isn't one. */
  code: { href: string } | 'private';
  href?: string; // somewhere live to look, when there is one
}

/**
 * Every project has a page. The index lists them; the page explains the work
 * and carries the link to the live site, so the list stays an index and
 * nothing important hides behind an external link.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: 'ensayadero',
    name: 'Ensayadero.studio',
    rowKey: 'proj_ensayadero_desc',
    taglineKey: 'cs_ensayadero_tagline',
    introKey: 'cs_ensayadero_intro',
    stack: [
      'Next.js 16 · React 19',
      'Supabase',
      'Tone.js · wavesurfer',
      'Python — Demucs, Basic Pitch, Omnizart',
      'Docker on Railway',
    ],
    notes: [
      { headingKey: 'cs_ensayadero_n1_h', bodyKey: 'cs_ensayadero_n1_b' },
      { headingKey: 'cs_ensayadero_n2_h', bodyKey: 'cs_ensayadero_n2_b' },
    ],
    screenshots: [
      {
        src: ensayaderoLibrary,
        altKey: 'cs_ensayadero_shot1_alt',
        captionKey: 'cs_ensayadero_shot1_cap',
      },
      {
        src: ensayaderoSession,
        altKey: 'cs_ensayadero_shot2_alt',
        captionKey: 'cs_ensayadero_shot2_cap',
      },
      {
        src: ensayaderoChart,
        altKey: 'cs_ensayadero_shot3_alt',
        captionKey: 'cs_ensayadero_shot3_cap',
      },
    ],
    code: 'private',
    href: 'https://ensayadero.studio/',
  },
  {
    slug: 'billing-engine',
    name: 'Billing engine',
    rowKey: 'proj_billing_desc',
    taglineKey: 'cs_billing_tagline',
    introKey: 'cs_billing_intro',
    stack: [
      'TypeScript (strict)',
      'Node',
      'Vitest',
      'Ports & adapters',
      'One runtime dependency',
    ],
    notes: [
      { headingKey: 'cs_billing_n1_h', bodyKey: 'cs_billing_n1_b' },
      { headingKey: 'cs_billing_n2_h', bodyKey: 'cs_billing_n2_b' },
      { headingKey: 'cs_billing_n3_h', bodyKey: 'cs_billing_n3_b' },
      { headingKey: 'cs_billing_n4_h', bodyKey: 'cs_billing_n4_b' },
    ],
    screenshots: [
      {
        src: billingOverview,
        altKey: 'cs_billing_shot1_alt',
        captionKey: 'cs_billing_shot1_cap',
      },
      {
        src: billingAdvance,
        altKey: 'cs_billing_shot2_alt',
        captionKey: 'cs_billing_shot2_cap',
      },
    ],
    code: 'private',
  },
  {
    slug: 'radio-perico',
    name: 'Radio Perico',
    rowKey: 'proj_perico_desc',
    taglineKey: 'cs_perico_tagline',
    introKey: 'cs_perico_intro',
    stack: [
      'Python 3.14 · FastAPI',
      'Claude API',
      'pgvector on Supabase',
      'React 19 · Vite',
      'whisper.cpp',
      'Vercel',
    ],
    notes: [
      { headingKey: 'cs_perico_n1_h', bodyKey: 'cs_perico_n1_b' },
      { headingKey: 'cs_perico_n2_h', bodyKey: 'cs_perico_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://radioperico.com',
  },
  {
    slug: 'tartaytantas',
    name: 'Tartaytantas',
    rowKey: 'proj_tartaytantas_desc',
    taglineKey: 'cs_tartaytantas_tagline',
    introKey: 'cs_tartaytantas_intro',
    stack: [
      'Astro 5 (SSR)',
      'React islands',
      'Supabase — Postgres, Auth, RLS',
      'Snipcart',
      'Playwright',
      'Vercel',
    ],
    notes: [
      { headingKey: 'cs_tartaytantas_n1_h', bodyKey: 'cs_tartaytantas_n1_b' },
      { headingKey: 'cs_tartaytantas_n2_h', bodyKey: 'cs_tartaytantas_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://tartaytantas.es/',
  },
  {
    slug: 'triscaideca',
    name: 'Triscaideca',
    rowKey: 'proj_triscaideca_desc',
    taglineKey: 'cs_triscaideca_tagline',
    introKey: 'cs_triscaideca_intro',
    stack: [
      'Nuxt 2 (static)',
      '@nuxt/content',
      'Tailwind · SCSS tokens',
      'Leaflet',
      'Netlify',
    ],
    notes: [
      { headingKey: 'cs_triscaideca_n1_h', bodyKey: 'cs_triscaideca_n1_b' },
      { headingKey: 'cs_triscaideca_n2_h', bodyKey: 'cs_triscaideca_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://triscaideca.com/',
  },
  {
    slug: 'paellalab',
    name: 'PaellaLab',
    rowKey: 'proj_paellalab_desc',
    taglineKey: 'cs_paellalab_tagline',
    introKey: 'cs_paellalab_intro',
    stack: [
      'Astro 5 · React 19',
      'Supabase',
      'Groq · Hugging Face',
      'Framer Motion · Radix',
      'PWA',
      'Vercel',
    ],
    notes: [
      { headingKey: 'cs_paellalab_n1_h', bodyKey: 'cs_paellalab_n1_b' },
      { headingKey: 'cs_paellalab_n2_h', bodyKey: 'cs_paellalab_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://paella-lab.vercel.app/',
  },
  {
    slug: 'carabanchel-creativa',
    name: 'Carabanchel Creativa',
    rowKey: 'proj_carabanchel_desc',
    taglineKey: 'cs_carabanchel_tagline',
    introKey: 'cs_carabanchel_intro',
    stack: [
      'React · Redux + sagas',
      'Mapbox GL · Leaflet',
      'Strapi',
      'MongoDB',
    ],
    notes: [
      { headingKey: 'cs_carabanchel_n1_h', bodyKey: 'cs_carabanchel_n1_b' },
      { headingKey: 'cs_carabanchel_n2_h', bodyKey: 'cs_carabanchel_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://carabanchelcreativa.com/',
  },
];

export function findCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
