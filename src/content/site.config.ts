import type { SiteConfig } from './model';

/**
 * Site-wide configuration. Every `null` hides the related UI element automatically.
 */
export const SITE_CONFIG: SiteConfig = {
  // TODO(deployment): set once the domain is chosen, e.g. 'https://example.com'.
  siteUrl: null,
  person: {
    name: 'Patryk Ożóg',
    jobTitle: 'Senior Full-Stack Developer',
  },
  links: {
    github: 'https://github.com/PatrykOzogIT',
    linkedin: null,
  },
  email: null,
  cv: {
    pl: null, // e.g. { path: 'cv/patryk-ozog-cv-pl.pdf' }
    en: null,
  },
  ogImage: null,
};
