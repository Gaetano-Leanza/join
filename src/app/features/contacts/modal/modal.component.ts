import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal.animations';
import { Contact } from '../contact-model/contact.model';
import { ContactService } from '../contact-service/contact.service';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';

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
  private contactService = inject(ContactService);
  
  @Input() contactToEdit: Contact | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() contactSaved = new EventEmitter<void>();

  name: string = '';
  email: string = '';
  phone: string = '';
  isEditing = false;
  currentContactId: string | null = null;

  avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  ngOnInit(): void {
    this.loadSelectedContact();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit'] && this.contactToEdit) {
      this.loadContactData(this.contactToEdit);
      this.isEditing = true;
    } else if (changes['visible'] && this.visible) {
      this.loadSelectedContact();
    }
  }

  private loadSelectedContact(): void {
    this.currentContactId = this.contactService.getSelectedContactId();
    if (this.currentContactId) {
      this.contactService.getContactById(this.currentContactId).subscribe({
        next: (contact) => {
          if (contact) {
            this.loadContactData(contact);
            this.isEditing = true;
          }
        },
        error: (err) => {
          console.error('Error loading contact:', err);
        }
      });
    }
  }

  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id;
  }

  onInputChange(field: string, value: string) {
    console.log(`Eingabe geändert - ${field}:`, value);
  }

  handleBackdropClick() {
    this.resetForm();
    this.closed.emit();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }

  async saveContact(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    try {
      const contactData = {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        updatedAt: new Date()
      };

      if (this.isEditing && this.currentContactId) {
        await updateDoc(doc(db, 'contacts', this.currentContactId), contactData);
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...contactData,
          createdAt: new Date()
        });
      }

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

  getAvatarColor(name: string): string {
    if (!name || name.trim().length === 0) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}