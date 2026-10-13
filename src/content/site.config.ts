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
    linkedin: 'https://www.linkedin.com/in/patryk-ozog/',
  },
  email: 'patrykozog.it@gmail.com',
  cv: {
    pl: null,
    en: null,
  },
  ogImage: null,
  // e.g. { src: 'images/patryk-ozog.jpg', width: 800, height: 800, alt: { pl: '…', en: '…' } }
  photo: {
    src: 'images/photo.png',
    width: 400,
    height: 400,
    alt: { pl: 'Zdjęcie portretowe: Patryk Ożóg', en: 'Portrait of Patryk Ożóg' },
  },
};
