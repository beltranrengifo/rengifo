import type { ImageMetadata } from 'astro';
import billingOverview from '../assets/work/billing-overview.png';
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
  taglineKey: string;
  introKey: string;
  stack: string[];
  notes: Note[];
  screenshots: Screenshot[];
  /** Public repository, or the reason there isn't one. */
  code: { href: string } | 'private';
  href?: string; // somewhere live to look, when there is one
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'billing-engine',
    name: 'Billing engine',
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
];

export function findCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
