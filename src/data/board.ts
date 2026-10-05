import type { Span } from './experience';

/**
 * What board mode needs that the rest of the data does not carry: when each
 * project happened, and how much each technology was used where.
 *
 * Weights are a rough feel, not a measurement — edit them freely:
 *   3  the main stack of that job
 *   2  used regularly
 *   1  touched now and then
 *
 * Ids are role ids (the title key without `exp_` and `_title`) and project
 * slugs.
 */

export type Layer = 'backend' | 'frontend' | 'tools' | 'media';
export type Weight = 1 | 2 | 3;

export interface Tech {
  id: string;
  /** A name, or a pair when the name translates. */
  label: string | { en: string; es: string };
  layer: Layer;
  uses: Record<string, Weight>;
  /** Somewhere to read about it — shown in the panel. */
  href?: string;
}

/** Project date spans, by slug — from each repository's history. */
export const projectSpans: Record<string, Span> = {
  ensayadero: ['2026-03', '2026-07'],
  'radio-perico': ['2026-09', '2026-10'],
  paellalab: ['2026-01', '2026-03'],
  'carabanchel-creativa': ['2021-01', '2021-05'],
};

/**
 * Work that only the board shows: films and the like, too far from a résumé
 * to belong on the classic page.
 */
export interface BoardWork {
  id: string;
  label: string;
  span: Span;
  note: { en: string; es: string };
  href?: string;
}

export const boardWorks: BoardWork[] = [
  {
    id: 'en-la-cuna-del-aire',
    label: 'En la cuna del aire',
    span: ['2005-01', '2005-12'],
    note: {
      en: 'Documentary short. Goya for Best Documentary Short Film, 2006.',
      es: 'Cortometraje documental. Goya al mejor cortometraje documental, 2006.',
    },
    href: 'https://www.youtube.com/watch?v=04DO6E_X7e0',
  },
  {
    id: 'flores-de-ruanda',
    label: 'Flores de Ruanda',
    span: ['2009-01', '2009-12'],
    note: {
      en: 'Documentary short by David Muñoz on Rwanda after the genocide. Goya for Best Documentary Short Film, 2010.',
      es: 'Cortometraje documental de David Muñoz sobre Ruanda tras el genocidio. Goya al mejor cortometraje documental, 2010.',
    },
    href: 'https://sede.mcu.gob.es/CatalogoICAA/Peliculas/Detalle?Pelicula=150809',
  },
];

/** Grouped by layer; the board orders the rows itself. */
export const techs: Tech[] = [
  // Sound and image — where it all started.
  {
    id: 'pro-tools',
    label: 'Pro Tools',
    layer: 'media',
    uses: { prev: 3, 'en-la-cuna-del-aire': 3, 'flores-de-ruanda': 3 },
    href: 'https://www.avid.com/pro-tools',
  },
  {
    id: 'logic',
    label: 'Logic',
    layer: 'media',
    uses: { prev: 2 },
    href: 'https://www.apple.com/logic-pro/',
  },
  {
    id: 'avid',
    label: 'Avid Media Composer',
    layer: 'media',
    uses: { prev: 2 },
    href: 'https://www.avid.com/media-composer',
  },
  {
    id: 'final-cut',
    label: 'Final Cut',
    layer: 'media',
    uses: { prev: 2 },
    href: 'https://www.apple.com/final-cut-pro/',
  },
  {
    id: 'davinci',
    label: 'DaVinci Resolve',
    layer: 'media',
    uses: { prev: 1 },
    href: 'https://www.blackmagicdesign.com/products/davinciresolve',
  },
  {
    id: 'after-effects',
    label: 'After Effects',
    layer: 'media',
    uses: { prev: 1 },
    href: 'https://www.adobe.com/products/aftereffects.html',
  },

  // Frontend
  {
    id: 'javascript',
    label: 'JavaScript',
    layer: 'frontend',
    uses: {
      aulacm: 1,
      tau: 2,
      ironhack: 3,
      indra_consultant: 2,
      indra_po: 2,
      docline: 2,
      liferay: 2,
      'carabanchel-creativa': 1,
    },
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    layer: 'frontend',
    uses: {
      ironhack: 1,
      docline: 2,
      mews_senior: 3,
      mews_techlead: 3,
      mews_squad: 3,
      paellalab: 1,
      ensayadero: 1,
    },
  },
  {
    id: 'react',
    label: 'React',
    layer: 'frontend',
    uses: {
      ironhack: 2,
      'carabanchel-creativa': 1,
      liferay: 3,
      mews_senior: 3,
      mews_techlead: 3,
      mews_squad: 3,
      paellalab: 1,
      ensayadero: 1,
      'radio-perico': 1,
    },
  },
  {
    id: 'vue',
    label: 'Vue',
    layer: 'frontend',
    uses: { indra_consultant: 3, docline: 3 },
  },
  {
    id: 'angular',
    label: 'Angular',
    layer: 'frontend',
    uses: { ironhack: 1 },
  },
  {
    id: 'jquery',
    label: 'jQuery',
    layer: 'frontend',
    uses: { aulacm: 1, tau: 3 },
  },
  {
    id: 'css',
    label: 'CSS · SCSS',
    layer: 'frontend',
    uses: {
      aulacm: 2,
      tau: 3,
      ironhack: 2,
      indra_consultant: 2,
      docline: 2,
      liferay: 2,
      mews_senior: 2,
      mews_techlead: 2,
      mews_squad: 2,
    },
  },
  {
    id: 'meta-frameworks',
    label: 'Next.js · Astro',
    layer: 'frontend',
    uses: { paellalab: 1, ensayadero: 1 },
  },
  {
    id: 'tanstack',
    label: 'TanStack',
    layer: 'frontend',
    uses: { mews_techlead: 2, mews_squad: 2 },
  },
  {
    id: 'a11y',
    label: { en: 'Accessibility', es: 'Accesibilidad' },
    layer: 'frontend',
    uses: { mews_senior: 1, mews_techlead: 3, mews_squad: 1 },
  },

  // Backend & data
  {
    id: 'php',
    label: 'PHP',
    layer: 'backend',
    uses: { aulacm: 2, tau: 3, indra_po: 2, docline: 1 },
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    layer: 'backend',
    uses: { aulacm: 3, tau: 3 },
  },
  {
    id: 'node',
    label: 'Node · Express',
    layer: 'backend',
    uses: {
      tau: 1,
      ironhack: 3,
      indra_consultant: 2,
      'carabanchel-creativa': 1,
    },
  },
  {
    id: 'java',
    label: 'Java',
    layer: 'backend',
    uses: { indra_consultant: 3, liferay: 3 },
  },
  { id: 'go', label: 'Go', layer: 'backend', uses: { indra_consultant: 1 } },
  {
    id: 'dotnet',
    label: '.NET',
    layer: 'backend',
    uses: { tau: 1, mews_senior: 1, mews_techlead: 1, mews_squad: 2 },
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    layer: 'backend',
    uses: { indra_po: 2, mews_senior: 1, mews_techlead: 1, mews_squad: 1 },
  },
  {
    id: 'cms',
    label: 'Strapi · MongoDB',
    layer: 'backend',
    uses: { ironhack: 2, indra_po: 2, 'carabanchel-creativa': 1 },
  },
  {
    id: 'python',
    label: 'Python',
    layer: 'backend',
    uses: { ensayadero: 1, 'radio-perico': 1 },
  },
  {
    id: 'postgres',
    label: 'Postgres · Supabase',
    layer: 'backend',
    uses: { paellalab: 1, ensayadero: 1, 'radio-perico': 1 },
  },
  {
    id: 'llm',
    label: 'LLMs · RAG',
    layer: 'backend',
    uses: { paellalab: 1, 'radio-perico': 1 },
  },

  // Tools & delivery
  {
    id: 'storybook',
    label: 'Storybook',
    layer: 'tools',
    uses: { indra_consultant: 2, mews_senior: 2, mews_techlead: 2 },
  },
  {
    id: 'tokens',
    label: 'Design tokens',
    layer: 'tools',
    uses: { mews_senior: 2, mews_techlead: 2 },
  },
  {
    id: 'cicd',
    label: 'CI/CD',
    layer: 'tools',
    uses: { mews_senior: 1, mews_techlead: 1, ensayadero: 1 },
  },
];

/** The four eras, as fractional years, named along the floor. */
export const eras = [
  { key: 'ui_board_era_sound', start: 2002, end: 2012 },
  { key: 'ui_board_era_agency', start: 2012, end: 2018 },
  { key: 'ui_board_era_consultancy', start: 2018, end: 2021 },
  { key: 'ui_board_era_product', start: 2021, end: 2026.6 },
] as const;
