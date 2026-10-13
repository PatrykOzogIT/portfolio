/**
 * Responsive image rules — shared by the build pipeline (scripts/content.ts) and the app's image loader.
 * Every content image is converted at build time to WebP in these widths (never upscaled).
 */

/** Generated widths; also the breakpoints Angular's NgOptimizedImage builds `srcset` from. */
export const IMAGE_WIDTHS = [96, 160, 320, 480, 640, 960, 1280, 1600, 1920] as const;

/** Public URL prefix of generated variants. */
export const IMAGE_BASE = '/img';

/** Widths to generate for an image of the given intrinsic width (the original width replaces larger steps). */
export function targetWidths(originalWidth: number): number[] {
  const widths: number[] = IMAGE_WIDTHS.filter((w) => w < originalWidth);
  if (originalWidth <= IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]!) widths.push(originalWidth);
  return widths;
}

/** `images/photo.png`, 320 → `images/photo.w320.webp` (relative to IMAGE_BASE). */
export function variantPath(src: string, width: number): string {
  return `${src.replace(/^\/+/, '').replace(/\.[^./]+$/, '')}.w${width}.webp`;
}

/** Smallest available width that covers the request; the largest one when nothing does or no width is given. */
export function pickWidth(available: readonly number[], requested?: number): number {
  const sorted = [...available].sort((a, b) => a - b);
  const largest = sorted[sorted.length - 1]!;
  if (!requested) return largest;
  return sorted.find((w) => w >= requested) ?? largest;
}

/** Map of source path (relative to /public) → generated widths. */
export type ImageManifest = Readonly<Record<string, readonly number[]>>;

/** URL for an image at (at least) the requested width; images outside the manifest are served as-is. */
export function imageUrl(manifest: ImageManifest, src: string, width?: number): string {
  const key = src.replace(/^\/+/, '');
  const widths = manifest[key];
  if (!widths?.length) return `/${key}`;
  return `${IMAGE_BASE}/${variantPath(key, pickWidth(widths, width))}`;
}
