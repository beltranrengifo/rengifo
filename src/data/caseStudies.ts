import type { ImageMetadata } from 'astro';
import billingOverview from '../assets/work/billing-overview.png';
import ensayaderoLibrary from '../assets/work/ensayadero-library.png';
import ensayaderoSession from '../assets/work/ensayadero-session.png';
import ensayaderoChart from '../assets/work/ensayadero-chart.png';
import billingAdvance from '../assets/work/billing-advance.png';
import tabluxHome from '../assets/work/tablux-home.png';
import tabluxCasa from '../assets/work/tablux-casa.png';
import tabluxLight from '../assets/work/tablux-light.png';
import tabluxBlind from '../assets/work/tablux-blind.png';
import tabluxRoutine from '../assets/work/tablux-routine.png';
import tabluxMenu from '../assets/work/tablux-menu.png';
import tabluxLists from '../assets/work/tablux-lists.png';
import tabluxAgenda from '../assets/work/tablux-agenda.png';
import tabluxChat from '../assets/work/tablux-chat.png';
import gorraStation from '../assets/work/gorraplanistas-station.png';
import gorraCharts from '../assets/work/gorraplanistas-charts.png';
import gorraForecast from '../assets/work/gorraplanistas-forecast.png';
import canallumExterior from '../assets/work/canallum-exterior.png';
import canallumPlan from '../assets/work/canallum-plan.png';
import canallumTour from '../assets/work/canallum-tour.png';
import canallumNight from '../assets/work/canallum-night.png';
import tabluxNight from '../assets/work/tablux-night.png';

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

interface ProjectBase {
  slug: string; // the URL segment, shared by both locales
  name: string; // brand name — not translated
  rowKey: string; // the one-liner in the index
  stack: string[];
  /** Kept in the data, left out of the site: no row, no page. */
  hidden?: true;
}

/** Work small enough that the live site says it all: no page of its own. */
export interface LinkedProject extends ProjectBase {
  page: false;
  href: string;
}

export interface CaseStudy extends ProjectBase {
  page?: true;
  taglineKey: string;
  introKey: string;
  notes: Note[];
  screenshots: Screenshot[];
  /** Public repository, or the reason there isn't one. */
  code: { href: string } | 'private';
  href?: string; // somewhere live to look, when there is one
  /**
   * Only for work that cannot simply be visited: how someone gets in. A
   * public site needs no such line — the link is the proof.
   */
  accessKey?: string;
}

export type Project = CaseStudy | LinkedProject;

/**
 * The index. Most projects have a page that explains the work and carries the
 * link to the live site; the simplest link straight out instead.
 *
 * Ordered by how much of the stack each one proves, not by date.
 */
const allProjects: Project[] = [
  {
    slug: 'tablux',
    name: 'Tablux',
    rowKey: 'proj_tablux_desc',
    taglineKey: 'cs_tablux_tagline',
    introKey: 'cs_tablux_intro',
    stack: [
      'Linux 6.18 · U-Boot · device tree',
      'Armbian · Phosh',
      'Next.js 16 · React 19 (PWA)',
      'Supabase (self-hosted)',
      'Node · Hono',
      'Claude Haiku · Whisper on Groq',
      'MCP server',
      'Tailscale · Coolify',
    ],
    notes: [
      { headingKey: 'cs_tablux_n1_h', bodyKey: 'cs_tablux_n1_b' },
      { headingKey: 'cs_tablux_n2_h', bodyKey: 'cs_tablux_n2_b' },
      { headingKey: 'cs_tablux_n3_h', bodyKey: 'cs_tablux_n3_b' },
      { headingKey: 'cs_tablux_n4_h', bodyKey: 'cs_tablux_n4_b' },
      { headingKey: 'cs_tablux_n5_h', bodyKey: 'cs_tablux_n5_b' },
      { headingKey: 'cs_tablux_n6_h', bodyKey: 'cs_tablux_n6_b' },
    ],
    screenshots: [
      {
        src: tabluxHome,
        altKey: 'cs_tablux_shot1_alt',
        captionKey: 'cs_tablux_shot1_cap',
      },
      {
        src: tabluxCasa,
        altKey: 'cs_tablux_shot2_alt',
        captionKey: 'cs_tablux_shot2_cap',
      },
      {
        src: tabluxLight,
        altKey: 'cs_tablux_shot3_alt',
        captionKey: 'cs_tablux_shot3_cap',
      },
      {
        src: tabluxBlind,
        altKey: 'cs_tablux_shot4_alt',
        captionKey: 'cs_tablux_shot4_cap',
      },
      {
        src: tabluxRoutine,
        altKey: 'cs_tablux_shot5_alt',
        captionKey: 'cs_tablux_shot5_cap',
      },
      {
        src: tabluxMenu,
        altKey: 'cs_tablux_shot6_alt',
        captionKey: 'cs_tablux_shot6_cap',
      },
      {
        src: tabluxLists,
        altKey: 'cs_tablux_shot7_alt',
        captionKey: 'cs_tablux_shot7_cap',
      },
      {
        src: tabluxAgenda,
        altKey: 'cs_tablux_shot8_alt',
        captionKey: 'cs_tablux_shot8_cap',
      },
      {
        src: tabluxChat,
        altKey: 'cs_tablux_shot9_alt',
        captionKey: 'cs_tablux_shot9_cap',
      },
      {
        src: tabluxNight,
        altKey: 'cs_tablux_shot10_alt',
        captionKey: 'cs_tablux_shot10_cap',
      },
    ],
    code: 'private',
  },
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
      'TensorFlow · PyTorch',
      'Docker on Coolify (self-hosted)',
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
    accessKey: 'cs_ensayadero_access',
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
      'Hugging Face inference',
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
    slug: 'billing-engine',
    hidden: true,
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
    slug: 'tartaytantas',
    hidden: true,
    name: 'Tartaytantas',
    rowKey: 'proj_tartaytantas_desc',
    stack: [
      'Astro 5 (SSR)',
      'React islands',
      'Supabase — Postgres, Auth, RLS',
      'Snipcart',
      'Playwright',
      'Vercel',
    ],
    page: false,
    href: 'https://tartaytantas.es/',
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
  {
    slug: 'gorraplanistas',
    name: 'Gorraplanistas',
    rowKey: 'proj_meteo_desc',
    taglineKey: 'cs_meteo_tagline',
    introKey: 'cs_meteo_intro',
    stack: [
      'C++ on an ESP32 · PlatformIO',
      'Supabase (self-hosted) · pg_cron',
      'Deno',
      'React 19 · Vite · ECharts',
      'Vercel Functions',
      'PWA · Web Push',
      'Open-Meteo',
    ],
    notes: [
      { headingKey: 'cs_meteo_n1_h', bodyKey: 'cs_meteo_n1_b' },
      { headingKey: 'cs_meteo_n2_h', bodyKey: 'cs_meteo_n2_b' },
      { headingKey: 'cs_meteo_n3_h', bodyKey: 'cs_meteo_n3_b' },
      { headingKey: 'cs_meteo_n4_h', bodyKey: 'cs_meteo_n4_b' },
    ],
    screenshots: [
      {
        src: gorraStation,
        altKey: 'cs_meteo_shot1_alt',
        captionKey: 'cs_meteo_shot1_cap',
      },
      {
        src: gorraCharts,
        altKey: 'cs_meteo_shot2_alt',
        captionKey: 'cs_meteo_shot2_cap',
      },
      {
        src: gorraForecast,
        altKey: 'cs_meteo_shot3_alt',
        captionKey: 'cs_meteo_shot3_cap',
      },
    ],
    code: { href: 'https://github.com/beltranrengifo/meteo-station' },
    href: 'https://gorraplanistas.vercel.app/',
  },
  {
    slug: 'ca-na-llum',
    name: 'Ca Na Llum, Mallorca',
    rowKey: 'proj_canallum_desc',
    taglineKey: 'cs_canallum_tagline',
    introKey: 'cs_canallum_intro',
    stack: [
      'three.js · WebGL',
      'TypeScript (strict) · Vite',
      'postprocessing · N8AO',
      'Web Audio API',
      'Python · Catastro · IGN',
      'Blender · Cycles',
      'Vitest',
      'Vercel',
    ],
    notes: [
      { headingKey: 'cs_canallum_n1_h', bodyKey: 'cs_canallum_n1_b' },
      { headingKey: 'cs_canallum_n4_h', bodyKey: 'cs_canallum_n4_b' },
      { headingKey: 'cs_canallum_n5_h', bodyKey: 'cs_canallum_n5_b' },
      { headingKey: 'cs_canallum_n2_h', bodyKey: 'cs_canallum_n2_b' },
      { headingKey: 'cs_canallum_n6_h', bodyKey: 'cs_canallum_n6_b' },
      { headingKey: 'cs_canallum_n3_h', bodyKey: 'cs_canallum_n3_b' },
    ],
    screenshots: [
      {
        src: canallumExterior,
        altKey: 'cs_canallum_shot1_alt',
        captionKey: 'cs_canallum_shot1_cap',
      },
      {
        src: canallumPlan,
        altKey: 'cs_canallum_shot2_alt',
        captionKey: 'cs_canallum_shot2_cap',
      },
      {
        src: canallumTour,
        altKey: 'cs_canallum_shot4_alt',
        captionKey: 'cs_canallum_shot4_cap',
      },
      {
        src: canallumNight,
        altKey: 'cs_canallum_shot3_alt',
        captionKey: 'cs_canallum_shot3_cap',
      },
    ],
    code: 'private',
    href: 'https://ca-na-llum.vercel.app/',
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
      'Groq — Llama 3.3 70B',
      'Hugging Face embeddings',
      'Framer Motion · Radix',
      'PWA',
      'Vercel',
    ],
    notes: [
      { headingKey: 'cs_paellalab_n1_h', bodyKey: 'cs_paellalab_n1_b' },
      { headingKey: 'cs_paellalab_n3_h', bodyKey: 'cs_paellalab_n3_b' },
      { headingKey: 'cs_paellalab_n2_h', bodyKey: 'cs_paellalab_n2_b' },
    ],
    screenshots: [],
    code: 'private',
    href: 'https://paella-lab.vercel.app/',
  },
  {
    slug: 'triscaideca',
    hidden: true,
    name: 'Triscaideca',
    rowKey: 'proj_triscaideca_desc',
    stack: [
      'Nuxt 2 (static)',
      '@nuxt/content',
      'Tailwind · SCSS tokens',
      'Netlify',
    ],
    page: false,
    href: 'https://triscaideca.com/',
  },
];

export const projects: Project[] = allProjects.filter(
  (project) => !project.hidden,
);

/** The projects that have a page of their own. */
export const caseStudies: CaseStudy[] = projects.filter(
  (project): project is CaseStudy => project.page !== false,
);

export function findCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
