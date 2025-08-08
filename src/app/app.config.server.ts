import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Server-spezifische Angular Application Configuration.
 * Fügt Server-Side Rendering und Routing Provider hinzu.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes)
  ]
};

/**
 * Kombinierte Angular Application Configuration,
 * die sowohl allgemeine als auch server-spezifische Konfigurationen enthält.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
