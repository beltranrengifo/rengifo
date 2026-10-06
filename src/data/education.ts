export interface EducationItem {
  title?: string; // language-agnostic label (course/provider)
  titleKey?: string; // …or a message key when translatable
  year: string;
}

export const education: EducationItem[] = [
  { titleKey: 'edu_secureflag', year: '2022 — 26' },
  { title: 'Scrum Product Owner — Jerónimo Palacios', year: '2019' },
  { title: 'Node Fullstack — Ironhack', year: '2018' },
  // Shorter courses, gathered on one line so the degrees stand out.
  { titleKey: 'edu_courses', year: '2012 — 19' },
  { titleKey: 'edu_sound_engineering', year: '2001 — 05' },
  { titleKey: 'edu_humanities', year: '1998 — 01' },
];
