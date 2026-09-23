import * as messages from '../paraglide/messages.js';

export type Locale = 'en' | 'es';

type MessageInputs = Record<string, string | number>;

type MessageFn = (
  inputs?: MessageInputs,
  options?: { locale?: Locale },
) => string;

/** Resolve a message key in a given locale (falls back to the key itself). */
export function t(
  key: string,
  locale: Locale,
  inputs: MessageInputs = {},
): string {
  const fn = (messages as unknown as Record<string, MessageFn>)[key];
  return typeof fn === 'function' ? fn(inputs, { locale }) : key;
}

/**
 * The first paid web development work (AulaCM, 2012). Years of experience and
 * the copyright year are derived from it at BUILD time, so a deploy refreshes
 * them — no copy to edit each January.
 */
const CAREER_STARTED = 2012;

export const currentYear = new Date().getFullYear();
export const yearsOfExperience = currentYear - CAREER_STARTED;

/** Coerce Astro.currentLocale (string | undefined) to a known Locale. */
export function resolveLocale(value: string | undefined): Locale {
  return value === 'es' ? 'es' : 'en';
}

/**
 * The same page in a given locale. EN paths are the canonical ones; ES lives
 * under a `/es` prefix. Both ends keep the trailing slash Astro emits.
 */
export function localisedPath(
  pathname: string,
  from: Locale,
  to: Locale,
): string {
  const base = from === 'es' ? pathname.replace(/^\/es/, '') || '/' : pathname;
  if (to === 'en') return base;
  return base === '/' ? '/es/' : `/es${base}`;
}

/** The other locale's URL for this page, for the language switcher. */
export function alternateHref(locale: Locale, pathname = '/'): string {
  return localisedPath(pathname, locale, locale === 'en' ? 'es' : 'en');
}

/** This locale's home URL. */
export function homeHref(locale: Locale): string {
  return locale === 'es' ? '/es/' : '/';
}

/** Contact details (language-agnostic). */
export const contact = {
  email: 'beltran@rengifo.es',
  gmail: 'merloc@gmail.com',
  linkedin: 'https://www.linkedin.com/in/beltranrengifo/',
  github: 'https://github.com/beltranrengifo',
  languages: 'ES · EN · IT',
};
