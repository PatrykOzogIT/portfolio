import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANGS } from '../../../content/model';
import { LangService } from '../../core/i18n/lang.service';
import { switchLangInUrl } from '../../core/i18n/lang-url';

/**
 * Language switch as real links (crawlable, work without JS, keep the current page).
 */
@Component({
  selector: 'app-lang-switch',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="switch" [attr.aria-label]="t().a11y.languageSwitch">
      @for (option of options(); track option.lang) {
        <a
          class="option mono"
          [routerLink]="option.path"
          [fragment]="option.fragment"
          [attr.hreflang]="option.lang"
          [attr.lang]="option.lang"
          [attr.aria-current]="option.current ? 'true' : null"
          >{{ option.code }}<span class="visually-hidden"> – {{ option.label }}</span></a
        >
      }
    </nav>
  `,
  styles: `
    .switch {
      display: inline-flex;
      gap: 2px;
      padding: 3px;
      border-radius: 10px;
      background: var(--surface-1);
      border: 1px solid var(--border);
    }
    .option {
      display: inline-grid;
      place-items: center;
      min-width: 40px;
      min-height: 36px;
      border-radius: 7px;
      color: var(--text-3);
      font-size: 0.75rem;
      transition:
        background var(--t-base) var(--ease),
        color var(--t-base) var(--ease);

      &:hover {
        color: var(--text);
      }

      &[aria-current='true'] {
        background: var(--surface-3);
        color: var(--text);
      }
    }
  `,
})
export class LangSwitch {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;

  protected readonly options = computed(() => {
    const current = this.langService.lang();
    const url = this.langService.url();
    return LANGS.map((lang) => {
      const [path, fragment] = switchLangInUrl(url, lang).split('#') as [
        string,
        string | undefined,
      ];
      return {
        lang,
        code: lang.toUpperCase(),
        path,
        fragment,
        current: lang === current,
        label: this.t().languages[lang],
      };
    });
  });
}
