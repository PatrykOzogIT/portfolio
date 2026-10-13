import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { contactChannels } from '../../../../../content/selectors';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { Button } from '../../../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../../../shared/ui/external-link/external-link';
import { Icon } from '../../../../shared/ui/icon/icon';
import { HeroVisual } from './hero-visual';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, RouterLink, Button, Icon, ExternalLink, NewTabHint, HeroVisual],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  /** Section ids rendered on the page — CTAs only point to sections that exist. */
  readonly sections = input.required<readonly string[]>();

  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly site = inject(SITE_CONTENT).site;
  protected readonly hasCv = contactChannels(this.site).cv.length > 0;
}
