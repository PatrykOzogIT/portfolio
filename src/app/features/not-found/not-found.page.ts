import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container wrap" aria-labelledby="nf-title">
      <p class="mono text-3">404</p>
      <h1 id="nf-title" class="h2">{{ t().notFound.title }}</h1>
      <p class="lead">{{ t().notFound.text }}</p>
      <a appButton variant="primary" [routerLink]="['/', lang()]">
        {{ t().notFound.home }}
        <svg appIcon="arrow-right" class="icon icon--trailing"></svg>
      </a>
    </section>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: var(--space-5);
      padding-block: var(--space-10);
    }
  `,
})
export class NotFoundPage {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;

  constructor() {
    const seo = inject(SeoService);
    effect(() =>
      seo.update({
        lang: this.lang(),
        title: this.t().meta.notFoundTitle,
        description: this.t().notFound.text,
        path: '/not-found',
        noindex: true,
      }),
    );
  }
}
