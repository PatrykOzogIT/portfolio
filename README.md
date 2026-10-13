# Patryk Ożóg — Portfolio

Bilingual (PL / EN) developer portfolio built with **Angular 22**, prerendered to static HTML.

- Static site generation — every public page is plain HTML; any static host works.
- Content managed in typed TypeScript and Markdown files — no CMS, no database.
- Sections, navigation, routes and the sitemap adapt automatically to the published content.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Validates content and starts the dev server on <http://localhost:4200> |
| `npm run build` | Validates content, builds and prerenders to `dist/portfolio/browser`, writes `sitemap.xml` / `robots.txt` |
| `npm run preview` | Serves the production build on <http://localhost:4400> (behaves like static hosting) |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:scripts` | Tests of the build scripts (Node test runner) |
| `npm run typecheck` | Type-checks the app, the tests and the scripts |
| `npm run content` | Validates content and regenerates `src/content/generated/` (run after editing Markdown while `ng serve` is running) |

Dev only: <http://localhost:4200/_styleguide> — living design-system reference (removed from production builds).

## Project structure

```
src/
  content/            Content & rules — plain TypeScript, no Angular (shared with build scripts)
    model.ts          Typed content model
    site.config.ts    Contact data, links, CV files, domain
    ecosystem.ts      B2B / ERP / WMS ecosystem
    technologies.ts   Technology registry
    i18n/             UI dictionaries (pl.ts is the reference shape; en.ts must match it)
    projects/<slug>/  project.ts + pl.md + en.md
    selectors.ts      Visibility & ordering rules — the only place that decides what is shown
    generated/        Build output of scripts/content.ts (git-ignored)
  app/
    core/             i18n, SEO, content injection token, focus management
    layout/           Shell, header, mobile menu, language switch, footer
    shared/ui/        Design-system primitives (button, icon, section heading…)
    features/         Pages: home, project, not-found
    dev/              Dev-only pages (styleguide)
  styles/             Design tokens, fonts, base, typography, global primitives
scripts/              Content pipeline, post-build (sitemap/robots), static preview server
docs/                 Decisions and content guide
```

See [docs/CONTENT.md](docs/CONTENT.md) to add or edit content and [docs/DECISIONS.md](docs/DECISIONS.md) for the architectural decisions.
