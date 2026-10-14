import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { EcosystemRole } from '../../../../../content/model';
import { LangService } from '../../../../core/i18n/lang.service';

/** "My role" — one block for the whole ecosystem, below the map (rendered only with confirmed facts). */
@Component({
  selector: 'app-ecosystem-role',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ecosystem-role.html',
  styleUrl: './ecosystem-role.scss',
  host: { class: 'role' },
})
export class EcosystemRoleBlock {
  private readonly langService = inject(LangService);
  protected readonly t = this.langService.t;
  protected readonly lang = this.langService.lang;

  readonly role = input.required<EcosystemRole>();
}
