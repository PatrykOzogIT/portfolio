import type { Lang, ProjectMeta, SiteConfig } from '../../../content/model';
import { TECHNOLOGIES } from '../../../content/technologies';

/**
 * schema.org data for a project page: `SoftwareSourceCode` when the code is public,
 * otherwise a generic `CreativeWork`. Only facts present in the content.
 */
export function projectJsonLd(
  meta: ProjectMeta,
  site: SiteConfig,
  lang: Lang,
): Record<string, unknown> {
  const url = site.siteUrl ? `${site.siteUrl}/${lang}/projects/${meta.slug}` : null;
  return {
    '@context': 'https://schema.org',
    '@type': meta.githubUrl ? 'SoftwareSourceCode' : 'CreativeWork',
    name: meta.title[lang],
    description: meta.shortDescription[lang],
    inLanguage: lang,
    author: { '@type': 'Person', name: site.person.name },
    keywords: meta.technologies.map((id) => TECHNOLOGIES[id].label).join(', '),
    ...(url ? { url } : {}),
    ...(meta.githubUrl ? { codeRepository: meta.githubUrl } : {}),
    ...(meta.status === 'in-development' ? { creativeWorkStatus: 'In development' } : {}),
    ...(site.siteUrl && meta.coverImage ? { image: `${site.siteUrl}/${meta.coverImage.src}` } : {}),
  };
}
