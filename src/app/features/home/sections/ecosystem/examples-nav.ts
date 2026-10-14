import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SolutionExample } from '../../../../../content/selectors';
import { LangService } from '../../../../core/i18n/lang.service';
import { Icon } from '../../../../shared/ui/icon/icon';

/**
 * "Real-world examples": a small, always-visible way into the examples. Perspectives open a panel on the
 * map (handled by the parent); case studies are anchors in the Expertise section.
 */
@Component({
  selector: 'app-examples-nav',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (examples().length) {
      <nav class="examples" aria-labelledby="eco-examples-title">
        <h3 id="eco-examples-title" class="examples-title mono">{{ t().caseStudy.examples }}</h3>
        <ul role="list">
          @for (example of examples(); track example.id) {
            <li>
              @if (example.kind === 'perspective') {
                <button
                  type="button"
                  class="example"
                  [attr.aria-controls]="'eco-panel-' + example.id"
                  (click)="openPerspective.emit(example.id)"
                >
                  {{ example.navLabel[lang()] }}
                  <svg appIcon="arrow-right" class="icon"></svg>
                </button>
              } @else {
                <a class="example" [routerLink]="['/', lang()]" [fragment]="example.id">
                  {{ example.navLabel[lang()] }}
                  <svg appIcon="arrow-right" class="icon"></svg>
                </a>
              }
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styleUrl: './examples-nav.scss',
})
export class ExamplesNav {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;

  readonly examples = input.required<readonly SolutionExample[]>();
  readonly openPerspective = output<string>();
}
