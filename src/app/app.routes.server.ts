import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-seitige Routen-Konfiguration für Angular SSR.
 * 
 * @type {ServerRoute[]}
 * @description
 * Definiert, wie verschiedene Pfade auf dem Server gerendert werden.
 */
export const serverRoutes: ServerRoute[] = [
  // Spezifische Route für Contact-Details mit dynamischen Parametern
  {
    path: 'contacts/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Hier definierst du die Contact-IDs, die prerendert werden sollen
      const contactIds = ['1', '2', '3', '4', '5']; // Passe diese IDs an deine Daten an
      
      // Alternativ: IDs aus einer API laden (auskommentiert)
      /*
      try {
        const response = await fetch('https://your-api.com/contacts');
        const contacts = await response.json();
        const contactIds = contacts.map((contact: any) => contact.id.toString());
        return contactIds.map(id => ({ id }));
      } catch (error) {
        console.error('Fehler beim Laden der Contact-IDs:', error);
        return []; // Fallback: keine Routen prerendern
      }
      */
      
      return contactIds.map(id => ({ id }));
    }
  },
  
  // Catch-all Route für alle anderen Pfade - muss am Ende stehen
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];