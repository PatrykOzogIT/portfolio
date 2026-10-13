import { inject } from '@angular/core';
import { RedirectCommand, Router, type ResolveFn } from '@angular/router';
import type { ProjectMeta, ProjectSections } from '../../../content/model';
import {
  findPublishedProject,
  projectNeighbours,
  type ProjectNeighbours,
} from '../../../content/selectors';
import { SITE_CONTENT } from '../../core/content';
import { isLang } from '../../core/i18n/lang-url';

export interface ProjectPageData {
  readonly meta: ProjectMeta;
  readonly sections: ProjectSections;
  readonly neighbours: ProjectNeighbours;
}

/**
 * Resolves a PUBLISHED project and its long-form sections for the current language.
 * Anything else renders the not-found page (URL kept, so the visitor sees what they typed).
 */
export const projectResolver: ResolveFn<ProjectPageData> = async (route) => {
  const content = inject(SITE_CONTENT);
  const router = inject(Router);
  const lang = route.paramMap.get('lang');
  const slug = route.paramMap.get('slug') ?? '';
  const meta = findPublishedProject(content.projects, slug);

  if (!meta || !isLang(lang)) {
    return new RedirectCommand(router.parseUrl(`/${isLang(lang) ? lang : 'pl'}/not-found`), {
      skipLocationChange: true,
    });
  }

  const loader = content.projectSections[slug]?.[lang];
  return {
    meta,
    sections: loader ? await loader() : {},
    neighbours: projectNeighbours(content.projects, slug)!,
  };
};
