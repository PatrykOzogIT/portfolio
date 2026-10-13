import { booleanAttribute, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'sm';

/**
 * Applies design-system button styles to a native <button> or <a> — semantics stay native.
 * Usage: `<a appButton variant="primary" routerLink="…">…</a>`
 */
@Directive({
  selector: 'a[appButton], button[appButton]',
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'primary'",
    '[class.btn--secondary]': "variant() === 'secondary'",
    '[class.btn--ghost]': "variant() === 'ghost'",
    '[class.btn--sm]': "size() === 'sm'",
    '[class.btn--block]': 'block()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
}
