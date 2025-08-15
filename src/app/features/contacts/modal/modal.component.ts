// modal.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal.animations';
import { Contact } from '../contact-model/contact.model';
import { ContactService } from '../contact-service/contact.service';

import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: [
    './modal.component.scss',
    './modal.responsive.scss',
    './modal.responsive2.scss',
  ],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  /** Services */
  private contactService = inject(ContactService);
  private firestore = inject(Firestore);

  /** Inputs/Outputs */
  @Input() contactToEdit: Contact | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() contactSaved = new EventEmitter<void>();

  /** Form fields */
  name = '';
  email = '';
  phone = '';

  /** State */
  isEditing = false;
  currentContactId: string | null = null;

  /** Colors */
  avatarColors: string[] = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#3F51B5',
    '#03A9F4',
    '#009688',
    '#4CAF50',
    '#FFC107',
    '#FF9800',
    '#795548',
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
        error: () => {},
      });
    }
  }

  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id;
  }

  handleBackdropClick() {
    this.closed.emit();
  }

  private clearFormOnly(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }

  async deleteContactAndClose(): Promise<void> {
    try {
      if (this.currentContactId) {
        await deleteDoc(doc(this.firestore, 'contacts', this.currentContactId));
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Kontakts:', error);
    } finally {
      this.clearFormOnly();
      this.closed.emit();
    }
  }

  onInputChange(field: string, value: string) {
    // Falls du später etwas damit machen willst:
    console.log(`Feld geändert: ${field} = ${value}`);

    // Beispiel: direkt den Wert setzen
    if (field === 'name') this.name = value;
    if (field === 'email') this.email = value;
    if (field === 'phone') this.phone = value;
  }

  async saveContact(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    try {
      const contactData = {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        updatedAt: new Date(),
      };

      if (this.isEditing && this.currentContactId) {
        await updateDoc(
          doc(this.firestore, 'contacts', this.currentContactId),
          contactData
        );
      } else {
        await addDoc(collection(this.firestore, 'contacts'), {
          ...contactData,
          createdAt: new Date(),
        });
      }

      this.clearFormOnly();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Fehler beim Speichern des Kontakts:', error);
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
