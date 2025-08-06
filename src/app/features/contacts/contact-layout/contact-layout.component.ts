import { Component } from '@angular/core';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ModalComponent],
  templateUrl: './contact-layout.component.html',
  styleUrls: ['./contact-layout.component.scss'],
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
  selectedContact: Contact | null = null;
  isModalVisible = false;

  selectContact(contact: Contact): void {
    console.log('selectContact aufgerufen mit:', contact);
    this.selectedContact = contact;
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#5c6bc0', '#007cee', '#4caf50', '#f44336', '#ff9800'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return colors[hash % colors.length];
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }
}
