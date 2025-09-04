import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { 
  provideFirebaseApp,
  initializeApp
} from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { setLogLevel, LogLevel } from '@angular/fire';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { getAuth, provideAuth } from '@angular/fire/auth';

/**
 * Firebase configuration.
 * Contains API keys and project information.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N'
};

/**
 * Sets the Firebase logging level only in the browser.
 */
if (typeof window !== 'undefined') {
  setLogLevel(LogLevel.VERBOSE);
}

/**
 * Creates browser-specific Firebase providers.
 */
const getFirebaseProviders = () => {
  // Only create providers if we are in the browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('SSR context detected - skipping Firebase providers');
    return [];
  }

  console.log('Browser context detected - adding Firebase providers');
  return [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ];
};

/**
 * Bootstraps the Angular application.
 * Firebase providers are only added in the browser.
 */
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
    ...getFirebaseProviders(),
    provideAuth(() => getAuth())
  ]
}).catch(err => console.error(err));
