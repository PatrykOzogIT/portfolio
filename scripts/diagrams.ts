/**
 * Renders project diagrams to PNG in the site's colours and fonts:
 *
 *   src/content/projects/<slug>/diagrams/<name>.<lang>.mmd   Mermaid (automatic layout)
 *   src/content/projects/<slug>/diagrams/<name>.<lang>.html  hand-laid with diagram.css, where an automatic
 *                                                            layout would draw misleading lines
 *     → public/projects/<slug>/diagram-<name>.<lang>.png
 *
 * Run manually after editing a diagram (`npm run diagrams`); the PNGs are committed and then go through
 * the normal image pipeline (responsive WebP, zoomable in the project page viewer). Rendering needs the
 * Playwright browser, so it is deliberately not part of the build.
 */
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { PUBLIC_DIR, ROOT } from './lib/paths';

const PROJECTS_DIR = join(ROOT, 'src/content/projects');

const require = createRequire(import.meta.url);
const MERMAID = require.resolve('mermaid/dist/mermaid.min.js');
const fontFile = (name: string) => join(ROOT, 'node_modules/@fontsource-variable/inter/files', name);

/** Site tokens (src/styles/_tokens.scss) translated to Mermaid theme variables. */
const THEME = {
  darkMode: true,
  background: '#11141b',
  fontFamily: 'Inter',
  fontSize: '15px',
  primaryColor: '#171b24',
  primaryBorderColor: '#3a4150',
  primaryTextColor: '#e8eaf0',
  secondaryColor: '#171b24',
  tertiaryColor: '#0d1016',
  lineColor: '#8a91a1',
  textColor: '#a3a9b8',
  clusterBkg: '#0d1016',
  clusterBorder: '#2a303d',
  titleColor: '#a3a9b8',
  edgeLabelBackground: '#11141b',
  nodeTextColor: '#e8eaf0',
};

const PADDING = 24;
const SCALE = 2;

interface Source {
  readonly slug: string;
  readonly name: string;
  readonly lang: string;
  readonly file: string;
  readonly dir: string;
  readonly html: boolean;
}

async function sources(): Promise<Source[]> {
  const out: Source[] = [];
  for (const slug of await readdir(PROJECTS_DIR)) {
    const dir = join(PROJECTS_DIR, slug, 'diagrams');
    if (!existsSync(dir)) continue;
    for (const file of await readdir(dir)) {
      const m = /^(.+)\.(pl|en)\.(mmd|html)$/.exec(file);
      if (m) out.push({ slug, name: m[1]!, lang: m[2]!, file: join(dir, file), dir, html: m[3] === 'html' });
    }
  }
  return out;
}

const fontFace = async (file: string, range: string) =>
  `@font-face{font-family:'Inter';font-weight:100 900;font-display:block;unicode-range:${range};` +
  `src:url(data:font/woff2;base64,${(await readFile(fontFile(file))).toString('base64')}) format('woff2');}`;

const list = await sources();
if (!list.length) {
  console.log('No diagrams found.');
  process.exit(0);
}

const css =
  (await fontFace('inter-latin-wght-normal.woff2', 'U+0000-00FF,U+2000-206F,U+2190-21FF,U+2212,U+27F7')) +
  (await fontFace('inter-latin-ext-wght-normal.woff2', 'U+0100-024F,U+1E00-1EFF')) +
  `html,body{margin:0;background:${THEME.background};}#out{display:inline-block;padding:${PADDING}px;background:${THEME.background};}`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: SCALE, viewport: { width: 1600, height: 1200 } });
await page.setContent(
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="out"></div></body></html>`,
);
await page.addScriptTag({ path: MERMAID });
await page.evaluate(async () => {
  // Both subsets (latin and latin-ext for Polish letters) must be ready before labels are measured.
  const sample = 'Aa ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ „”–—';
  for (const weight of ['400', '600']) await document.fonts.load(`${weight} 15px Inter`, sample);
});
await page.evaluate((theme) => {
  // @ts-expect-error mermaid is a page global
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: theme,
    flowchart: {
      curve: 'basis',
      padding: 14,
      nodeSpacing: 36,
      rankSpacing: 44,
      htmlLabels: true,
      wrappingWidth: 340,
    },
    securityLevel: 'strict',
  });
}, THEME);

for (const { slug, name, lang, file, dir, html } of list) {
  const code = await readFile(file, 'utf8');
  if (html) {
    const styles = await readFile(join(dir, 'diagram.css'), 'utf8');
    await page.evaluate(
      ({ code, styles }) => {
        document.getElementById('out')!.innerHTML = `<style>${styles}</style>${code}`;
      },
      { code, styles },
    );
  } else {
    await page.evaluate(
      async ({ code, id }) => {
        // @ts-expect-error mermaid is a page global
        const { svg } = await mermaid.render(id, code);
        const out = document.getElementById('out')!;
        out.innerHTML = svg;
        // Mermaid sizes the SVG to its container (width: 100%); render it at its natural width instead.
        const el = out.querySelector('svg')!;
        el.style.width = el.style.maxWidth;
        el.style.maxWidth = 'none';
      },
      { code, id: `d-${slug}-${name}-${lang}` },
    );
  }
  const outDir = join(PUBLIC_DIR, 'projects', slug);
  await mkdir(outDir, { recursive: true });
  const path = join(outDir, `diagram-${name}.${lang}.png`);
  await page.locator('#out').screenshot({ path });
  const box = (await page.locator('#out').boundingBox())!;
  console.log(
    `✔ ${slug}/diagram-${name}.${lang}.png — ${Math.round(box.width * SCALE)}×${Math.round(box.height * SCALE)}`,
  );
}

await browser.close();
