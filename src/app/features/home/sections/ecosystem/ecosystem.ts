import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import type { EcosystemSystemId } from '../../../../../content/model';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { Icon } from '../../../../shared/ui/icon/icon';
import type { IconName } from '../../../../shared/ui/icon/icons';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';

const SYSTEM_ICONS: Record<EcosystemSystemId, IconName> = {
  b2b: 'cart',
  erp: 'layers',
  wms: 'warehouse',
};

const DEFAULT_SYSTEM: EcosystemSystemId = 'erp';

/**
 * Interactive map of the B2B / ERP / WMS ecosystem (WAI-ARIA tabs pattern).
 * The map (systems = tabs), REST band and data-layer links are pure CSS — present in the
 * prerendered HTML without layout work in JS. All panels are rendered (and indexed);
 * only the active one is visible.
 */
@Component({
  selector: 'app-ecosystem',
  imports: [Icon, SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ecosystem.html',
  styleUrl: './ecosystem.scss',
})
export class Ecosystem {
  private readonly langService = inject(LangService);
  private readonly content = inject(SITE_CONTENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;
  protected readonly systems = this.content.ecosystem;
  protected readonly technologies = this.content.technologies;
  protected readonly icons = SYSTEM_ICONS;

  protected readonly active = signal<EcosystemSystemId>(
    this.systems.some((s) => s.id === DEFAULT_SYSTEM) ? DEFAULT_SYSTEM : this.systems[0]!.id,
  );
  protected readonly activeIndex = computed(() =>
    this.systems.findIndex((s) => s.id === this.active()),
  );

  protected select(id: EcosystemSystemId, focus = false): void {
    this.active.set(id);
    if (focus) this.host.querySelector<HTMLElement>(`#eco-tab-${id}`)?.focus();
  }

  /** Arrow keys / Home / End move between systems (automatic activation). */
  protected onKeydown(event: KeyboardEvent): void {
    const last = this.systems.length - 1;
    const i = this.activeIndex();
    const target: Record<string, number> = {
      ArrowRight: i === last ? 0 : i + 1,
      ArrowDown: i === last ? 0 : i + 1,
      ArrowLeft: i === 0 ? last : i - 1,
      ArrowUp: i === 0 ? last : i - 1,
      Home: 0,
      End: last,
    };
    const next = target[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.select(this.systems[next]!.id, true);
  }

  /**
   * Phone switcher (sticky). If the reader is in the middle of a long panel, bring the start
   * of the newly selected panel just below the switcher.
   */
  protected selectFromSwitcher(
    id: EcosystemSystemId,
    switcher: HTMLElement,
    panels: HTMLElement,
  ): void {
    this.select(id);
    const switcherBottom = switcher.getBoundingClientRect().bottom;
    const panelsTop = panels.getBoundingClientRect().top;
    if (panelsTop < switcherBottom) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollBy({
        top: panelsTop - switcherBottom - 12,
        behavior: reduced ? 'auto' : 'smooth',
      });
    }
  }
}
