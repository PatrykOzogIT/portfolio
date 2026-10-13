import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderMarkdown, splitSections } from './markdown';

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
});
