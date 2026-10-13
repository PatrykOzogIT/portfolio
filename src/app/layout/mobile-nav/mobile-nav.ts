import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { Button } from '../../shared/ui/button/button';
import { ExternalLink, NewTabHint } from '../../shared/ui/external-link/external-link';
import { Icon } from '../../shared/ui/icon/icon';
import { injectNavItems } from '../nav-items';

const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Full-screen mobile menu on a native modal <dialog>: focus trap, Escape and inert background
 * come from the platform. Closes on navigation and when the viewport reaches the desktop layout.
 */
@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, Icon, Button, ExternalLink, NewTabHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss',
})
export class MobileNav {
  protected readonly t = inject(LangService).t;
  protected readonly lang = inject(LangService).lang;
  protected readonly site = inject(SITE_CONTENT).site;
  protected readonly nav = injectNavItems();
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    const destroyRef = inject(DestroyRef);
    const sub = inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.close());
    destroyRef.onDestroy(() => sub.unsubscribe());

    afterNextRender(() => {
      const query = window.matchMedia(DESKTOP_QUERY);
      const onChange = (e: MediaQueryListEvent) => e.matches && this.close();
      query.addEventListener('change', onChange);
      destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    });
  }

  protected open(): void {
    this.dialog()?.nativeElement.showModal();
  }

  protected close(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) dialog.close();
  }
}
