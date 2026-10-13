/**
 * Post-build step: generates sitemap.xml and robots.txt from the PRERENDERED pages.
 * The sitemap therefore always matches what was actually built — unpublished projects
 * do not exist in the output, so they cannot leak into it.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_CONFIG } from '../src/content/site.config';
import { DIST_BROWSER_DIR as DEFAULT_DIST } from './lib/paths';

/** Optional first argument: another build output (e.g. the end-to-end test build). */
const DIST_BROWSER_DIR = process.argv[2] ? join(process.cwd(), process.argv[2]) : DEFAULT_DIST;

interface PageEntry {
  readonly loc: string;
  readonly alternates: readonly { hreflang: string; href: string }[];
}

async function findIndexFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await findIndexFiles(full)));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

function attr(tag: string, name: string): string | null {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

function parsePage(html: string): PageEntry | null {
  const tags = html.match(/<(?:link|meta)\b[^>]*>/g) ?? [];
  const robots = tags.find((t) => attr(t, 'name') === 'robots');
  if (robots && /noindex/.test(attr(robots, 'content') ?? '')) return null;

  const canonical = tags.find((t) => attr(t, 'rel') === 'canonical');
  const loc = canonical ? attr(canonical, 'href') : null;
  if (!loc) return null;

  const alternates = tags
    .filter((t) => attr(t, 'rel') === 'alternate' && attr(t, 'hreflang'))
    .map((t) => ({ hreflang: attr(t, 'hreflang')!, href: attr(t, 'href')! }));
  return { loc, alternates };
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function sitemapXml(pages: readonly PageEntry[]): string {
  const urls = pages
    .map((p) => {
      const links = p.alternates
        .map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(a.href)}"/>`,
        )
        .join('\n');
      return `  <url>\n    <loc>${xmlEscape(p.loc)}</loc>\n${links}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

if (!existsSync(DIST_BROWSER_DIR)) {
  console.error(`✖ Build output not found: ${DIST_BROWSER_DIR}`);
  process.exit(1);
}

const robots = ['User-agent: *', 'Allow: /'];

if (SITE_CONFIG.siteUrl === null) {
  console.warn('⚠ siteUrl is not set — sitemap.xml skipped.');
} else {
  const pages: PageEntry[] = [];
  for (const file of await findIndexFiles(DIST_BROWSER_DIR)) {
    const page = parsePage(await readFile(file, 'utf8'));
    if (page) pages.push(page);
  }
  pages.sort((a, b) => a.loc.localeCompare(b.loc));
  await writeFile(join(DIST_BROWSER_DIR, 'sitemap.xml'), sitemapXml(pages));
  robots.push('', `Sitemap: ${SITE_CONFIG.siteUrl}/sitemap.xml`);
  console.log(`✔ sitemap.xml — ${pages.length} page(s).`);
}

await writeFile(join(DIST_BROWSER_DIR, 'robots.txt'), `${robots.join('\n')}\n`);
console.log('✔ robots.txt');
