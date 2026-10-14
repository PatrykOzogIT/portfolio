import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import type {
  EcosystemPerspective,
  EcosystemPerspectiveId,
  EcosystemSystemId,
} from '../../../../../content/model';
import { hasEcosystemRole, solutionExamples } from '../../../../../content/selectors';
import { SITE_CONTENT } from '../../../../core/content';
import { LangService } from '../../../../core/i18n/lang.service';
import { Icon } from '../../../../shared/ui/icon/icon';
import type { IconName } from '../../../../shared/ui/icon/icons';
import { SectionHeading } from '../../../../shared/ui/section-heading/section-heading';
import { EcosystemRoleBlock } from './ecosystem-role';
import { ExamplesNav } from './examples-nav';

const SYSTEM_ICONS: Record<EcosystemSystemId, IconName> = {
  b2b: 'cart',
  erp: 'layers',
  wms: 'warehouse',
};

const PERSPECTIVE_ICONS: Record<EcosystemPerspectiveId, IconName> = {
  communication: 'refresh',
  data: 'database',
};

/** A system or an architecture perspective — everything that can be selected on the map. */
type ViewId = EcosystemSystemId | EcosystemPerspectiveId;

const DEFAULT_SYSTEM: EcosystemSystemId = 'erp';

/**
 * Interactive map of the B2B / ERP / WMS ecosystem (WAI-ARIA tabs pattern).
 * The map (systems = tabs), REST band and data-layer links are pure CSS — present in the
 * prerendered HTML without layout work in JS. The REST band and the data layer are tabs too
 * (architecture perspectives with their own panels). All panels are rendered (and indexed);
 * only the active one is visible.
 */
@Component({
  selector: 'app-ecosystem',
  imports: [Icon, SectionHeading, NgTemplateOutlet, ExamplesNav, EcosystemRoleBlock],
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
  protected readonly role = this.content.ecosystemRole;
  protected readonly hasRole = hasEcosystemRole(this.role);

  protected readonly perspectives = this.content.ecosystemPerspectives;
  protected readonly perspectiveIcons = PERSPECTIVE_ICONS;
  protected readonly perspective: Partial<Record<EcosystemPerspectiveId, EcosystemPerspective>> =
    Object.fromEntries(this.perspectives.map((p) => [p.id, p]));
  protected readonly examples = solutionExamples(this.content);

  /** Tab order: systems left to right, then the REST band, then the data layer below. */
  private readonly views: readonly ViewId[] = [
    ...this.systems.map((s) => s.id),
    ...(['communication', 'data'] as const).filter((id) => this.perspective[id]),
  ];

  protected readonly active = signal<ViewId>(
    this.systems.some((s) => s.id === DEFAULT_SYSTEM) ? DEFAULT_SYSTEM : this.systems[0]!.id,
  );
  protected readonly activeIndex = computed(() => this.views.indexOf(this.active()));

  protected select(id: ViewId, focus = false): void {
    this.active.set(id);
    if (focus) this.host.querySelector<HTMLElement>(`#eco-tab-${id}`)?.focus();
  }

  /**
   * "Real-world examples" navigation: open the perspective, move focus to its tab on the map
   * (keyboard users continue from there) and bring the panel into view.
   */
  protected showExample(id: string, panels: HTMLElement): void {
    if (!this.views.includes(id as ViewId)) return;
    this.active.set(id as ViewId);
    this.host.querySelector<HTMLElement>(`#eco-tab-${id}`)?.focus({ preventScroll: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panels.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }

  /** Arrow keys / Home / End move between systems and perspectives (automatic activation). */
  protected onKeydown(event: KeyboardEvent): void {
    const last = this.views.length - 1;
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
    this.select(this.views[next]!, true);
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
