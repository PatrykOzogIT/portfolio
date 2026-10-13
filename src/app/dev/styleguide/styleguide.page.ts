import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';
import { ICONS, type IconName } from '../../shared/ui/icon/icons';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';

/**
 * Living design-system reference. DEV ONLY — the route is removed from production builds.
 */
@Component({
  selector: 'app-styleguide-page',
  imports: [Button, Icon, SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './styleguide.page.html',
  styleUrl: './styleguide.page.scss',
})
export class StyleguidePage {
  protected readonly surfaces = ['--bg', '--surface-1', '--surface-2', '--surface-3'];
  protected readonly texts = ['--text', '--text-2', '--text-3'];
  protected readonly accents = [
    '--accent',
    '--accent-strong',
    '--success',
    '--sys-b2b',
    '--sys-erp',
    '--sys-wms',
  ];
  protected readonly spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  protected readonly icons = Object.keys(ICONS) as IconName[];

  constructor() {
    inject(SeoService).update({
      lang: 'en',
      title: 'Design system',
      description: 'Design system reference (development only).',
      path: '/_styleguide',
      noindex: true,
    });
  }
}
