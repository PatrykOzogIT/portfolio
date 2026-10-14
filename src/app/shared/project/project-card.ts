import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ProjectMeta } from '../../../content/model';
import type { ProjectCardVariant } from '../../../content/selectors';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { Button } from '../ui/button/button';
import { ExternalLink, NewTabHint } from '../ui/external-link/external-link';
import { Icon } from '../ui/icon/icon';
import { ProjectArt } from './project-art';

/**
 * Project card. The whole card is clickable through the title link (stretched with ::after);
 * GitHub / demo buttons sit above it, so there is one link per destination and no nested links.
 */
@Component({
  selector: 'app-project-card',
  imports: [NgOptimizedImage, RouterLink, Button, Icon, ExternalLink, NewTabHint, ProjectArt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  host: { '[class.wide]': "variant() === 'wide'" },
})
export class ProjectCard {
  readonly project = input.required<ProjectMeta>();
  readonly variant = input<ProjectCardVariant>('standard');
  /** Kind badge — only needed when the section lists projects of different kinds. */
  readonly showKind = input(false);

  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly technologies = inject(SITE_CONTENT).technologies;

  protected readonly title = computed(() => this.project().title[this.lang()]);
  protected readonly link = computed(() => ['/', this.lang(), 'projects', this.project().slug]);
}
