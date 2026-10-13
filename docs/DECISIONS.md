# Architectural decisions

Short records of the decisions behind the portfolio. Newest at the bottom.

## 1. Static site generation, no server runtime
Angular `@angular/ssr` with `outputMode: "static"`. Content changes only at build time, so SSR would add a
Node process and hosting constraints without any benefit. Output is plain HTML per route; any static
host or nginx works. Incremental hydration is enabled for heavy interactive sections.

## 2. Custom typed i18n instead of `@angular/localize`
Most text comes from data (projects, ecosystem), which `@angular/localize` does not cover — two translation
systems would be worse than one. Dictionaries are TypeScript objects: a missing English key is a compile error.
Language comes from the URL (`/pl/…`, `/en/…`); switching keeps the current page (and fragment).

## 3. URL strategy
- `/pl` and `/en` symmetric prefixes; `/` redirects to `/pl` (Polish-leaning audience).
  On nginx, `/` can later redirect by `Accept-Language`.
- `hreflang` alternates on every page; `x-default` → English (for visitors speaking neither language).
- No trailing slashes (`/pl/projects/x`), the same as Angular router URLs. Hosting must serve
  `path/index.html` without redirecting.
- Project slugs and the `projects` segment are shared by both languages.

## 4. Content model and the single source of visibility rules
Content is plain TypeScript in `src/content/` (no Angular), shared by the app and the build scripts.
`selectors.ts` is the only place deciding what is visible: the home sections, the navigation, the
prerendered routes and the project pages all ask the same functions, so they cannot get out of sync.
Content is provided through an injection token so tests can use fixtures.

## 5. Markdown compiled at build time
Long project descriptions are Markdown (`pl.md`, `en.md`) compiled to HTML by `scripts/content.ts` — no
Markdown parser in the browser. Each project/language becomes a lazy chunk. Only published projects are
generated, so unpublished text never ships. The `slug` is the identifier (a separate `id` would be redundant).

## 6. Build-time content validation
The content pipeline fails the build on: invalid or duplicate slugs, duplicate `order`, missing translations,
non-https URLs, missing images/CV files, missing alt text, unknown or mismatched Markdown sections.

## 7. Sitemap generated from the build output
`scripts/postbuild.ts` reads the prerendered pages (canonical + alternates). The sitemap can only contain
pages that were actually built. Without `siteUrl` (domain not chosen yet) canonical URLs, `og:url` and the
sitemap are omitted instead of publishing placeholder URLs.

## 8. Fonts
Self-hosted Inter (variable, `wght` axis) and JetBrains Mono 500, latin + latin-ext subsets only (Polish
needs both). The `opsz` (optical size) build of Inter would add ~73 KB for a subtle display-cut effect;
tighter tracking on headings is used instead. A metric-adjusted fallback face limits layout shift.

## 9. Minimal dependencies
Runtime: Angular only. No UI kit, icon library, animation library, carousel or state management.
Icons are a typed registry of SVG paths (Lucide, Simple Icons). Build-time only: `marked`, `tsx`, fonts.

## 10. Bundle budgets
Angular budgets measure raw size. Initial raw budget 350 kB warning / 420 kB error, which corresponds to the
target of ~100–120 kB gzip. Stage 2 baseline: 312 kB raw / 88 kB transferred.

## 11. Focus management
After navigating to another page focus moves to the `<h1>`; after a section link it moves to the section.
After a language switch focus stays on the switch. Native `<dialog>` for the mobile menu provides focus
trapping, Escape and an inert background.

## 12. Scroll behaviour
The router's built-in scroll handling cannot keep the position on a language switch, so it is disabled and
`ScrollManager` handles the router's `Scroll` events: back/forward restores the position, a language switch
keeps it, a `#fragment` scrolls to the section (smoothly, offset by the sticky header), any other new page
starts at the top (instantly).
