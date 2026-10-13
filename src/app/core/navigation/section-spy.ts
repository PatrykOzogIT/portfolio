import { DestroyRef, Injectable, signal } from '@angular/core';

/**
 * Tracks which page section is being read (the one crossing the middle band of the viewport),
 * so the navigation can mark it with aria-current.
 */
@Injectable({ providedIn: 'root' })
export class SectionSpy {
  private readonly activeId = signal<string | null>(null);
  readonly active = this.activeId.asReadonly();

  /** Call in the browser only (e.g. from afterNextRender). */
  observe(sections: readonly HTMLElement[], destroyRef: DestroyRef): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.activeId.set(entry.target.id || null);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    destroyRef.onDestroy(() => {
      observer.disconnect();
      this.activeId.set(null);
    });
  }
}
