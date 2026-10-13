# Patryk Ożóg — Developer Portfolio

Bilingual (Polish / English) portfolio of a Senior Full-Stack Developer focused on software architecture
and business systems — ERP, WMS and B2B.

The site itself is meant to demonstrate the way I work: a small, deliberate architecture, typed
content instead of a CMS, accessibility and performance treated as requirements, and an interface that
adapts automatically to the content that is actually published.

> **Status:** in active development — not deployed yet. Built in stages; decisions are recorded in
> [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Highlights

- **Static site generation** — every public page is prerendered to plain HTML at build time (Angular SSR
  in static output mode). No server runtime; any static host or nginx can serve it.
- **Content as typed data** — TypeScript content model plus Markdown for long-form text, compiled at
  build time. A validation step fails the build on missing translations, broken references or invalid data.
- **Content-driven visibility** — one set of pure selector functions decides what exists: page sections,
  navigation, prerendered routes and the sitemap can never disagree. No projects published → no projects
  section, no menu item, no routes. Unpublished projects never reach the bundle.
- **Bilingual by design** — `/pl` and `/en` routes, typed UI dictionaries (a missing key is a compile
  error), a language switch that keeps the current page and scroll position, `hreflang` on every page.
- **Interactive B2B / ERP / WMS ecosystem map** — WAI-ARIA tabs, keyboard support, a sticky switcher on
  phones; the diagram is drawn with CSS subgrid, so it is complete in the prerendered HTML.
- **Accessibility** — semantic landmarks, visible focus, focus management after navigation, native
  `<dialog>` for the mobile menu, `prefers-reduced-motion` support, 44 px touch targets. Target: WCAG 2.2 AA.
- **Lean** — runtime dependencies are Angular only: no UI kit, icon library, animation or state library.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Angular 22 — standalone components, signals, zoneless change detection, new control flow |
| Rendering | `@angular/ssr` static output (prerendering), client hydration |
| Language | TypeScript (strict, strict templates) |
| Styling | SCSS with design tokens as CSS custom properties, self-hosted Inter and JetBrains Mono |
| Content | Typed TypeScript modules + Markdown compiled with `marked` at build time |
| Testing | Vitest (unit and component tests), Node test runner for build scripts |
| Tooling | Prettier, `tsx` for build scripts |

## Getting started

Requirements: **Node.js 22.22+ or 24.15+**, npm.

```bash
npm install
npm start          # dev server on http://localhost:4200
```

| Command | Description |
| --- | --- |
| `npm start` | Validate content and start the dev server |
| `npm run build` | Validate content, build and prerender to `dist/portfolio/browser`, generate `sitemap.xml` and `robots.txt` |
| `npm run preview` | Serve the production build on http://localhost:4400 (behaves like static hosting) |
| `npm test` | Unit and component tests |
| `npm run test:scripts` | Tests of the build scripts |
| `npm run typecheck` | Type-check the app, the tests and the scripts |
| `npm run content` | Re-validate content and regenerate compiled Markdown (e.g. while `npm start` is running) |

In development, `/_styleguide` shows the design system (colours, typography, spacing, primitives).
The route is removed from production builds.

## Project structure

```
src/
  content/          Content and rules — plain TypeScript, no Angular (shared with build scripts)
    model.ts        Typed content model
    site.config.ts  Contact links, photo, domain
    ecosystem.ts    B2B / ERP / WMS ecosystem (anonymized)
    expertise.ts    Areas of expertise
    tech-stack.ts   Technology groups
    i18n/           UI dictionaries (pl.ts defines the shape; en.ts must match it)
    projects/       One folder per project: project.ts + pl.md + en.md
    selectors.ts    Visibility and ordering rules — the single source of truth
  app/
    core/           i18n, SEO, scroll and focus management, content injection token
    layout/         Shell, header, mobile menu, language switch, footer
    shared/         Design-system primitives, project card and placeholder art
    features/       Pages: home (and its sections), project, not found
    dev/            Development-only pages
  styles/           Design tokens, fonts, base styles, typography, global primitives
scripts/            Content pipeline, post-build (sitemap / robots), local static server
docs/               Architectural decisions and content guide
design-preview/     Static visual concept from the design stage (temporary)
```

## Managing content

No admin panel and no database: content lives in `src/content/` and is versioned with the code.
Adding a project means adding a folder with metadata and two Markdown files — no component changes.
See [`docs/CONTENT.md`](docs/CONTENT.md).

## Roadmap

- [x] Concept and design system
- [x] Application foundation — routing, i18n, SEO, content pipeline
- [x] Home page — hero, expertise, ecosystem, technology, projects, contact
- [ ] Project pages — gallery, lightbox, image pipeline (AVIF / WebP)
- [ ] Polish — motion, accessibility audit, performance, end-to-end tests
- [ ] Deployment — hosting, domain, HTTPS, CI/CD

## Author

**Patryk Ożóg** — Senior Full-Stack Developer · Software Architecture

[LinkedIn](https://www.linkedin.com/in/patryk-ozog/) · [GitHub](https://github.com/PatrykOzogIT)
