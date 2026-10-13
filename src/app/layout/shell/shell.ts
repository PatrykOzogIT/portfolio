import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouteFocus } from '../../core/a11y/route-focus';
import { LangService } from '../../core/i18n/lang.service';
import { ScrollManager } from '../../core/navigation/scroll-manager';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

/** Page frame for every language-prefixed route. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Absolute path + fragment: a bare "#main" would resolve against <base href="/">. -->
    <a class="skip-link" [href]="skipHref()">{{ t().a11y.skipLink }}</a>
    <app-header />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    main {
      flex: 1;
      outline: none;
    }
  `,
})
export class Shell {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly skipHref = computed(() => `${this.langService.url().split('#')[0]}#main`);

  constructor() {
    const destroyRef = inject(DestroyRef);
    inject(RouteFocus).init(destroyRef);
    inject(ScrollManager).init(destroyRef);
    // Anchor scrolling must clear the sticky header.
    inject(ViewportScroller).setOffset(() => [0, 80]);
  }
}
