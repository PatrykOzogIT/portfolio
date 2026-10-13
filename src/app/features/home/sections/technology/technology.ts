import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';

@Component({
  selector: 'app-technology',
  imports: [SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-section-heading
        headingId="technology-title"
        [eyebrow]="t().technology.eyebrow"
        [title]="t().technology.title"
        [lead]="t().technology.lead"
      />

      <div class="grid">
        @for (group of groups; track group.id) {
          <section class="card group" [attr.aria-labelledby]="'tech-' + group.id">
            <h3 class="mono group-title" [id]="'tech-' + group.id">{{ group.title[lang()] }}</h3>
            <ul class="chip-list" role="list">
              @for (id of group.technologies; track id) {
                <li class="chip">{{ technologies[id].label }}</li>
              }
            </ul>
            @if (group.note) {
              <p class="group-note">{{ group.note[lang()] }}</p>
            }
          </section>
        }
      </div>

      <p class="ai">{{ t().technology.ai }}</p>
    </div>
  `,
  styleUrl: './technology.scss',
})
export class Technology {
  private readonly langService = inject(LangService);
  private readonly content = inject(SITE_CONTENT);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly groups = this.content.techStack;
  protected readonly technologies = this.content.technologies;
}
