import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ExpertiseIcon } from '../../../../../content/model';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { Icon } from '../../../../shared/ui/icon/icon';
import type { IconName } from '../../../../shared/ui/icon/icons';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';

const ICONS: Record<ExpertiseIcon, IconName> = {
  architecture: 'network',
  fullstack: 'code',
  process: 'workflow',
  modernization: 'refresh',
};

@Component({
  selector: 'app-expertise',
  imports: [Icon, SectionHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expertise.html',
  styleUrl: './expertise.scss',
})
export class Expertise {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly areas = inject(SITE_CONTENT).expertise;
  protected readonly icons = ICONS;
  protected readonly caseStudies = this.areas.flatMap((a) => (a.caseStudy ? [a.caseStudy] : []));
}
