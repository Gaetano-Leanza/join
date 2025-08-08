import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstrappt die Angular-Anwendung mit der Root-Komponente und der Server-Konfiguration.
 * 
 * @returns {Promise<void>} Ein Promise, das auf die erfolgreiche Initialisierung der App wartet.
 */
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
