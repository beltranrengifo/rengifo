export interface Role {
  /** Paraglide message key for the role title. */
  titleKey: string;
  /** Uppercase date line (language-agnostic). */
  dates?: string;
  /** Paraglide message key for the blurb. */
  blurbKey: string;
  /** Optional external link rendered on the role title. */
  href?: string;
}

export interface ExperienceEntry {
  period: string; // left-column date range, language-agnostic
  company?: string; // brand name (same in both languages)
  companyKey?: string; // …or a message key when the label is translatable
  roles: Role[];
}

/*
 * NOTE FOR CONTENT AUDIT: the Mews blurbs are enriched from the git/self-eval
 * analysis (DataGrid, code-ownership, tokens). The strongest framing
 * ("set the technical direction") is kept from the original design copy — flag
 * for review. Copy lives in src/i18n/messages/{en,es}.json.
 */
export const experience: ExperienceEntry[] = [
  {
    period: '2022 — 2026',
    company: 'Mews',
    roles: [
      {
        titleKey: 'exp_mews_squad_title',
        dates: 'Feb — Jul 2026',
        blurbKey: 'exp_mews_squad_blurb',
      },
      {
        titleKey: 'exp_mews_techlead_title',
        dates: 'Jun 2024 — Feb 2026',
        blurbKey: 'exp_mews_techlead_blurb',
      },
      {
        titleKey: 'exp_mews_senior_title',
        dates: 'Dec 2022 — Jun 2024',
        blurbKey: 'exp_mews_senior_blurb',
      },
    ],
  },
  {
    period: '2021 — 2022',
    company: 'Liferay',
    roles: [{ titleKey: 'exp_liferay_title', blurbKey: 'exp_liferay_blurb' }],
  },
  {
    period: '2020 — 2021',
    company: 'Docline',
    roles: [
      {
        titleKey: 'exp_docline_title',
        href: 'https://www.docline.com/',
        blurbKey: 'exp_docline_blurb',
      },
    ],
  },
  {
    period: '2018 — 2021',
    company: 'Minsait · Indra',
    roles: [
      {
        titleKey: 'exp_indra_po_title',
        dates: '2020 — 2021',
        href: 'https://www.onesait.com/Technology/experience/',
        blurbKey: 'exp_indra_po_blurb',
      },
      {
        titleKey: 'exp_indra_consultant_title',
        dates: '2018 — 2020',
        href: 'https://ods.ux.onesait.com/one/#herramientas',
        blurbKey: 'exp_indra_consultant_blurb',
      },
    ],
  },
  {
    period: '2018 — 2019',
    company: 'Ironhack',
    roles: [{ titleKey: 'exp_ironhack_title', blurbKey: 'exp_ironhack_blurb' }],
  },
  {
    period: '2015 — 2018',
    company: 'Tau Design',
    roles: [{ titleKey: 'exp_tau_title', blurbKey: 'exp_tau_blurb' }],
  },
  {
    period: '2012 — 2015',
    company: 'AulaCM',
    roles: [{ titleKey: 'exp_aulacm_title', blurbKey: 'exp_aulacm_blurb' }],
  },
  {
    period: '2004 — 2012',
    companyKey: 'exp_prev_company',
    roles: [
      {
        titleKey: 'exp_prev_title',
        href: 'https://lacasaestudio.com/',
        blurbKey: 'exp_prev_blurb',
      },
    ],
  },
];
