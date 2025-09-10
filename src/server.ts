import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @description The folder where the server distribution files are located.
 */
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
/**
 * @description The folder where the browser distribution files are located.
 */
const browserDistFolder = resolve(serverDistFolder, '../browser');

/**
 * @description The Express application instance.
 */
const app = express();
/**
 * @description The Angular Node App Engine instance for handling server-side rendering.
 */
const angularApp = new AngularNodeAppEngine();

/**
 * @description Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 * // Handle API request
 * });
 * ```
 */

/**
 * @description Serve static files from the /browser directory with a one-year max age.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * @description Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * @description Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    // Intentionally left blank to avoid console logs in production.
  });
}

/**
 * @description Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
