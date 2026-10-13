import { isLang, isLangSwitch, langFromUrl, switchLangInUrl } from './lang-url';

describe('lang-url', () => {
  it('recognises supported languages only', () => {
    expect(isLang('pl')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('de')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('reads the language from the first segment', () => {
    expect(langFromUrl('/en/projects/x')).toBe('en');
    expect(langFromUrl('/en#contact')).toBe('en');
    expect(langFromUrl('/pl?x=1')).toBe('pl');
  });

  it('falls back to the default language', () => {
    expect(langFromUrl('/')).toBe('pl');
    expect(langFromUrl('/_styleguide')).toBe('pl');
  });

  it('keeps the page and fragment when switching language', () => {
    expect(switchLangInUrl('/pl/projects/wms-demo', 'en')).toBe('/en/projects/wms-demo');
    expect(switchLangInUrl('/pl#ecosystem', 'en')).toBe('/en#ecosystem');
    expect(switchLangInUrl('/en/projects/x?ref=1', 'pl')).toBe('/pl/projects/x');
  });

  it('adds the language to language-less URLs', () => {
    expect(switchLangInUrl('/', 'en')).toBe('/en');
  });

  it('detects a switch between language versions of the same page', () => {
    expect(isLangSwitch('/pl', '/en')).toBe(true);
    expect(isLangSwitch('/pl/projects/x', '/en/projects/x#gallery')).toBe(true);
    expect(isLangSwitch('/pl#ecosystem', '/en')).toBe(true);
  });

  it('does not treat other navigations as a language switch', () => {
    expect(isLangSwitch('/pl', '/pl#ecosystem')).toBe(false);
    expect(isLangSwitch('/pl/projects/x', '/en/projects/y')).toBe(false);
    expect(isLangSwitch('/pl/projects/x', '/pl/projects/y')).toBe(false);
  });
});
