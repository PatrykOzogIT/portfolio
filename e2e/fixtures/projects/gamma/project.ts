import type { ProjectMeta } from '../../../../src/content/model';

/** E2E fixture — featured, gallery only, no cover, no long-form text. */
export const project: ProjectMeta = {
  slug: 'gamma',
  order: 3,
  published: true,
  featured: true,
  title: { pl: 'Gamma PL', en: 'Gamma EN' },
  shortDescription: { pl: 'Projekt testowy gamma.', en: 'Gamma test project.' },
  technologies: ['angular', 'typescript'],
  demoUrl: 'https://example.com',
  images: [
    {
      src: 'projects/gamma/1.png',
      width: 1920,
      height: 1080,
      alt: { pl: 'Gamma 1', en: 'Gamma 1' },
    },
    {
      src: 'projects/gamma/2.png',
      width: 720,
      height: 1480,
      alt: { pl: 'Gamma 2', en: 'Gamma 2' },
    },
    {
      src: 'projects/gamma/3.png',
      width: 1200,
      height: 1200,
      alt: { pl: 'Gamma 3', en: 'Gamma 3' },
    },
  ],
};
