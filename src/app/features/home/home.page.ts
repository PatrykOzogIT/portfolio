import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { visibleHomeSections } from '../../../content/selectors';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { personJsonLd } from './person-json-ld';

/**
 * Home page. Stage 2: hero text + section skeleton driven by `visibleHomeSections`.
 * Section content arrives in Stage 3.
 */
@Component({
  selector: 'app-home-page',
  imports: [SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly langService = inject(LangService);
  private readonly content = inject(SITE_CONTENT);
  protected readonly t = this.langService.t;
  protected readonly site = this.content.site;
  protected readonly sections = visibleHomeSections(this.content);

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const lang = this.langService.lang();
      seo.update({
        lang,
        title: this.t().meta.homeTitle,
        description: this.t().meta.homeDescription,
        path: '',
        jsonLd: personJsonLd(this.site, lang),
      });
    });
  }
}
