import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, type IconDef, type IconName } from './icons';

/**
 * Inline SVG icon, decorative by default (`aria-hidden`).
 * Usage: `<svg appIcon="arrow-right" class="icon"></svg>`
 */
@Component({
  selector: 'svg[appIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    focusable: 'false',
    '[attr.fill]': "def().filled ? 'currentColor' : 'none'",
    '[attr.stroke]': "def().filled ? null : 'currentColor'",
    '[attr.stroke-width]': 'def().filled ? null : 1.75',
    '[attr.stroke-linecap]': "def().filled ? null : 'round'",
    '[attr.stroke-linejoin]': "def().filled ? null : 'round'",
  },
  template: `
    @for (d of def().paths; track $index) {
      <svg:path [attr.d]="d" />
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>({ alias: 'appIcon' });
  protected readonly def = computed<IconDef>(() => ICONS[this.name()]);
}
