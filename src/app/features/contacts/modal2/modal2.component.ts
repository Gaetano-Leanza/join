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
import { deleteDoc, doc } from 'firebase/firestore';
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
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: ['./modal2.component.scss'],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class Modal2Component implements OnChanges {
  /** Sichtbarkeit des Modals */
  @Input() visible = false;

  /** Kontakt, der ggf. zum Bearbeiten gesetzt wird */
  @Input() contactToEdit: {
    name: string;
    email: string;
    phone: string;
  } | null = null;

  /** Event, das ausgelöst wird, wenn das Modal geschlossen wird */
  @Output() closed = new EventEmitter<void>();

  /** Event, das ausgelöst wird, wenn ein Kontakt gespeichert wurde */
  @Output() contactSaved = new EventEmitter<void>();

  /** Eingabefelder */
  name: string = '';
  email: string = '';
  phone: string = '';

  /** Avatar-Hintergrundfarbe, wird einmalig gesetzt */
  avatarColor: string | null = null;

  /** Farbpalette für Avatare */
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
   * Lifecycle-Hook: reagiert auf Input-Änderungen
   * @param changes Änderungen
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit'] && this.contactToEdit) {
      this.name = this.contactToEdit.name || '';
      this.email = this.contactToEdit.email || '';
      this.phone = this.contactToEdit.phone || '';

      // Beim Laden eines Kontakts Farbe anhand des Namens bestimmen
      if (this.name.length > 0) {
        this.avatarColor = this.getAvatarColor(this.name);
      } else {
        this.avatarColor = null;
      }
    }

    // Beim Schließen Formular zurücksetzen
    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.resetForm();
    }
  }

  /**
   * Handler für Klick auf den Hintergrund (schließt das Modal)
   */
  handleBackdropClick() {
    this.closed.emit();
  }

  /**
   * Formularfelder zurücksetzen
   */
  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.avatarColor = null;
  }

  /**
   * Speichert Kontakt in Firestore, wenn Formular gültig ist
   * @param form Formularreferenz
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

      
      this.resetForm();
      this.handleBackdropClick();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  /**
   * Validiert, ob der Name nur erlaubte Zeichen enthält
   * @param name Eingabename
   * @returns true wenn gültig
   */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /**
   * Ermittelt Initialen aus einem Namen
   * @param name Voller Name
   * @returns Initialen (max. 2 Buchstaben)
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Berechnet anhand des Namens eine Farbe aus der Farbpalette.
   * Wird beim Laden eines Kontakts genutzt.
   * @param name Name
   * @returns Farbe als Hex-String
   */
  getAvatarColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  /**
   * Wird beim Tippen im Namensfeld aufgerufen.
   * Setzt beim ersten Buchstaben eine zufällige Farbe.
   * Setzt Farbe zurück, wenn Name gelöscht wird.
   */
  onNameChange() {
    if (this.name.length === 1 && this.avatarColor === null) {
      const randomIndex = Math.floor(Math.random() * this.avatarColors.length);
      this.avatarColor = this.avatarColors[randomIndex];
    }

    if (this.name.length === 0) {
      this.avatarColor = null;
    }
  }


  
}