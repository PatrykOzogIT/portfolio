import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import sharp from 'sharp';
import { targetWidths, variantPath, type ImageManifest } from '../../src/content/images';

/** An image referenced by content, with the dimensions declared in the content files. */
export interface ImageRef {
  readonly scope: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface PipelineResult {
  readonly manifest: ImageManifest;
  readonly errors: readonly string[];
  readonly generated: number;
  readonly reused: number;
}

/** Formats converted to responsive WebP. Others (e.g. SVG) are served as they are. */
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff']);

const isFresh = async (output: string, sourceMtime: number) =>
  existsSync(output) && (await stat(output)).mtimeMs >= sourceMtime;

/**
 * Converts every referenced raster image to WebP in the configured widths (never upscaled).
 * Incremental: variants newer than their source are reused. Variants no longer referenced are removed.
 * Also verifies that declared width/height match the real file (prevents layout shift and distortion).
 */
export async function processImages(
  refs: readonly ImageRef[],
  publicDir: string,
  outputDir: string,
): Promise<PipelineResult> {
  const manifest: Record<string, number[]> = {};
  const errors: string[] = [];
  const expected = new Set<string>();
  let generated = 0;
  let reused = 0;

  const unique = [...new Map(refs.map((r) => [r.src.replace(/^\/+/, ''), r])).entries()];
  for (const [src, ref] of unique) {
    if (!RASTER.has(extname(src).toLowerCase())) continue;
    const input = join(publicDir, src);
    // Dimensions after EXIF orientation is applied — what the browser will actually display.
    const { info: real } = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    if (real.width !== ref.width || real.height !== ref.height) {
      errors.push(
        `[${ref.scope}] ${src} is ${real.width}×${real.height}, but ${ref.width}×${ref.height} is declared.`,
      );
      continue;
    }

    const sourceMtime = (await stat(input)).mtimeMs;
    const widths = targetWidths(real.width);
    manifest[src] = widths;
    for (const w of widths) {
      const output = join(outputDir, variantPath(src, w));
      expected.add(output);
      if (await isFresh(output, sourceMtime)) {
        reused++;
        continue;
      }
      await mkdir(dirname(output), { recursive: true });
      await sharp(input)
        .rotate()
        .resize({ width: w })
        .webp({ quality: 80, effort: 5 })
        .toFile(output);
      generated++;
    }
  }

  await pruneStale(outputDir, expected);
  return { manifest, errors, generated, reused };
}

async function pruneStale(dir: string, keep: ReadonlySet<string>): Promise<void> {
  if (!existsSync(dir)) return;
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const file = join(entry.parentPath, entry.name);
    if (!keep.has(file)) await rm(file);
  }
}
