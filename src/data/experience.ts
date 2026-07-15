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
  companyHref?: string; // company site, linked from the name
  roles: Role[];
}

// Reverse-chronological work history. Copy lives in src/i18n/messages/{en,es}.json.
export const experience: ExperienceEntry[] = [
  {
    period: '2022 — 2026',
    company: 'Mews',
    companyHref: 'https://www.mews.com/',
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
    companyHref: 'https://www.liferay.com/',
    roles: [{ titleKey: 'exp_liferay_title', blurbKey: 'exp_liferay_blurb' }],
  },
  {
    period: '2020 — 2021',
    company: 'Docline',
    companyHref: 'https://www.docline.com/',
    roles: [{ titleKey: 'exp_docline_title', blurbKey: 'exp_docline_blurb' }],
  },
  {
    period: '2018 — 2021',
    company: 'Minsait · Indra',
    companyHref: 'https://www.minsait.com/',
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
    companyHref: 'https://www.ironhack.com/',
    roles: [{ titleKey: 'exp_ironhack_title', blurbKey: 'exp_ironhack_blurb' }],
  },
  {
    period: '2015 — 2018',
    company: 'Tau Design',
    companyHref: 'https://taudesign.com/',
    roles: [{ titleKey: 'exp_tau_title', blurbKey: 'exp_tau_blurb' }],
  },
  {
    period: '2012 — 2015',
    company: 'AulaCM',
    companyHref: 'https://aulacm.com/',
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
