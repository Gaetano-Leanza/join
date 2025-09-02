import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Bootstraps the Angular application with the root component and the server configuration.
 * * @returns {Promise<void>} A promise that resolves when the app has been successfully initialized.
 */
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
