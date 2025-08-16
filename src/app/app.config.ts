import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * Globale Konfiguration der Angular-Anwendung.
 * 
 * Enthält alle Provider, die beim Bootstrap der Anwendung bereitgestellt werden.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Aktiviert die Zonen-basierte Change Detection.
     * 
     * @param eventCoalescing true: Mehrere DOM-Events werden zu einem Change Detection Zyklus zusammengefasst,
     *                         um Performance zu verbessern.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Router-Provider mit den definierten App-Routen.
     * Stellt die Angular Router-Funktionalität zur Verfügung.
     */
    provideRouter(routes),
  ],
};
