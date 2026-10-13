import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROJECT_SECTION_KEYS } from '../../../content/model';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { ProjectArt } from '../../shared/project/project-art';
import { Button } from '../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../shared/ui/external-link/external-link';
import { Icon } from '../../shared/ui/icon/icon';
import { Gallery } from './gallery/gallery';
import { projectJsonLd } from './project-json-ld';
import type { ProjectPageData } from './project.resolver';

/**
 * Project page. Every block depends on data: no Markdown section → no heading, no images → no
 * gallery, no URL → no button, a single project → no previous/next navigation.
 */
@Component({
  selector: 'app-project-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    Button,
    Icon,
    ExternalLink,
    NewTabHint,
    ProjectArt,
    Gallery,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project.page.html',
  styleUrl: './project.page.scss',
})
export class ProjectPage {
  /** Bound from the route resolver (`resolve: { page }`). */
  readonly page = input.required<ProjectPageData>();

  private readonly langService = inject(LangService);
  private readonly site = inject(SITE_CONTENT).site;
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly technologies = inject(SITE_CONTENT).technologies;

  protected readonly title = computed(() => this.page().meta.title[this.lang()]);
  protected readonly description = computed(() => this.page().meta.shortDescription[this.lang()]);
  /** Only sections with content, in the canonical order, numbered for the reader. */
  protected readonly sections = computed(() =>
    PROJECT_SECTION_KEYS.flatMap((key) => {
      const html = this.page().sections[key];
      return html ? [{ key, html }] : [];
    }).map((section, i) => ({ ...section, number: String(i + 1).padStart(2, '0') })),
  );
  protected readonly galleryNumber = computed(() =>
    String(this.sections().length + 1).padStart(2, '0'),
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const { meta } = this.page();
      const lang = this.lang();
      seo.update({
        lang,
        title: `${this.title()} — ${this.site.person.name}`,
        description: this.description(),
        path: `/projects/${meta.slug}`,
        image: meta.coverImage?.src ?? null,
        type: 'article',
        jsonLd: projectJsonLd(meta, this.site, lang),
      });
    });
  }
}
