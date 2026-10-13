/** Helpers for horizontal scroll-snap slide tracks (one slide = full track width). */

export function slideIndex(track: HTMLElement): number {
  return track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0;
}

/**
 * Tracks the visible slide of a track that can move both by user swipes and programmatically.
 * While a programmatic smooth scroll is in progress, intermediate scroll positions are ignored —
 * otherwise a counter would briefly jump back to the previous slide.
 */
export class SlideTracker {
  private target: number | null = null;

  goTo(track: HTMLElement, index: number, behavior: ScrollBehavior = 'smooth'): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const effective = reduced ? 'instant' : behavior;
    this.target = effective === 'smooth' ? index : null;
    track.scrollTo({ left: index * track.clientWidth, behavior: effective });
  }

  /** Returns the slide to report after a scroll event, or `null` to ignore the event. */
  onScroll(track: HTMLElement): number | null {
    const index = slideIndex(track);
    if (this.target !== null) {
      if (index !== this.target) return null;
      this.target = null;
    }
    return index;
  }
}
