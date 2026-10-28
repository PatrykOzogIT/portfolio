import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PROJECT_SECTION_KEYS, type ProjectImage } from '../../../content/model';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { SeoService } from '../../core/seo/seo.service';
import { ProjectArt } from '../../shared/project/project-art';
import { Button } from '../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../shared/ui/external-link/external-link';
import { Icon } from '../../shared/ui/icon/icon';
import { Reveal } from '../../shared/ui/reveal/reveal';
import { Gallery } from './gallery/gallery';
import { Lightbox } from './gallery/lightbox';
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
    Lightbox,
    Reveal,
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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly injector = inject(Injector);

  /**
   * Only sections with content, in the canonical order, numbered for the reader. The HTML is our own
   * Markdown compiled at build time (never user input), so it is trusted: figures keep their
   * lazy-loading and zoom attributes, which the default sanitizer would strip.
   */
  protected readonly sections = computed(() =>
    PROJECT_SECTION_KEYS.flatMap((key) => {
      const html = this.page().sections[key];
      return html ? [{ key, html: this.sanitizer.bypassSecurityTrustHtml(html) }] : [];
    }).map((section, i) => ({ ...section, number: String(i + 1).padStart(2, '0') })),
  );

  /** Sections contain figures → the page needs its own viewer for them. */
  protected readonly hasFigures = computed(() =>
    Object.values(this.page().sections).some((html) => html?.includes('class="figure-zoom"')),
  );

  /** Figures inside the sections, opened in the same full-screen viewer as the gallery. */
  protected readonly figures = signal<readonly ProjectImage[]>([]);
  private readonly figureViewer = viewChild<Lightbox>('figureViewer');

  protected onBodyClick(event: MouseEvent): void {
    const button = (event.target as Element).closest<HTMLElement>('.prose .figure-zoom');
    if (!button) return;
    const all = [...document.querySelectorAll<HTMLElement>('.prose .figure-zoom')];
    this.figures.set(
      all.map((b) => {
        const alt = b.querySelector('img')?.alt ?? '';
        const caption = b.parentElement?.querySelector('figcaption')?.textContent ?? null;
        return {
          src: b.dataset['figure']!,
          width: Number(b.dataset['width']),
          height: Number(b.dataset['height']),
          alt: { pl: alt, en: alt },
          ...(caption ? { caption: { pl: caption, en: caption } } : {}),
        };
      }),
    );
    const index = all.indexOf(button);
    afterNextRender(() => this.figureViewer()?.open(index), { injector: this.injector });
  }
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
