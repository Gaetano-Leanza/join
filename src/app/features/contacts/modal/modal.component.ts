import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // wichtig für ngModel
import { slideInModal } from './modal.animations';

// 🔥 Firebase importieren
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// 🔧 Firebase-Konfiguration
const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N'
};

// Initialisiere Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [slideInModal],
  imports: [
    CommonModule,
    FormsModule // Wichtig für [(ngModel)]
  ]
})
export class ModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  name: string = '';
  email: string = '';
  phone: string = '';

  handleBackdropClick() {
    this.closed.emit();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
  }

  async saveContact() {
    if (!this.name.trim() || !this.email.trim() || !this.phone.trim()) {
      alert('Bitte alle Felder ausfüllen.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        createdAt: new Date()
      });

      alert('Kontakt erfolgreich gespeichert!');
      this.resetForm();
      this.handleBackdropClick();

    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Kontakts.');
    }
  }
}
