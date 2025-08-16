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

/**
 * Konfiguration für Firebase.
 * Enthält die API-Schlüssel und Projektinformationen.
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
 * Setzt das Logging-Level von Firebase.
 * LogLevel.VERBOSE zeigt alle Logs an.
 */
setLogLevel(LogLevel.VERBOSE);

/**
 * Bootstrappt die Angular-Anwendung.
 * 
 * Dies ist ein **Client-Side Rendering (CSR) Bootstrap**, keine SSR.
 * 
 * @returns {Promise<void>} Ein Promise, das auf die erfolgreiche Initialisierung der App wartet.
 */
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    // Provider aus der App-Konfiguration übernehmen
    ...(appConfig.providers || []),
    // Animationen bereitstellen
    provideAnimations(),
    // Firebase App initialisieren
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    // Firestore bereitstellen
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err)); // Fehler beim Bootstrap protokollieren


