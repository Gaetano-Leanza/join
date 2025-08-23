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
import { fadeInOutInfo } from './modal.animations';

import { Contact } from '../contact-model/contact.model';
import { ContactService } from '../contact-service/contact.service';

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: [
    './modal.component.scss',
    './modal.responsive.scss',
    './modal.responsive2.scss',
  ],
  animations: [slideInModal,fadeInOutInfo],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  /** Service für CRUD-Operationen auf Kontakten */
  private contactService = inject(ContactService);

  /** Kontakt, der bearbeitet werden soll */
  @Input() contactToEdit: Contact | null = null;

  /** Steuert die Sichtbarkeit des Modals */
  @Input() visible = false;

  /** Event: Modal wurde geschlossen */
  @Output() closed = new EventEmitter<void>();

  /** Event: Kontakt wurde gespeichert oder gelöscht */
  @Output() contactSaved = new EventEmitter<void>();

  /** Eingabefelder */
  name = '';
  email = '';
  phone = '';

  /** True, wenn gerade ein Kontakt bearbeitet wird */
  isEditing = false;

  /** ID des aktuellen Kontakts */
  currentContactId: string | null = null;

  /** Farben für Avatare */
  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  showSuccessInfo = false;
  successMessage = '';

  /**
   * Validiert den Namen mit einem regulären Ausdruck
   * @param name Name des Kontakts
   * @returns True, wenn der Name gültig ist
   */
  isValidName(name: string): boolean {
    return /^[A-Za-zäöüÄÖÜß\s\-']+$/.test(name.trim());
  }

  /** Lifecycle-Hook: Initialisierung */
  ngOnInit(): void {
    this.loadSelectedContact();
  }

  /**
   * Lifecycle-Hook: reagiert auf Änderungen der Input-Properties
   * @param changes geänderte Properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit']?.currentValue) {
      this.loadContactData(this.contactToEdit!);
      this.isEditing = true;
    } else if (
      changes['visible']?.currentValue &&
      !changes['visible'].previousValue
    ) {
      this.loadSelectedContact();
    }
  }

  /** Lädt den aktuell ausgewählten Kontakt aus dem Service */
  private loadSelectedContact(): void {
    const contactId = this.contactService.getSelectedContactId();
    if (contactId) {
      this.contactService.getContactById(contactId).subscribe({
        next: (contact) => contact && this.loadContactData(contact),
        error: (error) => console.error('Error loading contact:', error),
      });
    }
  }

  /**
   * Lädt die Kontaktdaten in die Formularfelder
   * @param contact Kontaktobjekt
   */
  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id as string;
    this.isEditing = !!contact.id;
  }

  /**
   * Aktualisiert das entsprechende Feld bei Input-Änderungen
   * @param field Feldname ('name', 'email' oder 'phone')
   * @param value Wert des Feldes
   */
  onInputChange(
    field: keyof Pick<Contact, 'name' | 'email' | 'phone'>,
    value: string
  ) {
    this[field] = value;
  }

  /** Handler für Klick auf den Hintergrund, schließt das Modal */
  handleBackdropClick() {
    this.closed.emit();
  }

  /** Setzt alle Formularfelder zurück */
  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
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
      const contactData = this.prepareContactData();

      if (this.isEditing && this.currentContactId) {
        await this.contactService.updateContact(
          this.currentContactId,
          contactData
        );
        this.successMessage = 'Contact successfully edited';
        this.showSuccessInfo = true;
        setTimeout(() => {
          this.showSuccessInfo = false;
          this.resetForm();
          this.closed.emit();
          this.contactSaved.emit();
        }, 2000);
        return;
      } else {
        await this.contactService.addContact(contactData);
        this.successMessage = 'Contact successfully added';
        this.showSuccessInfo = true;
        setTimeout(() => {
          this.showSuccessInfo = false;
          this.resetForm();
          this.closed.emit();
          this.contactSaved.emit();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  /** Löscht den aktuellen Kontakt und schließt das Modal */
  async deleteContactAndClose(): Promise<void> {
    if (!this.currentContactId) return;

    try {
      this.showSuccessInfo = true;
      // Modal erst nach Timeout schließen, damit Nachricht sichtbar bleibt
      setTimeout(async () => {
        await this.contactService.deleteContact(this.currentContactId!);
        this.showSuccessInfo = false;
              this.successMessage = 'Contact successfully deleted';

        this.resetForm();
        this.closed.emit();
        this.contactSaved.emit();
      }, 1500);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

  /** Markiert alle Formularfelder als "touched" */
  private markFormAsTouched(form: NgForm): void {
    Object.values(form.controls).forEach((control) => control.markAsTouched());
  }

  /** Bereitet die Kontaktdaten für den Service auf */
  private prepareContactData(): Omit<Contact, 'id'> {
    const trimmedName = this.name.trim();
    
    return {
      name: trimmedName,
      email: this.email.trim(),
      phone: this.phone.trim(),
      color: this.getAvatarColor(trimmedName),        // Neue Property hinzugefügt
      initials: this.getInitials(trimmedName),        // Neue Property hinzugefügt
      updatedAt: new Date(),
      ...(!this.isEditing && { createdAt: new Date() }),
    };
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
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}