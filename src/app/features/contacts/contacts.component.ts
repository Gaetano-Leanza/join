import { Component } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Contact } from './contact-model/contact.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ])
  ]
})
export class ContactsComponent {
  selectedContact?: Contact;

  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }
}
