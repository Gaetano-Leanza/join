import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ModalComponent } from '../modal/modal.component';
import { ContactService } from '../contact-service/contact.service';

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

  constructor(private contactService: ContactService) {}

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
   */
  getAvatarColor(name: string): string {
    const colors = [
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
    if (!name) return colors[0]; // Fallback für leeren String
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  /**
   * Öffnet das Modal.
   */
  openModal() {
    this.isModalVisible = true;
  }

  /**
   * Schließt das Modal.
   */
  closeModal() {
    this.isModalVisible = false;
  }
  /**
   * Löscht den aktuell ausgewählten Kontakt aus Firebase.
   */
  async onDeleteContact(): Promise<void> {
    console.log('onDeleteContact ausgelöst');
    console.trace();

    if (!this.selectedContact?.id) return;

    const confirmed = confirm(
      `Möchtest du den Kontakt "${this.selectedContact.name}" wirklich löschen?`
    );

    if (!confirmed) return;

    const success = await this.contactService.deleteContact(
      this.selectedContact.id
    );

    if (success) {
      alert('Kontakt erfolgreich gelöscht.');
      this.selectedContact = null;
      this.contactService.setSelectedContact(null);
    } else {
      alert('Fehler beim Löschen des Kontakts.');
    }
  }
}
