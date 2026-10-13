import { Marked, type Tokens } from 'marked';

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

const marked = new Marked({
  gfm: true,
  // The page renders section titles as <h2>, so headings inside a section start at <h3>.
  walkTokens(token) {
    if (token.type === 'heading') (token as Tokens.Heading).depth = Math.min(token.depth + 1, 6);
  },
  renderer: {
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

export function renderMarkdown(markdown: string): string {
  return (marked.parse(markdown, { async: false }) as string).trim();
}
