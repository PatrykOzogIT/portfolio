import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Subtle fade-and-rise when a block scrolls into view.
 *
 * Content is never hidden by default: prerendered HTML is fully visible without JavaScript.
 * Only after hydration, and only for blocks that are still below the fold, the directive adds
 * `reveal-pending`; the class is removed once the block enters the viewport. Blocks already on
 * screen are left alone (no flash, no effect on LCP). Disabled with `prefers-reduced-motion`.
 * Positions come from IntersectionObserver (asynchronous) — no forced layout during start-up.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;

      let first = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          const wasFirst = first;
          first = false;
          // Initial report: visible (or above) now → never animate it.
          if (wasFirst && (entry.isIntersecting || entry.boundingClientRect.top < 0)) {
            observer.disconnect();
          } else if (wasFirst) {
            el.classList.add('reveal-pending');
          } else if (entry.isIntersecting) {
            el.classList.remove('reveal-pending');
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
