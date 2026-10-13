import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONTENT } from '../../core/content';
import { LangService } from '../../core/i18n/lang.service';
import { Button } from '../../shared/ui/button/button';
import { LangSwitch } from '../lang-switch/lang-switch';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { injectNavItems } from '../nav-items';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Button, LangSwitch, MobileNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '[class.is-scrolled]': 'scrolled()' },
})
export class Header {
  protected readonly t = inject(LangService).t;
  protected readonly lang = inject(LangService).lang;
  protected readonly name = inject(SITE_CONTENT).site.person.name;
  protected readonly nav = injectNavItems();
  protected readonly scrolled = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const update = () => this.scrolled.set(window.scrollY > 8);
      update();
      window.addEventListener('scroll', update, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', update));
    });
  }
}
