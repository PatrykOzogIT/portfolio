import { RenderMode, type ServerRoute } from '@angular/ssr';
import { SITE_CONTENT_DATA } from '../content';
import { LANGS } from '../content/model';
import { publishedProjects } from '../content/selectors';

const langParams = async () => LANGS.map((lang) => ({ lang }));

/**
 * Static site generation: every public page is prerendered to HTML at build time.
 * Project pages exist only for PUBLISHED projects — others are never generated.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  {
    path: ':lang/projects/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      LANGS.flatMap((lang) =>
        publishedProjects(SITE_CONTENT_DATA.projects).map((p) => ({ lang, slug: p.slug })),
      ),
  },
  { path: ':lang/not-found', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  // Everything else (unknown URLs, dev-only routes) falls back to client-side rendering.
  { path: '**', renderMode: RenderMode.Client },
];
