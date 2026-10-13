import type { Routes } from '@angular/router';
import { DEFAULT_LANG } from '../content/model';
import { langMatchGuard } from './core/i18n/lang.guard';
import { projectResolver } from './features/project/project.resolver';
import { Shell } from './layout/shell/shell';

/** Development-only routes; `ngDevMode` is `false` in production builds, so this is tree-shaken away. */
const devRoutes: Routes =
  typeof ngDevMode === 'undefined' || ngDevMode
    ? [
        {
          path: '_styleguide',
          loadComponent: () =>
            import('./dev/styleguide/styleguide.page').then((m) => m.StyleguidePage),
        },
      ]
    : [];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_LANG },
  ...devRoutes,
  {
    path: ':lang',
    canMatch: [langMatchGuard],
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'projects/:slug',
        loadComponent: () => import('./features/project/project.page').then((m) => m.ProjectPage),
        resolve: { page: projectResolver },
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
  { path: '**', redirectTo: `${DEFAULT_LANG}/not-found` },
];
