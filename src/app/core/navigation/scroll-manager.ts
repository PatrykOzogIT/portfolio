import { ViewportScroller } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { isLangSwitch } from '../i18n/lang-url';

const INSTANT: ScrollOptions = { behavior: 'instant' };

/**
 * Scroll behavior after navigation (the router's built-in restoration is disabled in app.config;
 * the router still records positions and emits `Scroll` events once the new view is rendered):
 * - back / forward → restore the saved position,
 * - language switch → keep the current position (same page, other language),
 * - `#fragment` → scroll to that section,
 * - any other new page → top.
 */
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
    let currentUrl: string | null = null;

    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (currentUrl !== null && isLangSwitch(currentUrl, e.urlAfterRedirects)) {
          langSwitchIds.add(e.id);
        }
        currentUrl = e.urlAfterRedirects;
        return;
      }
      if (!(e instanceof Scroll)) return;

      // Page changes jump instantly (CSS `scroll-behavior: smooth` would animate across the
      // whole new page); in-page section links keep the smooth scroll.
      if (e.position) {
        this.scroller.scrollToPosition(e.position, INSTANT);
      } else if (langSwitchIds.delete(e.routerEvent.id)) {
        // keep position
      } else if (e.anchor) {
        this.scroller.scrollToAnchor(e.anchor);
      } else {
        this.scroller.scrollToPosition([0, 0], INSTANT);
      }
    });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
