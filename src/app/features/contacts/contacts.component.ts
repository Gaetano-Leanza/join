import { Component, inject } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Contact } from './contact-model/contact.model';
import { ContactService } from './contact-service/contact.service';
import { Observable } from 'rxjs';

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
})
export class ContactsComponent {
  private contactService = inject(ContactService);
  contacts$: Observable<Contact[]> = this.contactService.getContacts();

  selectedContact?: Contact;

  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }
}
