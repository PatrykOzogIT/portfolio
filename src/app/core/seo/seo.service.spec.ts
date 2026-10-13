import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SITE_CONTENT_DATA } from '../../../content';
import type { SiteContent } from '../../../content/model';
import { SITE_CONTENT } from '../content';
import { SeoService } from './seo.service';

function setup(siteUrl: string | null) {
  const content: SiteContent = {
    ...SITE_CONTENT_DATA,
    site: { ...SITE_CONTENT_DATA.site, siteUrl },
  };
  TestBed.configureTestingModule({ providers: [{ provide: SITE_CONTENT, useValue: content }] });
  return { seo: TestBed.inject(SeoService), doc: TestBed.inject(DOCUMENT) };
}

const page = { lang: 'en' as const, title: 'T', description: 'D', path: '/projects/x' };

describe('SeoService', () => {
  it('sets title, description and document language', () => {
    const { seo, doc } = setup(null);
    seo.update(page);
    expect(doc.title).toBe('T');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('D');
    expect(doc.documentElement.lang).toBe('en');
  });

  it('adds canonical and hreflang alternates when the site URL is known', () => {
    const { seo, doc } = setup('https://example.com');
    seo.update(page);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.com/en/projects/x',
    );
    const alternates = [...doc.querySelectorAll('link[rel="alternate"]')].map(
      (l) => `${l.getAttribute('hreflang')} ${l.getAttribute('href')}`,
    );
    expect(alternates).toEqual([
      'pl https://example.com/pl/projects/x',
      'en https://example.com/en/projects/x',
      'x-default https://example.com/en/projects/x',
    ]);
  });

  it('omits absolute URLs while the domain is not configured', () => {
    const { seo, doc } = setup(null);
    seo.update(page);
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.querySelector('meta[property="og:url"]')).toBeNull();
  });

  it('marks noindex pages and skips their canonical', () => {
    const { seo, doc } = setup('https://example.com');
    seo.update({ ...page, noindex: true });
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('replaces previous metadata instead of duplicating it', () => {
    const { seo, doc } = setup('https://example.com');
    seo.update({ ...page, jsonLd: { '@type': 'Person' } });
    seo.update({ ...page, path: '' });
    expect(doc.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.querySelectorAll('script[type="application/ld+json"]').length).toBe(0);
  });
});
