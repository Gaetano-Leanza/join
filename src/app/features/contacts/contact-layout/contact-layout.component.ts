import { Component } from '@angular/core';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent],
  templateUrl: './contact-layout.component.html',
  styleUrls: ['./contact-layout.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ContactLayoutComponent {
  selectedContact: Contact | null = null;

  selectContact(contact: Contact): void {
    console.log('selectContact aufgerufen mit:', contact);
    this.selectedContact = contact;
  }
}
