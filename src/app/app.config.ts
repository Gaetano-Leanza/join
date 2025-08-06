import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Hydration mit Event Replay für bessere Performance
    provideClientHydration(withEventReplay()),

    // Falls Hydration Probleme macht, temporär deaktivieren:
    // provideClientHydration(withNoDomReuse())

    // Oder komplett deaktivieren:
    // (provideClientHydration() entfernen)
  ],
};
