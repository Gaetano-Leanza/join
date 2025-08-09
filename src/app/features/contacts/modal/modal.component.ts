import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal.animations';

// 🔥 Firebase nur für Speichern nötig
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
  measurementId: 'G-Y12RXDEX3N',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Modal-Komponente zur Anzeige und Bearbeitung eines Kontakts.
 *
 * Unterstützt Animationen, Eingabevalidierung und speichert Daten in Firebase Firestore.
 * Benutzt `OnChanges`, um Eingabewerte zu synchronisieren und das Formular zurückzusetzen.
 */
@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges {
  /** Gibt an, ob das Modal sichtbar ist. */
  @Input() visible = false;

  /** Kontakt, der zum Bearbeiten vom Parent übergeben wird. */
  @Input() contactToEdit: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null = null;

  /** Event wird ausgelöst, wenn das Modal geschlossen wird. */
  @Output() closed = new EventEmitter<void>();

  /** Event wird ausgelöst, wenn ein Kontakt erfolgreich gespeichert wurde. */
  @Output() contactSaved = new EventEmitter<void>();

  /** Eingabefelder */
  name: string = '';
  email: string = '';
  phone: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges - alle Änderungen:', changes);
    console.log('Aktuelles visible:', this.visible);
    console.log('Aktuelles contactToEdit:', this.contactToEdit);

    // Prüfe contactToEdit Änderungen
    if (changes['contactToEdit']) {
      console.log('contactToEdit hat sich geändert:', changes['contactToEdit']);
      const currentContact = changes['contactToEdit'].currentValue;
      
      if (currentContact) {
        this.name = currentContact.name || '';
        this.email = currentContact.email || '';
        this.phone = currentContact.phone || '';
        console.log('Formular mit Kontaktdaten gefüllt:', { name: this.name, email: this.email, phone: this.phone });
      } else {
        this.resetForm();
        console.log('Formular zurückgesetzt (contactToEdit ist null)');
      }
    }

    // Prüfe visible Änderungen
    if (changes['visible']) {
      if (this.visible && this.contactToEdit) {
        console.log('Modal geöffnet - Formular mit Kontaktdaten gesetzt');
        // Zusätzliche Sicherung: Formular nochmals mit aktuellen Daten füllen
        this.name = this.contactToEdit.name || '';
        this.email = this.contactToEdit.email || '';
        this.phone = this.contactToEdit.phone || '';
      } else if (!this.visible) {
        this.resetForm();
        console.log('Modal geschlossen – Formular zurückgesetzt');
      }
    }
  }

  onInputChange(field: string, value: string) {
    console.log(`Input changed - ${field}:`, value);
  }

  ngOnInit() {
    console.log('Modal ngOnInit - contactToEdit:', this.contactToEdit);
    
    // Sicherheitsprüfung: Falls contactToEdit bereits beim Init vorhanden ist
    if (this.contactToEdit) {
      this.name = this.contactToEdit.name || '';
      this.email = this.contactToEdit.email || '';
      this.phone = this.contactToEdit.phone || '';
      console.log('ngOnInit: Formular mit vorhandenen Daten gefüllt');
    }
  }

  ngDoCheck() {
    console.log('Modal ngDoCheck - contactToEdit:', this.contactToEdit);
  }

  /** Wird aufgerufen, wenn der Hintergrund des Modals angeklickt wird. */
  handleBackdropClick() {
    this.closed.emit();
  }

  /** Setzt alle Eingabefelder zurück. */
  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
  }

  /** Speichert den Kontakt in Firestore, wenn das Formular gültig ist. */
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

      alert('Contact saved successfully!');
      this.resetForm();
      this.handleBackdropClick();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving the contact.');
    }
  }

  /** Validiert Namen (nur Buchstaben, Leerzeichen, Bindestriche). */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /** Erzeugt Initialen aus dem Namen. */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

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

  getAvatarColor(name: string): string {
    const hash = name
      .split('')
      .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}