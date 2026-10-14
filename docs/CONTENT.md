# Managing content

All content lives in `src/content/`. Changing it never requires touching components.
After a change: `npm run build` (or `npm run content` while the dev server is running).

The content pipeline (`scripts/content.ts`) **validates everything before every build** and stops
with a clear message when something is wrong (missing translation, missing file, duplicate order…).

## Contact data, CV, domain — `src/content/site.config.ts`

Every value set to `null` hides the related element automatically.

```ts
siteUrl: 'https://example.com',            // enables canonical URLs, Open Graph URLs and sitemap.xml
links: { github: 'https://github.com/…', linkedin: 'https://www.linkedin.com/in/…' },
email: 'name@example.com',
cv: {
  pl: { path: 'cv/patryk-ozog-cv-pl.pdf' }, // file in /public/cv/
  en: { path: 'cv/patryk-ozog-cv-en.pdf' },
},
ogImage: 'og/default.png',                  // 1200×630, in /public/og/
photo: {                                    // portrait: hero (next to the name) + contact section
  src: 'images/patryk-ozog.jpg',            // square, ≥ 800×800, neutral / dark background
  width: 800, height: 800,
  alt: { pl: '…', en: '…' },
},
```

## Projects — `src/content/projects/<slug>/`

```
src/content/projects/wms-demo/
  project.ts   metadata (required)
  pl.md        long-form text, Polish   (optional — but if present, en.md must exist too)
  en.md        long-form text, English
public/projects/wms-demo/
  cover.png    images (optional)
```

### `project.ts`

```ts
import type { ProjectMeta } from '../../model';

export const project: ProjectMeta = {
  slug: 'wms-demo',          // = folder name = URL: /pl/projects/wms-demo
  order: 1,                  // display order, unique
  published: false,          // true = built, listed, routed, in sitemap. false = does not exist publicly
  kind: 'demo',              // 'personal' (own product / side project) or 'demo' (built to demonstrate)
  status: 'in-development',  // optional — "In development" badge; omit when the project is finished
  featured: false,           // wide card; never changes the order
  title: { pl: '…', en: '…' },
  shortDescription: { pl: '…', en: '…' },
  technologies: ['angular', 'nestjs', 'mysql'],   // keys from technologies.ts
  githubUrl: 'https://github.com/PatrykOzogIT/…', // optional — no URL, no button
  demoUrl: 'https://wms.example.com',             // optional — no URL, no button
  coverImage: { src: 'projects/wms-demo/cover.png', width: 1600, height: 1000, alt: { pl: '…', en: '…' } },
  images: [/* same shape, optional caption: { pl, en } */],
  accentHue: 230,            // optional — colour of the generated placeholder when there is no cover
};
```

Unpublished projects are **not compiled into the site at all** — their text never reaches the bundle.

### `pl.md` / `en.md`

Sections are top-level `#` headings with fixed keys. Any section can be omitted — it is then hidden.
Both languages must contain the same sections.

```md
# about
What the application is for.

# problem
The problem it solves and the approach taken.

# features
- Feature one
- Feature two

# architecture
## Sub-heading (rendered one level below the section title)
Description of the technical solution.

# challenges
Interesting problems and how they were solved.
```

Section titles shown on the page come from the UI dictionary (`i18n/*.ts`), so they are consistent across projects.

### Section title and badges (`kind`, `status`)

The projects section is titled after the kind of the published projects: all personal → "Personal projects",
all demo → "Demo projects", both → "Projects" (and then each card shows its kind as a badge). The project page
shows its kind above the title. `status` adds an "In development" badge to the card and the project page.

### Card layout rule (`featured`)

Order always follows `order`. A featured project takes a full row; other projects are paired two per row;
a project that would be left alone in a row is widened. The grid never has holes.

## Images

Put source images in `/public` (PNG or JPG; the larger the better — up to 1920 px wide is used) and
reference them from the content with their real `width` and `height`.

On every build the pipeline converts each image used by the site (portrait, project covers and galleries of
**published** projects) to WebP in several widths (96–1920 px, never upscaled) and the browser downloads the
smallest one that fits. The build fails if declared dimensions do not match the file — this prevents layout
shift and distortion. Variants live in the git-ignored `.image-cache/` and are regenerated only when the
source changes.

Gallery behaviour follows the number of images: none → no gallery, one → a single image, two or more →
a carousel. Every image can be enlarged in a full-screen viewer. Screenshots are never cropped, so any
proportion works (desktop, tablet or phone screenshots).

## Ecosystem — `src/content/ecosystem.ts`

`responsibilities` stays empty until confirmed — the "My role" block is hidden while it is empty.

## Expertise and technology — `src/content/expertise.ts`, `tech-stack.ts`

`expertise.ts`: four areas of what I do (title, description, points — PL and EN).
`tech-stack.ts`: groups of tools (keys from `technologies.ts`) with an optional short note. No ratings.
An empty list hides the section and its menu item.

## UI texts — `src/content/i18n/pl.ts`, `en.ts`

`pl.ts` defines the shape; `en.ts` must match it exactly — a missing or extra key is a compile error.
