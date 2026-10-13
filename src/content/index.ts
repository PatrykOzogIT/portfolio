import { ECOSYSTEM } from './ecosystem';
import { PROJECT_SECTIONS, PUBLISHED_PROJECTS } from './generated/projects';
import type { SiteContent } from './model';
import { SITE_CONFIG } from './site.config';
import { TECHNOLOGIES } from './technologies';

/** The site's content. Projects come from the generated registry (published only). */
export const SITE_CONTENT_DATA: SiteContent = {
  site: SITE_CONFIG,
  technologies: TECHNOLOGIES,
  ecosystem: ECOSYSTEM,
  projects: PUBLISHED_PROJECTS,
  projectSections: PROJECT_SECTIONS,
};
