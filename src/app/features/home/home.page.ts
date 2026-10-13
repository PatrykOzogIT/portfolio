import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
} from '@angular/core';
import { visibleHomeSections } from '../../../content/selectors';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { SectionSpy } from '../../core/navigation/section-spy';
import { SeoService } from '../../core/seo/seo.service';
import { Reveal } from '../../shared/ui/reveal/reveal';
import { personJsonLd } from './person-json-ld';
import { Contact } from './sections/contact/contact';
import { Ecosystem } from './sections/ecosystem/ecosystem';
import { Expertise } from './sections/expertise/expertise';
import { Hero } from './sections/hero/hero';
import { Projects } from './sections/projects/projects';
import { Technology } from './sections/technology/technology';

/**
 * Home page: hero + the sections that have content, in the order given by `visibleHomeSections`
 * (the same list drives the navigation, so a hidden section never leaves a dead menu link).
 */
@Component({
  selector: 'app-home-page',
  imports: [Reveal, Hero, Expertise, Ecosystem, Technology, Projects, Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero [sections]="sections" />

    @for (id of sections; track id) {
      <section appReveal class="section" [id]="id" [attr.aria-labelledby]="id + '-title'">
        @switch (id) {
          @case ('expertise') {
            <app-expertise />
          }
          @case ('ecosystem') {
            <app-ecosystem />
          }
          @case ('technology') {
            <app-technology />
          }
          @case ('projects') {
            <app-projects />
          }
          @case ('contact') {
            <app-contact />
          }
        }
      </section>
    }
  `,
})
export class HomePage {
  private readonly langService = inject(LangService);
  private readonly content = inject(SITE_CONTENT);
  protected readonly t = this.langService.t;
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
        jsonLd: personJsonLd(this.content.site, lang),
      });
    });

    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const spy = inject(SectionSpy);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() =>
      spy.observe([...host.querySelectorAll<HTMLElement>('app-hero, section[id]')], destroyRef),
    );
  }
}
