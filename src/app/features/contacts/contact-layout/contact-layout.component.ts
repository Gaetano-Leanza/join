import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ModalComponent } from '../modal/modal.component';

/**
 * Layout-Komponente für die Anzeige und Auswahl von Kontakten.
 *
 * Enthält eine Liste der Kontakte und zeigt Detailinformationen im Modal an.
 * Unterstützt Animationen für das Ein- und Ausblenden von Elementen.
 */
@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ModalComponent],
  templateUrl: './contact-layout.component.html',
  styleUrls: [
    './contact-layout.component.scss',
    './contact-layout.responsive.scss',
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ContactLayoutComponent {
  /**
   * Der aktuell ausgewählte Kontakt.
   * Wird `null`, wenn kein Kontakt ausgewählt ist.
   */
  selectedContact: Contact | null = null;

  /**
   * Flag, ob das Modal angezeigt wird oder nicht.
   */
  isModalVisible = false;

  /**
   * Setzt den übergebenen Kontakt als aktuell ausgewählten Kontakt.
   *
   * @param contact - Der Kontakt, der ausgewählt wird.
   */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;
  }

  /**
   * Ermittelt die Initialen eines Namens.
   *
   * @param name - Vollständiger Name des Kontakts.
   * @returns Die Großbuchstaben der Anfangsbuchstaben aller Namensteile.
   */
  getInitials(name: string): string {
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Bestimmt die Avatar-Farbe basierend auf dem Namen.
   *
   * Die Farbe wird als Hex-Farbcode zurückgegeben.
   *
   * @param name - Vollständiger Name des Kontakts.
   * @returns Ein Hex-Farbcode für den Avatar-Hintergrund.
   */
  getAvatarColor(name: string): string {
    const colors = ['#5c6bc0', '#007cee', '#4caf50', '#f44336', '#ff9800'];
    if (!name) return colors[0]; // Fallback für leeren String
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  /**
   * Öffnet das Modal (setzt `isModalVisible` auf true).
   */
  openModal() {
    this.isModalVisible = true;
  }

  /**
   * Schließt das Modal (setzt `isModalVisible` auf false).
   */
  closeModal() {
    this.isModalVisible = false;
  }
}
