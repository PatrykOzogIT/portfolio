import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { contactChannels } from '../../../../../content/selectors';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { Button } from '../../../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../../../shared/ui/external-link/external-link';
import { Icon } from '../../../../shared/ui/icon/icon';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';

type CopyState = 'idle' | 'copied' | 'failed';

/** Every channel is optional: an unset value in site.config.ts simply hides it. */
@Component({
  selector: 'app-contact',
  imports: [NgOptimizedImage, Button, Icon, ExternalLink, NewTabHint, SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  private readonly site = inject(SITE_CONTENT).site;
  protected readonly channels = contactChannels(this.site);
  protected readonly photo = this.site.photo;
  protected readonly copyState = signal<CopyState>('idle');

  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected async copyEmail(): Promise<void> {
    const email = this.channels.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      this.copyState.set('copied');
    } catch {
      this.copyState.set('failed');
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copyState.set('idle'), 2500);
  }
}
