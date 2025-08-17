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
 * Setzt das Logging-Level von Firebase nur im Browser.
 */
if (typeof window !== 'undefined') {
  setLogLevel(LogLevel.VERBOSE);
}

/**
 * Erstellt Browser-spezifische Firebase Provider
 */
const getFirebaseProviders = () => {
  // Provider nur erstellen wenn wir im Browser sind
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('SSR-Kontext erkannt - Firebase Provider übersprungen');
    return [];
  }
  
  console.log('Browser-Kontext erkannt - Firebase Provider hinzugefügt');
  return [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ];
};

/**
 * Bootstrappt die Angular-Anwendung.
 * Firebase Provider werden nur im Browser hinzugefügt.
 */
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
    ...getFirebaseProviders()
  ]
}).catch(err => console.error(err));