import type { Span } from './experience';

/**
 * What board mode needs that the rest of the data does not carry: when each
 * project happened, and which technologies travelled through which roles and
 * projects. Ids are role ids (the title key without `exp_` and `_title`) and
 * project slugs.
 */

export type Layer = 'backend' | 'frontend' | 'infra' | 'craft';

export interface Tech {
  id: string;
  /** A name, or a pair when the name translates. */
  label: string | { en: string; es: string };
  layer: Layer;
  usedIn: string[];
}

/** Project date spans, by slug — from each repository's history. */
export const projectSpans: Record<string, Span> = {
  ensayadero: ['2026-03', '2026-07'],
  'radio-perico': ['2026-09', '2026-10'],
  paellalab: ['2026-01', '2026-03'],
  'carabanchel-creativa': ['2021-01', '2021-05'],
};

export const techs: Tech[] = [
  // Backend & data
  { id: 'java', label: 'Java', layer: 'backend', usedIn: ['liferay'] },
  {
    id: 'node',
    label: 'Node.js',
    layer: 'backend',
    usedIn: ['carabanchel-creativa', 'ironhack', 'tau'],
  },
  {
    id: 'python',
    label: 'Python',
    layer: 'backend',
    usedIn: ['ensayadero', 'radio-perico'],
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    layer: 'backend',
    usedIn: ['radio-perico'],
  },
  {
    id: 'postgres',
    label: 'Postgres · Supabase',
    layer: 'backend',
    usedIn: ['ensayadero', 'radio-perico', 'paellalab'],
  },
  {
    id: 'strapi',
    label: 'Strapi · MongoDB',
    layer: 'backend',
    usedIn: ['carabanchel-creativa'],
  },
  {
    id: 'php',
    label: 'PHP · WordPress',
    layer: 'backend',
    usedIn: ['aulacm', 'tau'],
  },
  {
    id: 'llm',
    label: 'LLMs · RAG',
    layer: 'backend',
    usedIn: ['radio-perico', 'paellalab'],
  },
  {
    id: 'ml',
    label: 'TensorFlow · PyTorch',
    layer: 'backend',
    usedIn: ['ensayadero'],
  },

  // Frontend
  {
    id: 'react',
    label: 'React',
    layer: 'frontend',
    usedIn: [
      'mews_squad',
      'mews_techlead',
      'mews_senior',
      'liferay',
      'ensayadero',
      'radio-perico',
      'paellalab',
      'carabanchel-creativa',
      'ironhack',
    ],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    layer: 'frontend',
    usedIn: [
      'mews_squad',
      'mews_techlead',
      'mews_senior',
      'liferay',
      'docline',
      'ensayadero',
      'paellalab',
    ],
  },
  {
    id: 'vue',
    label: 'Vue',
    layer: 'frontend',
    usedIn: ['docline', 'indra_consultant'],
  },
  { id: 'next', label: 'Next.js', layer: 'frontend', usedIn: ['ensayadero'] },
  { id: 'astro', label: 'Astro', layer: 'frontend', usedIn: ['paellalab'] },
  { id: 'jquery', label: 'jQuery', layer: 'frontend', usedIn: ['tau'] },
  {
    id: 'css',
    label: 'CSS · SCSS',
    layer: 'frontend',
    usedIn: ['aulacm', 'tau', 'docline'],
  },
  {
    id: 'tanstack',
    label: 'TanStack',
    layer: 'frontend',
    usedIn: ['mews_squad', 'mews_techlead'],
  },
  {
    id: 'mapbox',
    label: 'Mapbox',
    layer: 'frontend',
    usedIn: ['carabanchel-creativa'],
  },

  // Infrastructure & delivery
  { id: 'docker', label: 'Docker', layer: 'infra', usedIn: ['ensayadero'] },
  {
    id: 'vercel',
    label: 'Vercel',
    layer: 'infra',
    usedIn: ['radio-perico', 'paellalab'],
  },
  { id: 'cicd', label: 'CI/CD', layer: 'infra', usedIn: ['mews_senior'] },
  {
    id: 'tokens',
    label: 'Style Dictionary',
    layer: 'infra',
    usedIn: ['mews_senior'],
  },

  // Craft
  {
    id: 'design-systems',
    label: 'Design systems',
    layer: 'craft',
    usedIn: ['mews_techlead', 'mews_senior', 'indra_consultant', 'docline'],
  },
  {
    id: 'a11y',
    label: { en: 'Accessibility', es: 'Accesibilidad' },
    layer: 'craft',
    usedIn: ['mews_techlead'],
  },
  {
    id: 'leadership',
    label: { en: 'Leadership', es: 'Liderazgo' },
    layer: 'craft',
    usedIn: ['mews_squad', 'docline', 'indra_po', 'tau'],
  },
  {
    id: 'teaching',
    label: { en: 'Teaching', es: 'Docencia' },
    layer: 'craft',
    usedIn: ['ironhack', 'aulacm'],
  },
  { id: 'pro-tools', label: 'Pro Tools', layer: 'craft', usedIn: ['prev'] },
];

/** The four eras drawn behind the nodes, as fractional years. */
export const eras = [
  { key: 'ui_board_era_sound', start: 2004, end: 2012 },
  { key: 'ui_board_era_agency', start: 2012, end: 2018 },
  { key: 'ui_board_era_consultancy', start: 2018, end: 2021 },
  { key: 'ui_board_era_product', start: 2021, end: 2026.6 },
] as const;
