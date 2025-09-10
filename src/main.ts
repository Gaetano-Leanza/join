import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { setLogLevel, LogLevel } from '@angular/fire';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { getAuth, provideAuth } from '@angular/fire/auth';

/**
 * @description Firebase configuration object containing API keys and project identifiers.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N',
};

/**
 * Sets the Firebase log level to verbose, but only when running in a browser environment.
 */
if (typeof window !== 'undefined') {
  setLogLevel(LogLevel.VERBOSE);
}

/**
 * @description Conditionally creates and returns Firebase providers only when the application
 * is running in a browser environment. This prevents errors during Server-Side Rendering (SSR).
 * @returns {any[]} An array of Firebase providers or an empty array if not in a browser.
 */
const getFirebaseProviders = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }

  return [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ];
};

/**
 * @description Bootstraps the Angular application.
 * It merges the base application config with browser-specific providers like animations
 * and Firebase services.
 */
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
    ...getFirebaseProviders(),
    provideAuth(() => getAuth()),
  ],
}).catch((err) => console.error(err));
