import { ChangeDetectionStrategy, Component, Directive, inject } from '@angular/core';
import { LangService } from '../../../core/i18n/lang.service';
import { Icon } from '../icon/icon';

/** Opens the link in a new tab with safe `rel` attributes. */
@Directive({
  selector: 'a[appExternal]',
  host: { target: '_blank', rel: 'noopener noreferrer' },
})
export class ExternalLink {}

/** Visual ↗ marker plus a screen-reader note that the link opens a new tab. */
@Component({
  selector: 'app-new-tab-hint',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <svg appIcon="arrow-up-right" class="icon icon--external"></svg>
    <span class="visually-hidden">{{ t().a11y.newTab }}</span>
  `,
})
export class NewTabHint {
  protected readonly t = inject(LangService).t;
}
