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
  deleteDoc, // <-- hinzugefügt
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
  styleUrls: ['./modal.component.scss',
    './modal.responsive.scss',
    './modal.responsive2.scss'],

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
          // Error handled silently - contact loading failed
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

  /**
   * Setzt nur die Formularfelder und den lokalen Zustand zurück (ohne Firebase, ohne Schließen).
   * Diese Methode wird z. B. nach einem erfolgreichen Speichern verwendet,
   * damit der gerade gespeicherte Kontakt nicht wieder gelöscht wird.
   */
  private clearFormOnly(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }

  /**
   * Löscht den aktuell bearbeiteten Kontakt aus Firestore (falls vorhanden),
   * setzt anschließend das Formular zurück und schließt das Modal.
   *
   * @async
   * @function deleteContactAndClose
   * @returns {Promise<void>} Promise, das nach Löschung (falls nötig),
   *          Zurücksetzen und Schließen erfüllt wird.
   *
   * @description
   * - Wenn `currentContactId` gesetzt ist, wird der entsprechende Kontakt aus der
   *   Firestore-Collection `contacts` gelöscht.
   * - Setzt anschließend alle Eingabefelder (`name`, `email`, `phone`) zurück,
   *   deaktiviert den Bearbeitungsmodus und entfernt die aktuelle ID.
   * - Emittiert das `closed`-Event, um das Modal zu schließen.
   *
   * @throws {Error} Falls die Löschung fehlschlägt, wird der Fehler protokolliert.
   *         Das Formular wird dennoch zurückgesetzt und das Modal geschlossen.
   */
  async deleteContactAndClose(): Promise<void> {
    try {
      if (this.currentContactId) {
        await deleteDoc(doc(db, 'contacts', this.currentContactId));
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Kontakts:', error);
    } finally {
      this.clearFormOnly();
      this.closed.emit();
    }
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
        await updateDoc(doc(db, 'contacts', this.currentContactId), contactData);
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...contactData,
          createdAt: new Date(),
        });
      }

      // Nur Formular leeren, nicht löschen
      this.clearFormOnly();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      // optional: Fehlerhandling/Nutzerfeedback ergänzen
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
