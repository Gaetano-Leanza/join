import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { routes } from './app.routes';

/**
 * Client-spezifische Angular Application Configuration.
 * Konfiguriert Change Detection, Routing und Client Hydration.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Aktiviert Zone.js Change Detection mit Event-Koaleszenz für bessere Performance.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Stellt die Angular Router-Provider mit definierten Routen bereit.
     */
    provideRouter(routes),

    /**
     * Aktiviert Client Hydration mit Event Replay für bessere UX bei SSR.
     */
    provideClientHydration(withEventReplay()),
  ],
};
