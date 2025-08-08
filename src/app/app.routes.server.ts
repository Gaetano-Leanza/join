import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-seitige Routen-Konfiguration für Angular SSR.
 * 
 * @type {ServerRoute[]}
 * @description
 * Definiert, wie verschiedene Pfade auf dem Server gerendert werden.
 * Hier wird für alle Pfade ('**') Prerendering aktiviert.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
