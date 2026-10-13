import { computed, inject } from '@angular/core';
import { visibleHomeSections, type HomeSectionId } from '../../content/selectors';
import { SITE_CONTENT } from '../core/content';
import { LangService } from '../core/i18n/lang.service';
import { SectionSpy } from '../core/navigation/section-spy';

export interface NavItem {
  readonly id: HomeSectionId;
  readonly label: string;
}

/**
 * Navigation items = visible home sections (contact is rendered separately as the CTA).
 * Must be called in an injection context.
 */
export function injectNavItems() {
  const content = inject(SITE_CONTENT);
  const { t } = inject(LangService);
  const sections = visibleHomeSections(content);

  return {
    items: computed<NavItem[]>(() =>
      sections.filter((id) => id !== 'contact').map((id) => ({ id, label: t().nav[id] })),
    ),
    hasContact: sections.includes('contact'),
    /** Section currently being read (home page only), for aria-current. */
    active: inject(SectionSpy).active,
  };
}
