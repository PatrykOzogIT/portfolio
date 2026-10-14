import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { projectCardLayout, projectsHeadingKind } from '../../../../../content/selectors';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { ProjectCard } from '../../../../shared/project/project-card';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';

/** Rendered only when at least one project is published (decided by visibleHomeSections). */
@Component({
  selector: 'app-projects',
  imports: [ProjectCard, SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-section-heading
        headingId="projects-title"
        [eyebrow]="t().projects.eyebrow"
        [title]="t().projects.title[headingKind]"
        [lead]="t().projects.lead"
      />
      <ul class="grid" role="list">
        @for (slot of slots; track slot.project.slug) {
          <li [class.wide]="slot.variant === 'wide'">
            <app-project-card
              [project]="slot.project"
              [variant]="slot.variant"
              [showKind]="headingKind === 'mixed'"
            />
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    @use 'breakpoints' as bp;
    :host {
      display: block;
    }
    .grid {
      display: grid;
      gap: var(--space-5);
      margin: var(--space-7) 0 0;
      @include bp.up(lg) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .wide {
      grid-column: 1 / -1;
    }
  `,
})
export class Projects {
  protected readonly t = inject(LangService).t;
  private readonly projects = inject(SITE_CONTENT).projects;
  protected readonly slots = projectCardLayout(this.projects);
  protected readonly headingKind = projectsHeadingKind(this.projects);
}
