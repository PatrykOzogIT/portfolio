import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const PUBLIC_DIR = join(ROOT, 'public');
export const DIST_BROWSER_DIR = join(ROOT, 'dist/portfolio/browser');
/** Generated responsive image variants (git-ignored, served at /img by angular.json). */
export const IMAGE_CACHE_DIR = join(ROOT, '.image-cache');
