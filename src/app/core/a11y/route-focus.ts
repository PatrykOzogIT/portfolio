import { afterNextRender, DestroyRef, DOCUMENT, inject, Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { isLangSwitch } from '../i18n/lang-url';

/**
 * Moves keyboard / screen-reader focus to where the user navigated (an SPA otherwise keeps focus
 * on the clicked link — or, after closing the mobile menu, on the menu button):
 * - to a `#fragment` target (section links),
 * - to the page's <h1> after navigating to a different page.
 * The initial page load is left to the browser; a language switch keeps focus where it is.
 */
@Injectable({ providedIn: 'root' })
export class RouteFocus {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  init(destroyRef: DestroyRef): void {
    let previousUrl: string | null = null;
    const pathOf = (url: string) => url.split(/[?#]/)[0]!;
    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects;
        const fragment = url.split('#', 2)[1];
        const from = previousUrl;
        previousUrl = url;
        // Initial load is left to the browser; after a language switch focus stays on the switch.
        if (from === null || isLangSwitch(from, url)) return;
        const pathChanged = pathOf(url) !== pathOf(from);

        afterNextRender(
          () => {
            const target = fragment
              ? this.document.getElementById(fragment)
              : pathChanged
                ? (this.document.querySelector<HTMLElement>('main h1') ??
                  this.document.querySelector('main'))
                : null;
            if (!target) return;
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            // Scrolling is handled by the router (anchor scrolling / scroll restoration).
            target.focus({ preventScroll: true });
          },
          { injector: this.injector },
        );
      });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
