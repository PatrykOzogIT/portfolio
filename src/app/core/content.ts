import { InjectionToken } from '@angular/core';
import { SITE_CONTENT_DATA } from '../../content';
import type { SiteContent } from '../../content/model';

/**
 * Site content, injected rather than imported so tests can provide fixtures
 * (no projects, one project, many projects…).
 */
export const SITE_CONTENT = new InjectionToken<SiteContent>('SITE_CONTENT', {
  providedIn: 'root',
  factory: () => SITE_CONTENT_DATA,
});
