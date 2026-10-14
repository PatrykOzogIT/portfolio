import { ECOSYSTEM, ECOSYSTEM_ROLE } from './ecosystem';
import { EXPERTISE } from './expertise';
import { PROJECT_SECTIONS, PUBLISHED_PROJECTS } from './generated/projects';
import type { SiteContent } from './model';
import { SITE_CONFIG } from './site.config';
import { TECH_STACK } from './tech-stack';
import { TECHNOLOGIES } from './technologies';

/** The site's content. Projects come from the generated registry (published only). */
export const SITE_CONTENT_DATA: SiteContent = {
  site: SITE_CONFIG,
  technologies: TECHNOLOGIES,
  techStack: TECH_STACK,
  expertise: EXPERTISE,
  ecosystem: ECOSYSTEM,
  ecosystemRole: ECOSYSTEM_ROLE,
  projects: PUBLISHED_PROJECTS,
  projectSections: PROJECT_SECTIONS,
};
