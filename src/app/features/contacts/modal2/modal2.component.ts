import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal2.animations';
import { ContactService } from '../contact-service/contact.service';

@Component({
  standalone: true,
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: [
    './modal2.component.scss',
    './modal2.responsive.scss',
    './modal2.responsive2.scss',
  ],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class Modal2Component implements OnChanges {
  /** Service für CRUD-Operationen auf Kontakten */
  private contactService = inject(ContactService);

  /** Steuert die Sichtbarkeit des Modals */
  @Input() visible = false;

  /** Optionaler Kontakt, der bearbeitet werden soll */
  @Input() contactToEdit: {
    name: string;
    email: string;
    phone: string;
    id?: string;
  } | null = null;

  /** Event: Modal wurde geschlossen */
  @Output() closed = new EventEmitter<void>();

  /** Event: Kontakt wurde gespeichert */
  @Output() contactSaved = new EventEmitter<void>();

  /** Eingabefelder */
  name = '';
  email = '';
  phone = '';
  avatarColor: string | null = null;

  /** Farben für Avatare */
  private readonly avatarColors = [
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
  /** True, wenn gerade ein Kontakt bearbeitet wird */
  showSuccessInfo = false;
  /**
   * Lifecycle-Hook: reagiert auf Änderungen der Input-Properties
   * @param changes geänderte Properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit']?.currentValue) {
      this.loadContactData(this.contactToEdit!);
    }

    if (changes['visible']?.currentValue === false) {
      this.resetForm();
    }
  }

  /**
   * Lädt die Kontaktdaten in die Formularfelder
   * @param contact Kontaktobjekt
   */
  private loadContactData(
    contact: NonNullable<typeof this.contactToEdit>
  ): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.avatarColor = contact.name ? this.getAvatarColor(contact.name) : null;
  }

  /** Handler für Klick auf den Hintergrund, schließt das Modal */
  handleBackdropClick(): void {
    this.closed.emit();
  }

  /** Setzt alle Formularfelder zurück */
  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.avatarColor = null;
  }

  /**
   * Speichert den Kontakt (neu oder bearbeitet)
   * @param form NgForm der Eingabemaske
   */
  async saveContact(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.markFormAsTouched(form);
      return;
    }

    try {
      // Gemeinsame Felder für neuen oder bestehenden Kontakt
      const contactData = {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        updatedAt: new Date(),
        color: this.avatarColor || this.getAvatarColor(this.name),
        initials: this.getInitials(this.name),
      };

      if (this.contactToEdit?.id) {
        // Update: vorhandenen Kontakt ändern
        await this.contactService.updateContact(
          this.contactToEdit.id,
          contactData
        );
      } else {
        // Neu: createdAt hinzufügen
        await this.contactService.addContact({
          ...contactData,
          createdAt: new Date(),
        });
      }

      this.showSuccessInfo = true;
      setTimeout(() => {
        this.resetForm();
        this.closed.emit();
        this.contactSaved.emit();
        this.showSuccessInfo = false;

      }, 2000);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  /** Markiert alle Formularfelder als "touched" */
  private markFormAsTouched(form: NgForm): void {
    Object.values(form.controls).forEach((control) => control.markAsTouched());
  }

  /**
   * Validiert den Namen mit einem regulären Ausdruck
   * @param name Name des Kontakts
   * @returns True, wenn der Name gültig ist
   */
  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  /**
   * Berechnet die Initialen des Namens für den Avatar
   * @param name Name des Kontakts
   * @returns 1–2 Buchstaben Initialen
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Berechnet die Avatar-Farbe basierend auf dem ersten Buchstaben des Namens
   * @param name Name des Kontakts
   * @returns Hex-Farbcode
   */
  getAvatarColor(name: string): string {
    if (!name?.trim()) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[
      Math.abs(firstCharCode) % this.avatarColors.length
    ];
  }

  /**
   * Aktualisiert die Avatar-Farbe, wenn sich der Name ändert
   */
  onNameChange(): void {
    if (this.name.length === 1 && !this.avatarColor) {
      this.avatarColor =
        this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
    }

    if (!this.name.length) {
      this.avatarColor = null;
    }
  }
}