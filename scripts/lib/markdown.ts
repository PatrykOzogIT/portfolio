import { Marked, type Token, type Tokens } from 'marked';
import { IMAGE_BASE, pickWidth, variantPath } from '../../src/content/images';

export interface SplitResult {
  readonly sections: ReadonlyMap<string, string>;
  readonly errors: readonly string[];
}

/**
 * Splits a project Markdown file into sections delimited by top-level `# key` headings.
 * Headings inside fenced code blocks are ignored.
 */
export function splitSections(markdown: string, allowedKeys: readonly string[]): SplitResult {
  const sections = new Map<string, string>();
  const seen = new Set<string>();
  const errors: string[] = [];
  let currentKey: string | null = null;
  let skipping = false; // inside an invalid section — already reported
  let buffer: string[] = [];
  let fence: string | null = null;

  const flush = () => {
    if (skipping) {
      // nothing to do
    } else if (currentKey === null) {
      if (buffer.join('').trim()) errors.push('Text before the first "# section" heading.');
    } else if (!buffer.join('').trim()) {
      errors.push(`Section "${currentKey}" is empty.`);
    } else {
      sections.set(currentKey, buffer.join('\n').trim());
    }
    buffer = [];
  };

  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fenceMatch)
      fence = fence === null ? fenceMatch[1]! : fence === fenceMatch[1] ? null : fence;

    const heading = fence === null ? /^#\s+(.+?)\s*$/.exec(line) : null;
    if (!heading) {
      buffer.push(line);
      continue;
    }
    flush();
    const key = heading[1]!;
    skipping = true;
    if (!allowedKeys.includes(key)) {
      errors.push(`Unknown section "${key}". Allowed: ${allowedKeys.join(', ')}.`);
    } else if (seen.has(key)) {
      errors.push(`Duplicate section "${key}".`);
    } else {
      seen.add(key);
      currentKey = key;
      skipping = false;
    }
  }
  flush();
  return { sections, errors };
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A figure image as the build knows it: real size and the generated WebP widths (empty = served as-is). */
export interface FigureImage {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
}

export interface RenderOptions {
  /** Resolves an image path (relative to /public) to its size and variants; null = unknown image. */
  readonly figure?: (src: string) => FigureImage | null;
  /** Accessible name prefix of the zoom button, e.g. "Enlarge image". */
  readonly zoomLabel?: string;
}

/** Prose column width — figures never render wider. */
const FIGURE_SIZES = '(min-width: 840px) 760px, calc(100vw - 32px)';

let options: RenderOptions = {};

/**
 * A standalone image paragraph becomes a figure: responsive WebP, explicit size (no layout shift),
 * lazy loading, a caption from the image title, and a zoom button that opens the page viewer.
 */
function figure(src: string, alt: string, caption: string | null): string {
  const key = src.replace(/^\/+/, '');
  const image = options.figure?.(key);
  if (!image) throw new Error(`Figure image not found: ${key}`);
  const url = (w: number) => `${IMAGE_BASE}/${variantPath(key, w)}`;
  const img = image.widths.length
    ? `<img src="${url(pickWidth(image.widths, 960))}" srcset="${image.widths.map((w) => `${url(w)} ${w}w`).join(', ')}" sizes="${FIGURE_SIZES}"`
    : `<img src="/${escapeAttr(key)}"`;
  const label = options.zoomLabel ? `${options.zoomLabel}: ${alt}` : alt;
  return (
    `<figure class="figure"><button type="button" class="figure-zoom" data-figure="${escapeAttr(key)}" ` +
    `data-width="${image.width}" data-height="${image.height}" aria-label="${escapeAttr(label)}">` +
    `${img} width="${image.width}" height="${image.height}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async"></button>` +
    (caption ? `<figcaption>${escapeText(caption)}</figcaption>` : '') +
    `</figure>`
  );
}

const isFigureParagraph = (tokens: readonly Token[]) =>
  tokens.length === 1 && tokens[0]!.type === 'image';

/** Images used as figures in a Markdown text (standalone image paragraphs), in order. */
export function figureSources(markdown: string): { src: string; alt: string }[] {
  const out: { src: string; alt: string }[] = [];
  for (const token of new Marked({ gfm: true }).lexer(markdown)) {
    if (token.type === 'paragraph' && isFigureParagraph((token as Tokens.Paragraph).tokens)) {
      const image = (token as Tokens.Paragraph).tokens[0] as Tokens.Image;
      out.push({ src: image.href.replace(/^\/+/, ''), alt: image.text });
    }
  }
  return out;
}

const marked = new Marked({
  gfm: true,
  // The page renders section titles as <h2>, so headings inside a section start at <h3>.
  walkTokens(token) {
    if (token.type === 'heading') (token as Tokens.Heading).depth = Math.min(token.depth + 1, 6);
  },
  renderer: {
    paragraph({ tokens }: Tokens.Paragraph) {
      if (isFigureParagraph(tokens)) {
        const image = tokens[0] as Tokens.Image;
        return figure(image.href, image.text, image.title ?? null);
      }
      return `<p>${this.parser.parseInline(tokens)}</p>\n`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      const attrs = [
        `href="${escapeAttr(href)}"`,
        title ? `title="${escapeAttr(title)}"` : '',
        external ? 'target="_blank" rel="noopener noreferrer"' : '',
      ].filter(Boolean);
      return `<a ${attrs.join(' ')}>${text}</a>`;
    },
  },
});

export function renderMarkdown(markdown: string, renderOptions: RenderOptions = {}): string {
  options = renderOptions;
  try {
    return (marked.parse(markdown, { async: false }) as string).trim();
  } finally {
    options = {};
  }
}
