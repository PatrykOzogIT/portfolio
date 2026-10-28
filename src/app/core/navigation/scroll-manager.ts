import { ViewportScroller } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { NavigationEnd, NavigationSkipped, Router, Scroll } from '@angular/router';
import { isLangSwitch } from '../i18n/lang-url';

const INSTANT: ScrollOptions = { behavior: 'instant' };

/**
 * Scroll behavior after navigation (the router's built-in restoration is disabled in app.config;
 * the router still records positions and emits `Scroll` events once the new view is rendered):
 * - back / forward → restore the saved position,
 * - language switch → keep the current position (same page, other language),
 * - `#fragment` → scroll to that section,
 * - the same page without a fragment (e.g. the brand link from `/pl#contact`) → smooth scroll to top,
 * - any other new page → top, instantly.
 */
/** URL without fragment and query: two URLs with the same path show the same page. */
const pathOf = (url: string) => url.split(/[?#]/)[0];

@Injectable({ providedIn: 'root' })
export class ScrollManager {
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);

  init(destroyRef: DestroyRef): void {
    // Positions are restored here, so the browser must not restore them on its own as well.
    this.scroller.setHistoryScrollRestoration('manual');

    // Decided on NavigationEnd: it is emitted for every navigation, including the initial one
    // (the router emits no Scroll event for the initial navigation while hydrating).
    const langSwitchIds = new Set<number>();
    const samePageIds = new Set<number>();
    let currentUrl: string | null = null;

    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (currentUrl !== null && isLangSwitch(currentUrl, e.urlAfterRedirects)) {
          langSwitchIds.add(e.id);
        }
        if (currentUrl !== null && pathOf(currentUrl) === pathOf(e.urlAfterRedirects)) {
          samePageIds.add(e.id);
        }
        currentUrl = e.urlAfterRedirects;
        return;
      }
      if (!(e instanceof Scroll)) return;
      // A link to the URL already shown is skipped by the router, but still emits Scroll.
      const samePage =
        samePageIds.delete(e.routerEvent.id) || e.routerEvent instanceof NavigationSkipped;

      // Page changes jump instantly (CSS `scroll-behavior: smooth` would animate across the
      // whole new page); in-page section links keep the smooth scroll.
      if (e.position) {
        this.scroller.scrollToPosition(e.position, INSTANT);
      } else if (langSwitchIds.delete(e.routerEvent.id)) {
        // keep position
      } else if (e.anchor) {
        this.scroller.scrollToAnchor(e.anchor);
      } else if (samePage) {
        // Still on the same page: glide back up (CSS scroll-behavior; instant with reduced motion).
        this.scroller.scrollToPosition([0, 0]);
      } else {
        this.scroller.scrollToPosition([0, 0], INSTANT);
      }
    });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
