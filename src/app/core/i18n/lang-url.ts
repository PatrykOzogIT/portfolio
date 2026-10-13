import { DEFAULT_LANG, LANGS, type Lang } from '../../../content/model';

export function isLang(value: string | null | undefined): value is Lang {
  return (LANGS as readonly string[]).includes(value ?? '');
}

/** Language from the first URL segment (`/en/projects/x` → `en`); default language otherwise. */
export function langFromUrl(url: string): Lang {
  const first = url.split(/[?#]/)[0]!.split('/').find(Boolean);
  return isLang(first) ? first : DEFAULT_LANG;
}

/**
 * The same page in another language: swaps the language segment, keeps the path and fragment,
 * drops the query string. `/pl/projects/x#gallery` → `/en/projects/x#gallery`.
 */
export function switchLangInUrl(url: string, lang: Lang): string {
  const hash = url.split('#', 2)[1];
  return `/${[lang, ...pageSegments(url)].join('/')}${hash ? `#${hash}` : ''}`;
}

/**
 * True when navigating between two language versions of the same page
 * (`/pl/projects/x` → `/en/projects/x#gallery`). Used to keep scroll position and focus.
 */
export function isLangSwitch(fromUrl: string, toUrl: string): boolean {
  return (
    langFromUrl(fromUrl) !== langFromUrl(toUrl) &&
    pageSegments(fromUrl).join('/') === pageSegments(toUrl).join('/')
  );
}

/** Path segments without the language prefix, query and fragment. */
function pageSegments(url: string): string[] {
  const segments = url.split(/[?#]/)[0]!.split('/').filter(Boolean);
  if (isLang(segments[0])) segments.shift();
  return segments;
}
