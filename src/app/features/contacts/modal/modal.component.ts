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

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

/** Firebase configuration object */
const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N',
};

/** Firebase app instance */
const app = initializeApp(firebaseConfig);

/** Firestore database instance */
const db = getFirestore(app);

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

  /**
   * Component initialization
   * Loads selected contact if available
   */
  ngOnInit(): void {
    this.loadSelectedContact();
  }

  /**
   * Handles input property changes
   * Updates component state when contactToEdit or visible changes
   * @param {SimpleChanges} changes - Object containing changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit'] && this.contactToEdit) {
      this.loadContactData(this.contactToEdit);
      this.isEditing = true;
    } else if (changes['visible'] && this.visible) {
      this.loadSelectedContact();
    }
  }

  /**
   * Loads the currently selected contact from service
   * Sets editing mode if contact is found
   */
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
          // Error handled silently - contact loading failed
        },
      });
    }
  }

  /**
   * Loads contact data into form fields
   * @param {Contact} contact - Contact object to load
   */
  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id;
  }

  /**
   * Handles input field changes (for debugging/logging purposes)
   * @param {string} field - Name of the changed field
   * @param {string} value - New value of the field
   */
  onInputChange(field: string, value: string) {
    // Input change handling - can be used for validation or logging
  }

  /**
   * Handles backdrop click events
   * Closes modal when user clicks outside of it
   */
  handleBackdropClick() {
    this.closed.emit();
  }

  async resetForm(): Promise<void> {
    if (this.currentContactId) {
      const confirmed = confirm('Möchtest du diesen Kontakt wirklich löschen?');
      if (!confirmed) return;

      const success = await this.contactService.deleteContact(
        this.currentContactId
      );
      if (success) {
        alert('Kontakt erfolgreich gelöscht.');
        this.contactService.setSelectedContact(null);

        // Modal schließen
        this.handleBackdropClick();
      } else {
        alert('Fehler beim Löschen des Kontakts.');
      }
    }

    // Formularfelder leeren
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }

  /**
   * Saves contact data to Firebase
   * Updates existing contact or creates new one based on editing state
   * @param {NgForm} form - Angular form reference for validation
   * @returns {Promise<void>} Promise that resolves when save operation completes
   */
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
          doc(db, 'contacts', this.currentContactId),
          contactData
        );
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...contactData,
          createdAt: new Date(),
        });
      }

      alert('Kontakt erfolgreich gespeichert!');
      this.resetForm();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      alert('Fehler beim Speichern des Kontakts.');
    }
  }

  /**
   * Validates contact name format
   * Allows only letters, spaces, and hyphens
   * @param {string} name - Name string to validate
   * @returns {boolean} True if name format is valid
   */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /**
   * Generates initials from contact name
   * @param {string} name - Full name string
   * @returns {string} Uppercase initials (maximum 2 characters)
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Gets avatar background color based on contact name
   * Uses first character of name to determine color from predefined palette
   * @param {string} name - Contact name
   * @returns {string} Hex color code for avatar background
   */
  getAvatarColor(name: string): string {
    if (!name || name.trim().length === 0) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}
