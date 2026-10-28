import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { figureSources, renderMarkdown, splitSections } from './markdown';

const KEYS = ['about', 'features'];

describe('splitSections', () => {
  it('splits by top-level headings', () => {
    const { sections, errors } = splitSections('# about\nHello\n\n# features\n- a\n- b\n', KEYS);
    assert.deepEqual(errors, []);
    assert.equal(sections.get('about'), 'Hello');
    assert.equal(sections.get('features'), '- a\n- b');
  });

  it('keeps sub-headings and ignores "#" inside code fences', () => {
    const md = '# about\n## Sub\ntext\n```bash\n# not a section\n```\n';
    const { sections, errors } = splitSections(md, KEYS);
    assert.deepEqual(errors, []);
    assert.match(sections.get('about')!, /# not a section/);
  });

  it('reports unknown, duplicate and empty sections and stray text', () => {
    const { errors } = splitSections('intro\n# about\n# about\nx\n# nope\ny', KEYS);
    assert.equal(errors.length, 4);
  });

  it('accepts Windows line endings', () => {
    const { sections } = splitSections('# about\r\nHello\r\n', KEYS);
    assert.equal(sections.get('about'), 'Hello');
  });
});

describe('renderMarkdown', () => {
  it('shifts headings one level down', () => {
    assert.equal(renderMarkdown('## Title'), '<h3>Title</h3>');
  });

  it('opens external links in a new tab safely', () => {
    assert.equal(
      renderMarkdown('[x](https://example.com)'),
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a></p>',
    );
  });

  it('turns a standalone image into a zoomable figure with responsive variants and a caption', () => {
    const html = renderMarkdown('![Alt text](projects/x/a.png "The caption")', {
      figure: () => ({ width: 1440, height: 900, widths: [320, 960, 1440] }),
      zoomLabel: 'Enlarge',
    });
    const has = (part: string) => assert.ok(html.includes(part), `missing: ${part}`);
    assert.ok(html.startsWith('<figure class="figure"><button type="button" class="figure-zoom"'));
    has('data-figure="projects/x/a.png" data-width="1440" data-height="900"');
    has('aria-label="Enlarge: Alt text"');
    has('src="/img/projects/x/a.w960.webp"');
    has('srcset="/img/projects/x/a.w320.webp 320w, /img/projects/x/a.w960.webp 960w, ');
    has('width="1440" height="900" alt="Alt text" loading="lazy" decoding="async"');
    assert.ok(html.endsWith('<figcaption>The caption</figcaption></figure>'));
    assert.ok(!html.includes('<p>'), 'a figure is not wrapped in a paragraph');
  });

  it('fails on an unknown figure image instead of rendering a broken one', () => {
    assert.throws(
      () => renderMarkdown('![Alt](missing.png)', { figure: () => null }),
      /missing.png/,
    );
  });

  it('lists figures only for images standing alone in a paragraph', () => {
    const md = '![A](a.png)\n\nText with ![B](b.png) inline.';
    assert.deepEqual(figureSources(md), [{ src: 'a.png', alt: 'A' }]);
  });
});
