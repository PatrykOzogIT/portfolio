/**
 * Renders the social preview image (Open Graph, 1200×630) from an HTML template with the site's
 * fonts, colours and module motif, using the Playwright browser. Run after design or photo changes:
 *   npm run og-image
 * Output: public/og/og-image.png (committed — it is a published asset).
 */
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { SITE_CONFIG } from '../src/content/site.config';
import { PUBLIC_DIR, ROOT } from './lib/paths';

const OUTPUT = join(PUBLIC_DIR, 'og/og-image.png');
const font = async (path: string) =>
  `data:font/woff2;base64,${(await readFile(join(ROOT, 'node_modules', path))).toString('base64')}`;

const inter = await font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const interExt = await font('@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2');
const mono = await font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2');
const photo = SITE_CONFIG.photo
  ? `data:image/png;base64,${(await readFile(join(PUBLIC_DIR, SITE_CONFIG.photo.src))).toString('base64')}`
  : null;

// Decorative module clusters (same language as the hero visual).
const clusters = [
  { x: 0, y: 40, c: 3, r: 2 },
  { x: 170, y: 0, c: 3, r: 2 },
  { x: 40, y: 200, c: 4, r: 2 },
  { x: 240, y: 170, c: 2, r: 3 },
];
const lit = new Set(['0-4', '1-1', '2-5', '3-2']);
const modules = clusters
  .flatMap((cl, ci) =>
    Array.from({ length: cl.c * cl.r }, (_, i) => {
      const x = cl.x + 14 + (i % cl.c) * 38;
      const y = cl.y + 14 + Math.floor(i / cl.c) * 38;
      const on = lit.has(`${ci}-${i}`);
      return `<rect x="${x}" y="${y}" width="26" height="26" rx="7" fill="${on ? 'rgba(139,147,255,.28)' : '#171b24'}" stroke="${on ? 'rgba(165,171,255,.8)' : 'rgba(255,255,255,.1)'}"/>`;
    }),
  )
  .join('');
const boxes = clusters
  .map(
    (cl) =>
      `<rect x="${cl.x}" y="${cl.y}" width="${28 + cl.c * 38 - 12}" height="${28 + cl.r * 38 - 12}" rx="14" fill="rgba(255,255,255,.015)" stroke="rgba(255,255,255,.08)" stroke-dasharray="3 5"/>`,
  )
  .join('');

const html = `<!doctype html><html><head><style>
@font-face { font-family: Inter; font-weight: 100 900; src: url(${inter}) format('woff2'); unicode-range: U+0000-00FF; }
@font-face { font-family: Inter; font-weight: 100 900; src: url(${interExt}) format('woff2'); unicode-range: U+0100-02BA; }
@font-face { font-family: Mono; font-weight: 500; src: url(${mono}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0b0d12; color: #e8eaf0; font-family: Inter; }
.glow { position: absolute; width: 900px; height: 900px; right: -260px; top: -320px;
  background: radial-gradient(closest-side, rgba(139,147,255,.16), rgba(92,200,230,.05) 55%, transparent); }
.frame { position: absolute; inset: 28px; border: 1px solid rgba(255,255,255,.08); border-radius: 28px; }
.content { position: absolute; left: 88px; top: 0; bottom: 0; width: 760px; display: flex; flex-direction: column; justify-content: center; }
.eyebrow { font-family: Mono; font-size: 17px; white-space: nowrap; letter-spacing: .08em; color: #a3a9b8; display: flex; align-items: center; gap: 14px; }
.eyebrow::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: #8b93ff; box-shadow: 0 0 0 6px rgba(139,147,255,.15); }
.name { display: flex; align-items: center; gap: 28px; margin-top: 30px; }
.name img { width: 112px; height: 112px; border-radius: 50%; border: 2px solid rgba(255,255,255,.16); box-shadow: 0 0 0 6px rgba(139,147,255,.14); object-fit: cover; }
h1 { font-size: 92px; font-weight: 650; letter-spacing: -.035em; line-height: 1; }
.keys { margin-top: 36px; font-family: Mono; font-size: 20px; white-space: nowrap; letter-spacing: .06em; color: #8a91a1; }
.keys b { color: #a5abff; font-weight: 500; }
svg { position: absolute; right: 48px; top: 150px; }
</style></head><body>
<div class="glow"></div><div class="frame"></div>
<div class="content">
  <p class="eyebrow">SENIOR FULL-STACK DEVELOPER · SOFTWARE ARCHITECTURE</p>
  <div class="name">${photo ? `<img src="${photo}" alt="">` : ''}<h1>${SITE_CONFIG.person.name}</h1></div>
  <p class="keys"><b>ERP</b> · <b>WMS</b> · <b>B2B</b> · ANGULAR · NESTJS · TYPESCRIPT</p>
</div>
<svg width="330" height="330" viewBox="0 0 330 330">${boxes}${modules}</svg>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await mkdir(join(PUBLIC_DIR, 'og'), { recursive: true });
await page.screenshot({ path: OUTPUT, type: 'png' });
await browser.close();
console.log(`✔ Social preview image → ${OUTPUT}`);
