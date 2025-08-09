import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal.animations';
import { Contact } from '../contact-model/contact.model';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  @Input() contactToEdit: Contact | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() contactSaved = new EventEmitter<void>();

  name: string = '';
  email: string = '';
  phone: string = '';

  ngOnInit(): void {
    this.loadFromLocalStorage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.loadFromLocalStorage();
    }

    if (this.contactToEdit) {
      this.name = this.contactToEdit.name || '';
      this.email = this.contactToEdit.email || '';
      this.phone = this.contactToEdit.phone || '';
    } else {
      this.resetForm();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('selectedContact');
      if (stored) {
        const contact: Contact = JSON.parse(stored);
        this.name = contact.name || '';
        this.email = contact.email || '';
        this.phone = contact.phone || '';
        console.log('Kontakt aus Local Storage geladen:', contact);
      }
    } catch (error) {
      console.error('Fehler beim Laden aus Local Storage:', error);
    }
  }

  onInputChange(field: string, value: string) {
    console.log(`Eingabe geändert - ${field}:`, value);
  }

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
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        createdAt: new Date(),
      });

      alert('Kontakt erfolgreich gespeichert!');
      this.resetForm();
      this.handleBackdropClick();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Kontakts.');
    }
  }

  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  getAvatarColor(name: string): string {
    if (!name || name.trim().length === 0) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}