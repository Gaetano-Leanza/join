import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
  imports: [CommonModule, FormsModule]
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

  async saveContact(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        createdAt: new Date()
      });

      alert('Contact saved successfully!');
      this.resetForm();
      this.handleBackdropClick();

    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving the contact.');
    }
  }
}
