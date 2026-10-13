import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent section header: mono eyebrow, h2 (referenced by the section's aria-labelledby), optional lead.
 * Extra content (e.g. a note) can be projected below the lead.
 */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (eyebrow()) {
      <p class="eyebrow mono">{{ eyebrow() }}</p>
    }
    <h2 class="h2" [id]="headingId()">{{ title() }}</h2>
    @if (lead()) {
      <p class="lead">{{ lead() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
    }
    .eyebrow {
      color: var(--accent-strong);
    }
    .h2 {
      margin-top: 14px;
      max-width: 22em;
    }
    .lead {
      margin-top: 18px;
      max-width: 42em;
      font-size: clamp(1.05rem, 1rem + 0.2vw, 1.15rem);
    }
  `,
})
export class SectionHeading {
  readonly headingId = input.required<string>();
  readonly title = input.required<string>();
  readonly eyebrow = input<string>();
  readonly lead = input<string>();
}
