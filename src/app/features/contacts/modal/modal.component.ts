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

import { Firestore, collection, addDoc, doc, updateDoc } from '@angular/fire/firestore';

/**
 * Modal component for creating and editing contacts
 * Provides form functionality with validation and Firebase integration
 */
@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  /** Injected contact service for data operations */
  private contactService = inject(ContactService);

  /** Injected Firestore instance from AngularFire */
  private firestore = inject(Firestore);

  /** Contact to edit, null for new contact creation */
  @Input() contactToEdit: Contact | null = null;

  /** Modal visibility state */
  @Input() visible = false;

  /** Event emitted when modal is closed */
  @Output() closed = new EventEmitter<void>();

  /** Event emitted when contact is saved successfully */
  @Output() contactSaved = new EventEmitter<void>();

  /** Contact name input field value */
  name: string = '';

  /** Contact email input field value */
  email: string = '';

  /** Contact phone input field value */
  phone: string = '';

  /** Flag indicating if component is in edit mode */
  isEditing = false;

  /** ID of contact currently being edited */
  currentContactId: string | null = null;

  /** Array of predefined avatar background colors */
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
        error: () => {
          // silently ignore
        },
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
    // optional: handle field changes
  }

  handleBackdropClick() {
    this.closed.emit();
  }

  async resetForm(): Promise<void> {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
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

      this.resetForm();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
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
