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

const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N'
};

// 👉 Logging aktivieren (optional: LogLevel.DEBUG für weniger Output)
setLogLevel(LogLevel.VERBOSE);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
}).catch((err) => console.error(err));
