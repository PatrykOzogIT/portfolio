import type { ProjectMeta } from '../../../../src/content/model';

/** E2E fixture — unpublished: must never appear anywhere. */
export const project: ProjectMeta = {
  slug: 'beta',
  order: 2,
  published: false,
  kind: 'demo',
  title: { pl: 'BETA-UKRYTY', en: 'BETA-HIDDEN' },
  shortDescription: { pl: 'Nieopublikowany.', en: 'Unpublished.' },
  technologies: [],
};
