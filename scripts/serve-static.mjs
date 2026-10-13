// Minimal static server for checking the production build locally — mimics the target hosting:
// `/pl/projects/x` → `/pl/projects/x/index.html`, unknown paths → 404 page. No dependencies.
// Usage: node scripts/serve-static.mjs <dir> [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist/portfolio/browser');
const port = Number(process.argv[3] ?? 4400);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const base = join(root, safe);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, join(base, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  let file = await resolveFile(pathname);
  let status = 200;
  if (!file) {
    status = 404;
    const lang = pathname.startsWith('/en') ? 'en' : 'pl';
    file = await resolveFile(`/${lang}/not-found/index.html`);
  }
  if (!file) return res.writeHead(404).end('Not found');
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
