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

### Card layout rule (`featured`)

Order always follows `order`. A featured project takes a full row; other projects are paired two per row;
a project that would be left alone in a row is widened. The grid never has holes.

## Ecosystem — `src/content/ecosystem.ts`

`responsibilities` stays empty until confirmed — the "My role" block is hidden while it is empty.

## Expertise and technology — `src/content/expertise.ts`, `tech-stack.ts`

`expertise.ts`: four areas of what I do (title, description, points — PL and EN).
`tech-stack.ts`: groups of tools (keys from `technologies.ts`) with an optional short note. No ratings.
An empty list hides the section and its menu item.

## UI texts — `src/content/i18n/pl.ts`, `en.ts`

`pl.ts` defines the shape; `en.ts` must match it exactly — a missing or extra key is a compile error.
