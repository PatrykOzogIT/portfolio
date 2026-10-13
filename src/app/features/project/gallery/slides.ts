/** Helpers for horizontal scroll-snap slide tracks (one slide = full track width). */

export function slideIndex(track: HTMLElement): number {
  return track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0;
}

export function scrollToSlide(
  track: HTMLElement,
  index: number,
  behavior: ScrollBehavior = 'smooth',
): void {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  track.scrollTo({ left: index * track.clientWidth, behavior: reduced ? 'instant' : behavior });
}
