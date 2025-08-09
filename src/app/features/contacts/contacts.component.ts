import { Component, inject } from '@angular/core'; 
import { trigger, style, transition, animate } from '@angular/animations';
import { Contact } from './contact-model/contact.model';
import { ContactService } from './contact-service/contact.service';
import { Observable } from 'rxjs';
import { ModalComponent } from "./modal/modal.component";

/**
 * Komponente zur Anzeige und Verwaltung einer Kontaktliste.
 * 
 * Unterstützt Animationen, Auswahl eines Kontakts und Bearbeitung via Modal.
 */
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
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
          '200ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
  imports: [],
})
export class ContactsComponent {
  /** Instanz des ContactService für Datenzugriffe */
  private contactService = inject(ContactService);

  /** Observable mit der Liste aller Kontakte */
  contacts$: Observable<Contact[]> = this.contactService.getContacts();

  /** Der aktuell ausgewählte Kontakt */
  selectedContact?: Contact;

  /** Status, ob das Modal geöffnet ist */
  modalOpen = false;

  /**
   * Öffnet das Modal zum Bearbeiten eines Kontakts.
   * 
   * @param contact - Der zu bearbeitende Kontakt.
   */
  editContact(contact: Contact) {
    this.selectedContact = contact;
    this.modalOpen = true;
  }

  /**
   * Wählt einen Kontakt aus der Liste aus.
   * 
   * @param contact - Der ausgewählte Kontakt.
   */
  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }

  /**
   * Schließt das Modal und entfernt die Auswahl.
   */
  closeModal() {
    this.modalOpen = false;
    this.selectedContact = undefined;
  }
}
