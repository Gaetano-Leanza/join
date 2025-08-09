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
import { slideInModal } from './modal2.animations';

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
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: ['./modal2.component.scss'],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class Modal2Component implements OnChanges {
  /**
   * Gibt an, ob das Modal sichtbar ist.
   */
  @Input() visible = false;

  /**
   * Kontakt, der zum Bearbeiten vom Parent übergeben wird.
   */
  @Input() contactToEdit: {
    name: string;
    email: string;
    phone: string;
  } | null = null;

  /**
   * Event wird ausgelöst, wenn das Modal geschlossen wird.
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Event wird ausgelöst, wenn ein Kontakt erfolgreich gespeichert wurde.
   */
  @Output() contactSaved = new EventEmitter<void>();

  /** Eingabefeld: Name des Kontakts */
  name: string = '';

  /** Eingabefeld: Email des Kontakts */
  email: string = '';

  /** Eingabefeld: Telefonnummer des Kontakts */
  phone: string = '';

  /**
   * Lifecycle-Hook, um auf Änderungen der Inputs zu reagieren.
   * Synchronisiert Formularfelder mit dem übergebenen Kontakt.
   * Setzt Formular zurück, wenn Modal geschlossen wird.
   *
   * @param changes - Objekt mit den beobachteten Änderungen.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit'] && this.contactToEdit) {
      this.name = this.contactToEdit.name || '';
      this.email = this.contactToEdit.email || '';
      this.phone = this.contactToEdit.phone || '';
    }

    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.resetForm();
    }
  }

  /**
   * Wird aufgerufen, wenn der Hintergrund (Backdrop) des Modals angeklickt wird.
   * Löst das `closed` Event aus, um das Modal zu schließen.
   */
  handleBackdropClick() {
    this.closed.emit();
  }

  /**
   * Setzt alle Eingabefelder zurück auf leere Strings.
   */
  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
  }

  /**
   * Speichert den Kontakt in Firestore, wenn das Formular gültig ist.
   *
   * @param form - Formularreferenz zur Validierung.
   */
  async saveContact(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
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

      // Event emittieren, dass Kontakt gespeichert wurde
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving the contact.');
    }
  }

  /**
   * Validiert, ob ein Name nur Buchstaben, Leerzeichen und Bindestriche enthält.
   *
   * @param name - Der zu validierende Name.
   * @returns `true`, wenn der Name gültig ist, sonst `false`.
   */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /**
   * Erzeugt Initialen aus einem Namen (maximal zwei Buchstaben).
   *
   * @param name - Vollständiger Name.
   * @returns Die Großbuchstaben der ersten zwei Namensbestandteile.
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Liste der verfügbaren Avatar-Hintergrundfarben.
   */
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
   * Berechnet eine Farbwahl basierend auf dem Hash des Namens.
   *
   * @param name - Der Name, aus dem die Farbe bestimmt wird.
   * @returns Ein Hex-Farbcode aus `avatarColors`.
   */
  getAvatarColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
