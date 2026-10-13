import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LANGS, type Lang } from '../../../content/model';
import { SITE_CONTENT } from '../content';

export interface PageSeo {
  readonly lang: Lang;
  readonly title: string;
  readonly description: string;
  /** Path after the language segment: `''` for the home page, `/projects/x` for a project. */
  readonly path: string;
  /** Social image relative to /public; falls back to the site default. */
  readonly image?: string | null;
  readonly type?: 'website' | 'article';
  readonly noindex?: boolean;
  /** Schema.org structured data. */
  readonly jsonLd?: Record<string, unknown> | null;
}

const OG_LOCALES: Record<Lang, string> = { pl: 'pl_PL', en: 'en_US' };
/** Language served to visitors whose language matches neither PL nor EN. */
const X_DEFAULT_LANG: Lang = 'en';

/**
 * Head management: title, description, canonical, hreflang, Open Graph, Twitter Card, JSON-LD.
 * Works during prerendering, so every static page ships complete metadata.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly site = inject(SITE_CONTENT).site;

  update(page: PageSeo): void {
    const { siteUrl } = this.site;
    const absolute = (lang: Lang) => (siteUrl ? `${siteUrl}/${lang}${page.path}` : null);
    const url = absolute(page.lang);
    const imagePath = page.image ?? this.site.ogImage;
    const image = siteUrl && imagePath ? `${siteUrl}/${imagePath.replace(/^\//, '')}` : null;

    this.document.documentElement.lang = page.lang;
    this.title.setTitle(page.title);

    this.setMeta('name', 'description', page.description);
    this.setMeta('name', 'robots', page.noindex ? 'noindex, follow' : null);

    this.setMeta('property', 'og:type', page.type ?? 'website');
    this.setMeta('property', 'og:site_name', this.site.person.name);
    this.setMeta('property', 'og:title', page.title);
    this.setMeta('property', 'og:description', page.description);
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:locale', OG_LOCALES[page.lang]);
    this.setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    this.removeAll('link[data-seo]');
    if (url && !page.noindex) {
      this.addLink({ rel: 'canonical', href: url });
      for (const lang of LANGS)
        this.addLink({ rel: 'alternate', hreflang: lang, href: absolute(lang)! });
      this.addLink({ rel: 'alternate', hreflang: 'x-default', href: absolute(X_DEFAULT_LANG)! });
    }

    this.removeAll('script[data-seo]');
    if (page.jsonLd) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '');
      script.textContent = JSON.stringify(page.jsonLd).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }

  private setMeta(attr: 'name' | 'property', key: string, content: string | null): void {
    const selector = `${attr}="${key}"`;
    if (content === null) this.meta.removeTag(selector);
    else this.meta.updateTag({ [attr]: key, content }, selector);
  }

  private addLink(attrs: Record<string, string>): void {
    const link = this.document.createElement('link');
    for (const [key, value] of Object.entries(attrs)) link.setAttribute(key, value);
    link.setAttribute('data-seo', '');
    this.document.head.appendChild(link);
  }

  private removeAll(selector: string): void {
    this.document.head.querySelectorAll(selector).forEach((el) => el.remove());
  }
}
