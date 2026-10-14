# Architectural decisions

Short records of the decisions behind the portfolio. Newest at the bottom.

## 1. Static site generation, no server runtime
Angular `@angular/ssr` with `outputMode: "static"`. Content changes only at build time, so SSR would add a
Node process and hosting constraints without any benefit. Output is plain HTML per route; any static
host or nginx works.

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

## 12. Scroll behavior
The router's built-in scroll handling cannot keep the position on a language switch, so it is disabled and
`ScrollManager` handles the router's `Scroll` events: back/forward restores the position, a language switch
keeps it, a `#fragment` scrolls to the section (smoothly, offset by the sticky header), any other new page
starts at the top (instantly).

## 13. Ecosystem map drawn with CSS, not measured in JS
The map uses CSS subgrid: header / frontend / API rows line up across the three systems, the shared REST band
sits in the API row of the same grid and the data-layer links are pseudo-elements of fixed geometry.
Everything is present in the prerendered HTML — no layout measurement, no shift after hydration.
The systems are a WAI-ARIA tablist (arrow keys, Home/End); all panels are rendered for indexing and share
one grid cell (see 29 for how the height follows the active panel). On phones a sticky switcher mirrors the tabs.
The REST band deliberately shows communication without pairs or direction, and the "My role" block stays
hidden until responsibilities are confirmed.

## 14. Expertise vs. technology
Expertise describes capabilities; the Technology section lists tools with a short context line and never
ratings. Content that would repeat between the two is kept in one place only.

## 15. Project cards
Placeholder art (no cover image) is a deterministic SVG generated from the slug in the design-system style,
never an imitation screenshot. One link per card (stretched title link); GitHub / demo buttons sit above it.
Phone: media on top; tablet: media beside text; desktop: two columns, wide cards side by side.

## 16. Component style budget
Per-component style budget raised to 10 kB warning / 14 kB error: the ecosystem map is intentionally the
richest component (≈ 8.4 kB). Splitting it artificially would not reduce what the page downloads.
Incremental hydration is configured but no `@defer` hydration triggers are used yet — to be measured in Stage 5.

## 17. Portrait
One configured photo is shown in two places: small next to the name in the hero (decorative, empty alt —
the name is right beside it) and larger in the contact section (with alt text). The hero visual stays, so the
first screen keeps its engineering character. `photo: null` hides both. Responsive variants of the photo
will come from the image pipeline planned for Stage 4.

## 18. Build-time image pipeline
`sharp` (build-time only) converts every content image to WebP in fixed widths; a generated manifest feeds a
custom NgOptimizedImage loader, which maps any requested width to the smallest generated variant that covers
it. Only images of published projects are processed. WebP only (no AVIF): ~97% browser support, a single
format keeps the loader and the markup simple; AVIF could be added later with `<picture>`.
Result for the portrait: 287 kB PNG → 1.5 kB (hero avatar) to 13 kB (largest variant).

## 19. Gallery and viewer
Native horizontal scroll snapping provides swipe on touch devices without a gesture library; buttons and
arrow keys cover mouse and keyboard. The viewer is a native modal `<dialog>`; slides render only while it is
open. After closing, the carousel follows the last viewed image and focus moves to it. Frames letterbox
screenshots (`object-fit: contain`) so interfaces are never cropped. Gallery arrows are round icon buttons;
project-to-project navigation uses large text cards, so the two are never confused.

## 20. Reveal-on-scroll without hiding content
Sections and project blocks fade in when scrolled into view, but content is never hidden by default:
prerendered HTML is fully visible without JavaScript. Only after hydration, and only for blocks that are
still below the fold (reported asynchronously by IntersectionObserver — no forced layout), the class
`reveal-pending` is added. Disabled entirely with `prefers-reduced-motion`.

## 21. Fixed (not sticky) header
Chrome scrolls a focused element inside a `position: sticky` container towards the container's natural
position, so tabbing into the menu or the language switch mid-page jumped to the top of the document
(found by the end-to-end tests). The header is `position: fixed`; the shell reserves its height.

## 22. End-to-end tests against the prerendered build with fixtures
Playwright (Chromium only, desktop + phone viewport) tests the static output served like production.
`npm run build:e2e` builds the site with fixture projects from `e2e/fixtures/` (published, unpublished,
featured, with and without images) into `dist/e2e` — production content never contains fixtures, and
fixture images are generated on demand instead of being committed. axe-core checks WCAG 2.2 AA on every
page type, including the open image viewer and mobile menu (with reduced motion, so colours are measured
after animations).

## 23. Performance baseline (Lighthouse 12, home page, local server with Brotli and cache headers)
- Desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 100 — LCP 0.6 s, CLS 0.001.
- Mobile (simulated slow 4G, 4× CPU): 94 / 100 / 100 / 100 — LCP 2.7 s, CLS 0.024.
The mobile CLS comes from one word re-wrapping when Inter replaces the metric-matched fallback (average
width difference 0.03%). `font-display: optional` would remove it but keep first-time visitors on slow
connections on the fallback font for the whole visit; CLS 0.024 is 4× below the "good" threshold, so swap
stays. Incremental hydration triggers were not needed: total blocking time is 0 ms.
Production hosting must serve text with Brotli/gzip and fingerprinted files (`*-HASH.js/css`, fonts,
`/img/*`) with `Cache-Control: public, max-age=31536000, immutable`; HTML with `no-cache`.

## 24. Social preview image
`npm run og-image` renders `public/og/og-image.png` (1200×630) from an HTML template with the site's fonts,
colours, module motif and the portrait, using the Playwright browser. Language-neutral, so one image serves
both languages; re-run after design or photo changes.

## 25. Project kind and status
Every project declares `kind: 'personal' | 'demo'`. The projects section is titled from the published
projects: one shared kind → "Personal projects" / "Demo projects", both kinds → "Projects", with a kind badge
on each card (only then — otherwise the title already says it). Hard-coding one title would mislabel either a
real side project as a "demo" or future demo projects as "personal". An optional `status: 'in-development'`
adds a badge to the card and the project page and `creativeWorkStatus` to its JSON-LD.

## 26. "My role" in the ecosystem
The role is described once for the whole ecosystem, in a block below the map, instead of per system: my
responsibilities are the same across B2B, ERP and WMS, so per-system lists would repeat each other. The
block describes responsibilities, not a job title. The intro states what is mine (the design and the
foundation, built alone at first) and that a small team later joined the implementation, so it neither
undersells the authorship nor implies sole authorship of today's code. The unused per-system `responsibilities`
field was removed. The map, tabs and panels are unchanged.

## 27. Technology section: priority by order, legacy as a muted chip
No stars or ratings: the main stack is emphasized by position — Angular and TypeScript open the first group,
NestJS and Node.js the second, which share the top row on wider screens. Every technology appears once
(MySQL and MariaDB are one chip; SQL is implied). Database design, integrations and CI/CD are described in
the group notes rather than as extra chips. PHP / Zend stays visible as a dashed, muted chip tagged "Legacy",
with modernization explained in the note, so it is searchable without reading as the main direction.

## 28. Live vs. in development; app link labelled by kind
Availability and development stage are separate fields: `isLive` ("Live", the only badge with a green
accent) and `developmentStatus` ("In development", neutral). One "status" could not say that Cookivo is both
running publicly and actively developed. `demoUrl` became `appUrl`, because a real product is not a demo;
the button label follows `kind` ("Live Demo" vs. "Visit app"), so no per-project label is needed. `isLive`
without `appUrl` fails content validation.

## 29. Real-world examples inside the existing structure
Three examples of real decisions, without a new section: two are architecture perspectives on the ecosystem
map — the REST band (secure communication, shared authorization) and the shared data layer (stock allocation
and reservations) — and one is a case study under the Expertise cards (legacy modernization), linked from the
"System modernization" card. The perspectives are tabs in the same tablist as the systems (arrow keys run
B2B → ERP → WMS → REST → data) and open in the same panel area, with a neutral highlight so they never read
as a fourth system. An always-visible "Real-world examples" row under the ecosystem heading opens either
perspective (focus moves to its tab, the panel scrolls into view) or jumps to the case study.
Panels still share one grid cell, but inactive panels are taken out of the flow, so the height follows the
active panel: a short system panel no longer inherits the height of a long perspective. Height changes only
after a click, below the map, so there is no unexpected layout shift.
The examples navigation and the "My role" block are separate components, which keeps the map's styles within
the component style budget.
