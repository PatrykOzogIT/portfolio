import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // The router records positions and emits Scroll events; ScrollManager decides what to do
      // (it keeps the position on a language switch, which the built-in options cannot express).
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled' }),
      // Resolved data and params arrive as component inputs.
      withComponentInputBinding(),
      // Child routes see `:lang`, so switching language re-runs their resolvers.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideClientHydration(withIncrementalHydration()),
  ],
};
