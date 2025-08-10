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

/**
 * Firebase-Konfigurationsobjekt für die App-Initialisierung
 * @constant {Object}
 */
const firebaseConfig = {
  apiKey: 'AIzaSyD1fse1ML6Ie-iFClg_2Ukr-G1FEeQUHac',
  authDomain: 'join-e1f64.firebaseapp.com',
  projectId: 'join-e1f64',
  storageBucket: 'join-e1f64.appspot.com',
  messagingSenderId: '969006467578',
  appId: '1:969006467578:web:52d944e5ed232984783c43',
  measurementId: 'G-Y12RXDEX3N',
};

/** Firebase App Instanz */
const app = initializeApp(firebaseConfig);

/** Firestore Datenbank Instanz */
const db = getFirestore(app);

/**
 * Modal-Komponente zum Erstellen und Bearbeiten von Kontakten
 * 
 * Diese Komponente stellt ein modales Dialogfenster bereit, in dem Benutzer
 * Kontaktinformationen eingeben oder bearbeiten können. Die Daten werden
 * in Firebase Firestore gespeichert und können aus dem Local Storage geladen werden.
 * 
 * @export
 * @class ModalComponent
 * @implements {OnChanges}
 * @implements {OnInit}
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
  /**
   * Kontakt-Objekt, das bearbeitet werden soll
   * @type {Contact | null}
   * @memberof ModalComponent
   */
  @Input() contactToEdit: Contact | null = null;

  /**
   * Steuert die Sichtbarkeit des Modals
   * @type {boolean}
   * @memberof ModalComponent
   */
  @Input() visible = false;

  /**
   * Event Emitter für das Schließen des Modals
   * @type {EventEmitter<void>}
   * @memberof ModalComponent
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Event Emitter für erfolgreich gespeicherte Kontakte
   * @type {EventEmitter<void>}
   * @memberof ModalComponent
   */
  @Output() contactSaved = new EventEmitter<void>();

  /**
   * Name des Kontakts
   * @type {string}
   * @memberof ModalComponent
   */
  name: string = '';

  /**
   * E-Mail-Adresse des Kontakts
   * @type {string}
   * @memberof ModalComponent
   */
  email: string = '';

  /**
   * Telefonnummer des Kontakts
   * @type {string}
   * @memberof ModalComponent
   */
  phone: string = '';

  /**
   * Array mit verfügbaren Avatar-Farben
   * @type {string[]}
   * @memberof ModalComponent
   */
  avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  /**
   * Lifecycle-Hook: Wird beim Initialisieren der Komponente ausgeführt
   * Lädt Daten aus dem Local Storage
   * 
   * @memberof ModalComponent
   */
  ngOnInit(): void {
    this.loadFromLocalStorage();
  }

  /**
   * Lifecycle-Hook: Reagiert auf Änderungen der Input-Properties
   * Lädt Kontaktdaten wenn das Modal sichtbar wird oder ein Kontakt bearbeitet wird
   * 
   * @param {SimpleChanges} changes - Objekt mit geänderten Properties
   * @memberof ModalComponent
   */
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

  /**
   * Lädt Kontaktdaten aus dem Local Storage
   * Versucht einen gespeicherten Kontakt unter dem Schlüssel 'selectedContact' zu laden
   * 
   * @private
   * @memberof ModalComponent
   */
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

  /**
   * Behandelt Änderungen in Eingabefeldern
   * Loggt die Änderungen für Debugging-Zwecke
   * 
   * @param {string} field - Name des geänderten Feldes
   * @param {string} value - Neuer Wert des Feldes
   * @memberof ModalComponent
   */
  onInputChange(field: string, value: string) {
    console.log(`Eingabe geändert - ${field}:`, value);
  }

  /**
   * Behandelt Klicks auf den Hintergrund des Modals
   * Schließt das Modal durch Emission des closed Events
   * 
   * @memberof ModalComponent
   */
  handleBackdropClick() {
    this.closed.emit();
  }

  /**
   * Setzt alle Formularfelder zurück
   * Leert Name, E-Mail und Telefonnummer
   * 
   * @memberof ModalComponent
   */
  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
  }

  /**
   * Speichert einen neuen Kontakt in Firebase Firestore
   * Validiert das Formular vor dem Speichern und zeigt entsprechende Meldungen an
   * 
   * @param {NgForm} form - Angular Formulasr-Referenz für Validierung
   * @returns {Promise<void>} Promise für asynchrone Speicheroperation
   * @memberof ModalComponent
   */
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

  /**
   * Validiert einen Namen mit Regex
   * Erlaubt nur Buchstaben, Leerzeichen und Bindestriche
   * 
   * @param {string} name - Zu validierender Name
   * @returns {boolean} true wenn der Name gültig ist
   * @memberof ModalComponent
   */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /**
   * Generiert Initialen aus einem Namen
   * Nimmt die ersten Buchstaben der ersten beiden Wörter
   * 
   * @param {string} name - Name für die Initialen-Generierung
   * @returns {string} Initialen (maximal 2 Zeichen)
   * @memberof ModalComponent
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Bestimmt eine Avatar-Farbe basierend auf dem Namen
   * Verwendet den ASCII-Wert des ersten Zeichens für eine konsistente Farbauswahl
   * 
   * @param {string} name - Name für die Farbberechnung
   * @returns {string} Hex-Farbcode für den Avatar
   * @memberof ModalComponent
   */
  getAvatarColor(name: string): string {
    if (!name || name.trim().length === 0) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}