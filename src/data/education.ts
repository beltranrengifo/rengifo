export interface EducationItem {
  title?: string; // language-agnostic label (course/provider)
  titleKey?: string; // …or a message key when translatable
  year: string;
}

export const education: EducationItem[] = [
  { titleKey: 'edu_secureflag', year: '2022 — 26' },
  { title: 'Scrum Product Owner — Jerónimo Palacios', year: '2019' },
  { title: 'Agile Project Management — Udemy', year: '2019' },
  { title: 'Unit Testing, Jasmine — Indra University', year: '2019' },
  { title: 'NodeJS Advanced — Indra University', year: '2019' },
  { title: 'A11y & UX in Web Dev — Indra University', year: '2019' },
  { title: 'Node Fullstack — Ironhack', year: '2018' },
  { title: 'Angular 2 — Aepi', year: '2017' },
  { titleKey: 'edu_oop', year: '2016' },
  { title: 'Web Dev: PHP, JS, SQL — Now-e', year: '2012' },
  { titleKey: 'edu_cinematography', year: '2001 — 05' },
  { titleKey: 'edu_humanities', year: '1998 — 01' },
];
