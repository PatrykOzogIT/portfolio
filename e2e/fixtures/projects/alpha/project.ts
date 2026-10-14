import type { ProjectMeta } from '../../../../src/content/model';

/** E2E fixture — never part of the production site. */
export const project: ProjectMeta = {
  slug: 'alpha',
  order: 1,
  published: true,
  kind: 'personal',
  title: { pl: 'Alpha PL', en: 'Alpha EN' },
  shortDescription: { pl: 'Projekt testowy alpha.', en: 'Alpha test project.' },
  technologies: ['angular', 'nestjs'],
  githubUrl: 'https://github.com/PatrykOzogIT',
  coverImage: {
    src: 'projects/alpha/cover.png',
    width: 1600,
    height: 1000,
    alt: { pl: 'Okładka alpha', en: 'Alpha cover' },
  },
  images: [
    {
      src: 'projects/alpha/1.png',
      width: 1600,
      height: 900,
      alt: { pl: 'Zrzut alpha', en: 'Alpha screenshot' },
      caption: { pl: 'Podpis alpha', en: 'Alpha caption' },
    },
  ],
};
