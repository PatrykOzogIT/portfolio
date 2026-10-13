import { computed, inject, Injectable, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { DICTIONARIES, type Dictionary } from '../../../content/i18n';
import type { Lang, Localized } from '../../../content/model';
import { langFromUrl } from './lang-url';

/**
 * Current language, derived from the URL (`/pl/…`, `/en/…`) — the URL is the single source of truth,
 * so prerendered pages, links and the language switch can never disagree.
 */
@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly router = inject(Router);

  /** Current URL (after redirects), including the fragment. */
  readonly url: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly lang: Signal<Lang> = computed(() => langFromUrl(this.url()));

  /** UI dictionary for the current language. Usage in templates: `{{ t().nav.contact }}`. */
  readonly t: Signal<Dictionary> = computed(() => DICTIONARIES[this.lang()]);

  /** Picks the current-language value from localized content. */
  pick<T>(value: Localized<T>): T {
    return value[this.lang()];
  }
}
