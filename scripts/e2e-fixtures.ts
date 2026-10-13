/**
 * Generates the image files used by the end-to-end fixture projects (e2e/fixtures/public).
 * Kept out of git: placeholder graphics are produced on demand instead of committed as binaries.
 */
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib/paths';

const OUT = join(ROOT, 'e2e/fixtures/public');

const images: [path: string, width: number, height: number, label: string, hue: number][] = [
  ['projects/alpha/cover.png', 1600, 1000, 'ALPHA COVER', 230],
  ['projects/alpha/1.png', 1600, 900, 'ALPHA 1', 190],
  ['projects/gamma/1.png', 1920, 1080, 'GAMMA 1', 230],
  ['projects/gamma/2.png', 720, 1480, 'GAMMA 2', 150],
  ['projects/gamma/3.png', 1200, 1200, 'GAMMA 3', 36],
];

const svg = (w: number, h: number, label: string, hue: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<rect width="100%" height="100%" fill="hsl(${hue} 30% 22%)"/>` +
      `<text x="50%" y="50%" font-family="monospace" font-size="${Math.round(Math.min(w, h) / 10)}" ` +
      `fill="hsl(${hue} 60% 85%)" text-anchor="middle">${label}</text></svg>`,
  );

for (const [path, w, h, label, hue] of images) {
  const file = join(OUT, path);
  if (existsSync(file)) continue;
  await mkdir(dirname(file), { recursive: true });
  await sharp(svg(w, h, label, hue))
    .png()
    .toFile(file);
}
console.log(`✔ E2E fixture images ready in ${OUT}`);
