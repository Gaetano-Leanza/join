import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side route configuration for Angular SSR.
 *
 * @type {ServerRoute[]}
 * @description
 * Defines how different paths are rendered on the server.
 */
export const serverRoutes: ServerRoute[] = [
  // Specific route for Contact Details with dynamic parameters
  {
    path: 'contacts/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Here you define the contact IDs that should be prerendered
      const contactIds = ['1', '2', '3', '4', '5']; // Adjust these IDs to your data
      
      // Alternatively: Load IDs from an API (commented out)
      /*
      try {
        const response = await fetch('https://your-api.com/contacts');
        const contacts = await response.json();
        const contactIds = contacts.map((contact: any) => contact.id.toString());
        return contactIds.map(id => ({ id }));
      } catch (error) {
        console.error('Error loading contact IDs:', error);
        return []; // Fallback: do not prerender any routes
      }
      */
      
      return contactIds.map(id => ({ id }));
    }
  },
  
  // Catch-all route for all other paths - must be at the end
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
