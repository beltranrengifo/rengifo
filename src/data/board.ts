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

export type Layer = 'backend' | 'frontend' | 'tools' | 'media' | 'practice';
export type Weight = 1 | 2 | 3;

export interface Tech {
  id: string;
  /** A name, or a pair when the name translates. */
  label: string | { en: string; es: string };
  layer: Layer;
  uses: Record<string, Weight>;
}

/** Project date spans, by slug — from each repository's history. */
export const projectSpans: Record<string, Span> = {
  ensayadero: ['2026-03', '2026-07'],
  'radio-perico': ['2026-09', '2026-10'],
  paellalab: ['2026-01', '2026-03'],
  'carabanchel-creativa': ['2021-01', '2021-05'],
};

type Text = { en: string; es: string };

/**
 * Work that only the board shows: films and the like, too far from a résumé
 * to belong on the classic page. The panel carries the facts, so a link is
 * only worth adding when there is something to watch.
 */
export interface BoardWork {
  id: string;
  label: string;
  span: Span;
  note: Text;
  facts: { label: Text; value: Text | string }[];
  /** Where to watch it, if anywhere. */
  watch?: string;
}

const DIRECTION = { en: 'Director', es: 'Dirección' };
const PRODUCTION = { en: 'Production', es: 'Producción' };
const RUNTIME = { en: 'Runtime', es: 'Duración' };
const AWARDS = { en: 'Awards', es: 'Premios' };

export const boardWorks: BoardWork[] = [
  {
    id: 'en-la-cuna-del-aire',
    label: 'En la cuna del aire',
    span: ['2005-01', '2005-12'],
    note: {
      en: 'Documentary short.',
      es: 'Cortometraje documental.',
    },
    facts: [
      {
        label: AWARDS,
        value: {
          en: 'Goya for Best Documentary Short Film, 2006',
          es: 'Goya al mejor cortometraje documental, 2006',
        },
      },
    ],
    watch: 'https://www.youtube.com/watch?v=04DO6E_X7e0',
  },
  {
    id: 'flores-de-ruanda',
    label: 'Flores de Ruanda',
    span: ['2009-01', '2009-12'],
    note: {
      en: 'A documentary short on Rwanda after the genocide, asking whether killers and survivors can live side by side — through reconciliation, forgiveness and the role of education.',
      es: 'Cortometraje documental sobre Ruanda tras el genocidio, que se pregunta si asesinos y supervivientes pueden convivir en paz: la reconciliación, el perdón y el papel de la educación.',
    },
    facts: [
      {
        label: { en: 'My role', es: 'Mi papel' },
        value: { en: 'Sound design', es: 'Diseño de sonido' },
      },
      { label: DIRECTION, value: 'David Muñoz' },
      { label: PRODUCTION, value: 'Híbrida' },
      { label: RUNTIME, value: '19 min' },
      {
        label: AWARDS,
        value: {
          en: 'Goya for Best Documentary Short Film, 2010 · Best Documentary at West Chester and Benalmádena · over 80 festivals',
          es: 'Goya al mejor cortometraje documental, 2010 · Mejor documental en West Chester y Benalmádena · más de 80 festivales',
        },
      },
    ],
  },
  {
    id: 'about-ndugu',
    label: 'About Ndugu',
    span: ['2012-06', '2013-02'],
    note: {
      en: 'A short shot in Kenya with the children of an orphanage: Ndugu sets out to find a new wife for his foster father in America, who has just been widowed.',
      es: 'Un corto rodado en Kenia con los niños de un orfanato: Ndugu se propone encontrarle una nueva esposa a su padre de acogida en Estados Unidos, que acaba de enviudar.',
    },
    facts: [
      { label: DIRECTION, value: 'David Muñoz' },
      { label: PRODUCTION, value: 'Híbrida' },
      { label: RUNTIME, value: '15 min' },
      {
        label: { en: 'Shot', es: 'Rodaje' },
        value: {
          en: 'Nyumbani, Kenya, June 2012',
          es: 'Nyumbani, Kenia, junio de 2012',
        },
      },
      {
        label: { en: 'Premiere', es: 'Estreno' },
        value: {
          en: 'Berlinale Shorts, 2013 (world premiere)',
          es: 'Berlinale Shorts, 2013 (estreno mundial)',
        },
      },
      {
        label: AWARDS,
        value: {
          en: 'Best Short Film, One Shot · Best Andalusian Short, Almería en Corto',
          es: 'Mejor cortometraje, One Shot · Mejor corto andaluz, Almería en Corto',
        },
      },
    ],
  },
];

/**
 * Roles whose company site was built by Beltrán himself: only those get a
 * link on the board, since the site is the work.
 */
export const builtSites: Record<string, string> = {
  aulacm: 'https://aulacm.com/',
  tau: 'https://taudesign.com/',
};

/** Grouped by layer; the board orders the rows itself. */
export const techs: Tech[] = [
  // Sound and image — where it all started.
  {
    id: 'pro-tools',
    label: 'Pro Tools',
    layer: 'media',
    uses: {
      prev: 3,
      'en-la-cuna-del-aire': 3,
      'flores-de-ruanda': 3,
      'about-ndugu': 3,
    },
  },
  { id: 'logic', label: 'Logic', layer: 'media', uses: { prev: 2 } },
  {
    id: 'avid',
    label: 'Avid Media Composer',
    layer: 'media',
    uses: { prev: 3 },
  },
  { id: 'final-cut', label: 'Final Cut', layer: 'media', uses: { prev: 3 } },
  {
    id: 'davinci',
    label: 'DaVinci Resolve',
    layer: 'media',
    uses: { prev: 1 },
  },
  {
    id: 'after-effects',
    label: 'After Effects',
    layer: 'media',
    uses: { prev: 1 },
  },
  { id: 'neve', label: 'Neve', layer: 'media', uses: { prev: 2 } },
  {
    id: 'dslr',
    label: { en: 'DSLR cameras', es: 'Cámaras DSLR' },
    layer: 'media',
    uses: { prev: 2 },
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
      ironhack: 2,
      docline: 2,
      liferay: 2,
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
      indra_consultant: 2,
    },
  },
  {
    id: 'vue',
    label: 'Vue',
    layer: 'frontend',
    uses: { indra_consultant: 3, indra_po: 2, docline: 3 },
  },
  { id: 'angular', label: 'Angular', layer: 'frontend', uses: { ironhack: 1 } },
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
      indra_po: 2,
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
    id: 'mapbox',
    label: 'Mapbox · Leaflet',
    layer: 'frontend',
    uses: { 'carabanchel-creativa': 3 },
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
    uses: { mews_senior: 2, mews_techlead: 3, mews_squad: 1, indra_po: 2 },
  },
  { id: 'vuex', label: 'Vuex', layer: 'frontend', uses: { docline: 2 } },
  { id: 'redux', label: 'Redux', layer: 'frontend', uses: { liferay: 2 } },
  {
    id: 'react-context',
    label: 'React Context',
    layer: 'frontend',
    uses: { liferay: 2 },
  },

  // Backend & data
  {
    id: 'php',
    label: 'PHP',
    layer: 'backend',
    uses: { aulacm: 2, tau: 3, indra_po: 2, docline: 1, indra_consultant: 2 },
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    layer: 'backend',
    uses: { aulacm: 3, tau: 3, indra_consultant: 2 },
  },
  {
    id: 'node',
    label: 'Node · Express',
    layer: 'backend',
    uses: {
      tau: 2,
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
    label: { en: 'AI · LLMs', es: 'IA · LLMs' },
    layer: 'backend',
    uses: {
      mews_techlead: 1,
      mews_squad: 3,
      paellalab: 1,
      'radio-perico': 1,
      mews_senior: 3,
    },
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    layer: 'backend',
    uses: { 'radio-perico': 1 },
  },
  {
    id: 'ml',
    label: 'TensorFlow · PyTorch',
    layer: 'backend',
    uses: { ensayadero: 1 },
  },
  { id: 'apollo', label: 'Apollo', layer: 'backend', uses: { indra_po: 2 } },
  { id: 'ruby', label: 'Ruby', layer: 'backend', uses: { ironhack: 2 } },

  // Tools & delivery
  {
    id: 'storybook',
    label: 'Storybook',
    layer: 'tools',
    uses: {
      indra_consultant: 2,
      indra_po: 1,
      mews_senior: 2,
      mews_techlead: 2,
    },
  },
  {
    id: 'tokens',
    label: 'Design tokens',
    layer: 'tools',
    uses: { mews_senior: 2, mews_techlead: 2 },
  },
  {
    id: 'figma',
    label: 'Figma',
    layer: 'tools',
    uses: { mews_senior: 1, mews_techlead: 2, indra_consultant: 2 },
  },
  { id: 'docker', label: 'Docker', layer: 'tools', uses: { ensayadero: 1 } },
  {
    id: 'cicd',
    label: 'CI/CD',
    layer: 'tools',
    uses: { mews_senior: 1, mews_techlead: 1, ensayadero: 1 },
  },
  {
    id: 'vitest',
    label: 'Vitest',
    layer: 'tools',
    uses: { mews_senior: 2, mews_techlead: 2, mews_squad: 2 },
  },
  {
    id: 'testing-library',
    label: 'Testing Library',
    layer: 'tools',
    uses: { liferay: 1, mews_senior: 2, mews_techlead: 2, mews_squad: 2 },
  },
  {
    id: 'jest',
    label: 'Jest',
    layer: 'tools',
    uses: { docline: 2, indra_consultant: 2, liferay: 1 },
  },
  {
    id: 'sketch',
    label: 'Sketch',
    layer: 'tools',
    uses: { indra_consultant: 2 },
  },

  // Ways of working
  {
    id: 'scrum',
    label: 'Scrum',
    layer: 'practice',
    uses: { indra_po: 2, mews_senior: 2, mews_squad: 2 },
  },
  {
    id: 'kanban',
    label: 'Kanban',
    layer: 'practice',
    uses: { mews_techlead: 2, mews_squad: 2 },
  },
  { id: 'jira', label: 'Jira', layer: 'practice', uses: { mews_squad: 2 } },
  {
    id: 'product',
    label: { en: 'Product', es: 'Producto' },
    layer: 'practice',
    uses: { indra_po: 2, mews_squad: 2 },
  },
];

/** The four eras, as fractional years, named along the floor. */
export const eras = [
  { key: 'ui_board_era_sound', start: 2002, end: 2012 },
  { key: 'ui_board_era_agency', start: 2012, end: 2018 },
  { key: 'ui_board_era_consultancy', start: 2018, end: 2021 },
  { key: 'ui_board_era_product', start: 2021, end: 2026.6 },
] as const;
