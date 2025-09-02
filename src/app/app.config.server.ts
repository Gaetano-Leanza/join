import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

/**
 * @description Server-specific Angular Application Configuration.
 * Adds providers for Server-Side Rendering.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

/**
 * @description Merged Angular Application Configuration that combines
 * the general and server-specific configurations.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);