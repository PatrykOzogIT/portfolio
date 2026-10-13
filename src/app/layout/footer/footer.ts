import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE_CONTENT } from '../../core/content';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container inner">
      <p>© {{ year }} {{ name }}</p>
      <p class="mono">{{ jobTitle }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-block: 28px;
      border-top: 1px solid var(--border);
      color: var(--text-3);
      font-size: var(--fs-small);
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px 24px;
    }
  `,
})
export class Footer {
  protected readonly name = inject(SITE_CONTENT).site.person.name;
  protected readonly jobTitle = inject(SITE_CONTENT).site.person.jobTitle;
  /** Resolved at prerender time — refreshed with every build. */
  protected readonly year = new Date().getFullYear();
}
