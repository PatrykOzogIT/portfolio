/**
 * Content pipeline (runs before `ng serve`, `ng build` and `ng test`):
 *  1. discovers projects in src/content/projects/<slug>/project.ts,
 *  2. validates metadata, Markdown, referenced files and site configuration,
 *  3. compiles Markdown to HTML and generates src/content/generated/ — for PUBLISHED projects only,
 *     so unpublished content never reaches the bundle,
 *  4. converts referenced images to responsive WebP variants in .image-cache/ (served at /img).
 *
 * Any validation error stops the build.
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  LANGS,
  PROJECT_SECTION_KEYS,
  type ProjectMeta,
  type ProjectSections,
} from '../src/content/model';
import type { ImageManifest } from '../src/content/images';
import { SITE_CONFIG } from '../src/content/site.config';
import { processImages, type ImageRef } from './lib/image-pipeline';
import { renderMarkdown, splitSections } from './lib/markdown';
import { IMAGE_CACHE_DIR, PUBLIC_DIR, ROOT } from './lib/paths';

/**
 * `--fixtures <dir>` (end-to-end tests only): projects come from <dir>/projects and images may also
 * live in <dir>/public. Production content is never mixed with fixtures.
 */
const { values: args } = parseArgs({ options: { fixtures: { type: 'string' } } });
const FIXTURES_DIR = args.fixtures ? join(ROOT, args.fixtures) : null;
const PROJECTS_DIR = FIXTURES_DIR
  ? join(FIXTURES_DIR, 'projects')
  : join(ROOT, 'src/content/projects');
const PUBLIC_DIRS = FIXTURES_DIR ? [PUBLIC_DIR, join(FIXTURES_DIR, 'public')] : [PUBLIC_DIR];
const GENERATED_DIR = join(ROOT, 'src/content/generated');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors: string[] = [];
const fail = (scope: string, message: string) => errors.push(`[${scope}] ${message}`);

function checkPublicFile(scope: string, path: string | undefined | null) {
  if (path && !PUBLIC_DIRS.some((dir) => existsSync(join(dir, path))))
    fail(scope, `File not found in /public: ${path}`);
}

function checkHttpsUrl(scope: string, field: string, url: string | undefined | null) {
  if (url && !/^https:\/\/[^\s]+$/.test(url))
    fail(scope, `${field} must be an https:// URL: ${url}`);
}

/* ------------------------------------------------------------------ site */

function validateSite() {
  const s = SITE_CONFIG;
  if (s.siteUrl !== null && !/^https:\/\/[^/\s]+$/.test(s.siteUrl)) {
    fail('site', `siteUrl must be an https origin without a trailing slash: ${s.siteUrl}`);
  }
  checkHttpsUrl('site', 'links.github', s.links.github);
  checkHttpsUrl('site', 'links.linkedin', s.links.linkedin);
  if (s.email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))
    fail('site', `Invalid email: ${s.email}`);
  for (const lang of LANGS) checkPublicFile('site', s.cv[lang]?.path);
  checkPublicFile('site', s.ogImage);
  if (s.photo) {
    checkPublicFile('site', s.photo.src);
    if (!(s.photo.width > 0 && s.photo.height > 0)) fail('site', 'photo needs width and height.');
    for (const lang of LANGS)
      if (!s.photo.alt[lang]?.trim()) fail('site', `photo needs alt text (${lang}).`);
  }
}

/* -------------------------------------------------------------- projects */

interface DiscoveredProject {
  readonly folder: string;
  readonly meta: ProjectMeta;
}

async function discoverProjects(): Promise<DiscoveredProject[]> {
  if (!existsSync(PROJECTS_DIR)) return [];
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const found: DiscoveredProject[] = [];
  for (const entry of entries.filter((e) => e.isDirectory())) {
    const file = join(PROJECTS_DIR, entry.name, 'project.ts');
    if (!existsSync(file)) {
      fail(entry.name, 'Missing project.ts');
      continue;
    }
    const module = (await import(pathToFileURL(file).href)) as { project?: ProjectMeta };
    if (!module.project) {
      fail(entry.name, 'project.ts must export `const project: ProjectMeta`.');
      continue;
    }
    found.push({ folder: entry.name, meta: module.project });
  }
  return found;
}

function validateProjects(projects: readonly DiscoveredProject[]) {
  const slugs = new Map<string, string>();
  const orders = new Map<number, string>();

  for (const { folder, meta } of projects) {
    const scope = `project:${folder}`;
    if (!SLUG_PATTERN.test(meta.slug))
      fail(scope, `Invalid slug "${meta.slug}" (use lowercase-with-hyphens).`);
    if (meta.slug !== folder) fail(scope, `Slug "${meta.slug}" must match the folder name.`);
    if (slugs.has(meta.slug)) fail(scope, `Duplicate slug, also used by ${slugs.get(meta.slug)}.`);
    if (orders.has(meta.order))
      fail(scope, `Duplicate order ${meta.order}, also used by ${orders.get(meta.order)}.`);
    slugs.set(meta.slug, folder);
    orders.set(meta.order, folder);

    for (const lang of LANGS) {
      if (!meta.title[lang]?.trim()) fail(scope, `Missing title (${lang}).`);
      if (!meta.shortDescription[lang]?.trim()) fail(scope, `Missing shortDescription (${lang}).`);
    }
    checkHttpsUrl(scope, 'githubUrl', meta.githubUrl);
    checkHttpsUrl(scope, 'demoUrl', meta.demoUrl);
    if (meta.accentHue !== undefined && (meta.accentHue < 0 || meta.accentHue > 360)) {
      fail(scope, 'accentHue must be between 0 and 360.');
    }
    for (const image of [meta.coverImage, ...(meta.images ?? [])]) {
      if (!image) continue;
      checkPublicFile(scope, image.src);
      if (!(image.width > 0 && image.height > 0))
        fail(scope, `Image ${image.src} needs width and height.`);
      for (const lang of LANGS)
        if (!image.alt[lang]?.trim()) fail(scope, `Image ${image.src} needs alt text (${lang}).`);
    }
  }
}

async function compileSections(folder: string): Promise<Record<string, ProjectSections> | null> {
  const scope = `project:${folder}`;
  const files = LANGS.map((lang) => ({ lang, path: join(PROJECTS_DIR, folder, `${lang}.md`) }));
  const present = files.filter((f) => existsSync(f.path));
  if (present.length === 0) return null;
  if (present.length !== files.length) {
    fail(scope, `Markdown must exist for every language (${LANGS.join(', ')}) or for none.`);
    return null;
  }

  const result: Record<string, ProjectSections> = {};
  const keySets: string[] = [];
  for (const { lang, path } of files) {
    const { sections, errors: sectionErrors } = splitSections(
      await readFile(path, 'utf8'),
      PROJECT_SECTION_KEYS,
    );
    sectionErrors.forEach((e) => fail(`${scope}/${lang}.md`, e));
    keySets.push([...sections.keys()].sort().join(','));
    result[lang] = Object.fromEntries([...sections].map(([key, md]) => [key, renderMarkdown(md)]));
  }
  if (new Set(keySets).size > 1)
    fail(scope, 'Every language must contain the same set of sections.');
  return result;
}

/* -------------------------------------------------------------- generate */

const BANNER = '// GENERATED by scripts/content.ts — do not edit. Run `npm run content`.\n';

async function generate(
  published: readonly DiscoveredProject[],
  sections: Map<string, Record<string, ProjectSections>>,
  images: ImageManifest,
) {
  await rm(GENERATED_DIR, { recursive: true, force: true });
  await mkdir(join(GENERATED_DIR, 'sections'), { recursive: true });

  await writeFile(
    join(GENERATED_DIR, 'images.ts'),
    `${BANNER}import type { ImageManifest } from '../images';\n\n/** Source image → generated WebP widths. */\nexport const IMAGE_MANIFEST: ImageManifest = ${JSON.stringify(images, null, 2)};\n`,
  );

  const imports = published.map(
    ({ folder }, i) =>
      `import { project as p${i} } from '${relative(
        GENERATED_DIR,
        join(PROJECTS_DIR, folder, 'project'),
      )
        .split(sep)
        .join('/')}';`,
  );
  const loaderEntries: string[] = [];
  for (const [slug, byLang] of sections) {
    for (const [lang, content] of Object.entries(byLang)) {
      await writeFile(
        join(GENERATED_DIR, 'sections', `${slug}.${lang}.ts`),
        `${BANNER}import type { ProjectSections } from '../../model';\n\nexport const sections: ProjectSections = ${JSON.stringify(content, null, 2)};\n`,
      );
    }
    const loaders = Object.keys(byLang).map(
      (lang) => `${lang}: () => import('./sections/${slug}.${lang}').then((m) => m.sections)`,
    );
    loaderEntries.push(`  '${slug}': { ${loaders.join(', ')} },`);
  }

  await writeFile(
    join(GENERATED_DIR, 'projects.ts'),
    `${BANNER}import type { Localized, ProjectMeta, ProjectSectionsLoader } from '../model';
${imports.join('\n')}

/** Published projects only. */
export const PUBLISHED_PROJECTS: readonly ProjectMeta[] = [${published.map((_, i) => `p${i}`).join(', ')}];

/** Lazy loaders of compiled long-form sections (one chunk per project and language). */
export const PROJECT_SECTIONS: Readonly<Record<string, Localized<ProjectSectionsLoader>>> = {
${loaderEntries.join('\n')}
};
`,
  );
}

/* ------------------------------------------------------------------ main */

validateSite();
const projects = await discoverProjects();
validateProjects(projects);

const published = projects
  .filter((p) => p.meta.published)
  .sort((a, b) => a.meta.order - b.meta.order);
const sections = new Map<string, Record<string, ProjectSections>>();
for (const { folder, meta } of published) {
  const compiled = await compileSections(folder);
  if (compiled) sections.set(meta.slug, compiled);
}

function exitOnErrors() {
  if (!errors.length) return;
  console.error(
    `\n✖ Content validation failed (${errors.length}):\n${errors.map((e) => `  • ${e}`).join('\n')}\n`,
  );
  process.exit(1);
}

exitOnErrors();

// Images of the site and of PUBLISHED projects only (unpublished images are never processed or shipped).
const imageRefs: ImageRef[] = [
  ...(SITE_CONFIG.photo ? [{ scope: 'site', ...SITE_CONFIG.photo }] : []),
  ...published.flatMap(({ folder, meta }) =>
    [meta.coverImage, ...(meta.images ?? [])]
      .filter((img) => img !== undefined)
      .map((img) => ({ scope: `project:${folder}`, ...img })),
  ),
];
const images = await processImages(imageRefs, PUBLIC_DIRS, IMAGE_CACHE_DIR);
errors.push(...images.errors);
exitOnErrors();

await generate(published, sections, images.manifest);
console.log(
  `✔ Content OK — ${published.length} published / ${projects.length} total project(s). Generated ${relative(ROOT, GENERATED_DIR)}.`,
);
console.log(
  `✔ Images — ${Object.keys(images.manifest).length} source(s), ${images.generated} variant(s) generated, ${images.reused} reused.`,
);
if (SITE_CONFIG.siteUrl === null) {
  console.warn(
    '⚠ siteUrl is not set — canonical URLs, Open Graph URLs and sitemap.xml will be omitted.',
  );
}
