import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * Global configuration for the Angular application.
 *
 * Contains all the providers that are made available during the application's bootstrap.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Enables Zone-based change detection.
     *
     * @param eventCoalescing true: Multiple DOM events are coalesced into a single change detection cycle to improve performance.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Router provider with the defined application routes.
     * Provides the Angular Router functionality.
     */
    provideRouter(routes),
  ],
};
