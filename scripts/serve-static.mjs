// Static server for checking the production build locally. Mimics the target hosting:
// `/pl/projects/x` → `/pl/projects/x/index.html`, unknown paths → 404 page,
// Brotli/gzip compression for text, long-term caching for fingerprinted assets.
// No dependencies. Usage: node scripts/serve-static.mjs <dir> [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const root = resolve(process.argv[2] ?? 'dist/portfolio/browser');
const port = Number(process.argv[3] ?? 4400);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
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
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.xml', '.txt', '.json']);
/** Angular output hashes (`main-ABCD1234.js`), fonts and generated image variants never change. */
const IMMUTABLE = /(-[A-Za-z0-9_]{8,}\.(js|css)$)|(\.woff2$)|(^img\/)/;

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

  const ext = extname(file);
  const relativePath = file.slice(root.length + 1).replaceAll('\\', '/');
  const headers = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': IMMUTABLE.test(relativePath)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
    Vary: 'Accept-Encoding',
  };
  let body = await readFile(file);
  const accept = String(req.headers['accept-encoding'] ?? '');
  if (COMPRESSIBLE.has(ext)) {
    if (accept.includes('br')) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
      headers['Content-Encoding'] = 'br';
    } else if (accept.includes('gzip')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
  }
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
