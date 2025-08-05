import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // Animationen importieren
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers!,
    provideRouter(routes),
    provideAnimations(),  // Animationen als Provider hinzufügen
  ]
}).catch(err => console.error(err));
