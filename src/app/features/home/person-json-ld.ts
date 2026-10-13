import type { Lang, SiteConfig } from '../../../content/model';

/** schema.org Person for the home page. Only facts present in the configuration. */
export function personJsonLd(site: SiteConfig, lang: Lang): Record<string, unknown> {
  const sameAs = [site.links.github, site.links.linkedin].filter((l): l is string => !!l);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.person.name,
    jobTitle: site.person.jobTitle,
    ...(site.siteUrl ? { url: `${site.siteUrl}/${lang}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: ['Software Architecture', 'Angular', 'NestJS', 'TypeScript', 'ERP', 'WMS', 'B2B'],
  };
}
