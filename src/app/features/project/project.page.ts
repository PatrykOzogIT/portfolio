import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROJECT_SECTION_KEYS } from '../../../content/model';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { Button } from '../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../shared/ui/external-link/external-link';
import { Icon } from '../../shared/ui/icon/icon';
import type { ProjectPageData } from './project.resolver';

/**
 * Project page. Stage 2: data flow, conditional sections, links and prev/next.
 * Visual design, cover/placeholder art and the gallery arrive in Stage 4.
 */
@Component({
  selector: 'app-project-page',
  imports: [RouterLink, Button, Icon, ExternalLink, NewTabHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project.page.html',
  styleUrl: './project.page.scss',
})
export class ProjectPage {
  /** Bound from the route resolver (`resolve: { page }`). */
  readonly page = input.required<ProjectPageData>();

  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly technologies = inject(SITE_CONTENT).technologies;
  private readonly personName = inject(SITE_CONTENT).site.person.name;

  protected readonly title = computed(() => this.page().meta.title[this.lang()]);
  protected readonly description = computed(() => this.page().meta.shortDescription[this.lang()]);
  /** Only sections with content, in the canonical order. */
  protected readonly sections = computed(() =>
    PROJECT_SECTION_KEYS.flatMap((key) => {
      const html = this.page().sections[key];
      return html ? [{ key, html }] : [];
    }),
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const { meta } = this.page();
      seo.update({
        lang: this.lang(),
        title: `${this.title()} — ${this.personName}`,
        description: this.description(),
        path: `/projects/${meta.slug}`,
        image: meta.coverImage?.src ?? null,
        type: 'article',
      });
    });
  }
}
