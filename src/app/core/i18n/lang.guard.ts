import type { CanMatchFn } from '@angular/router';
import { isLang } from './lang-url';

/** Matches the `:lang` route only for supported languages. */
export const langMatchGuard: CanMatchFn = (_route, segments) => isLang(segments[0]?.path);
