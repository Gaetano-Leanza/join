import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  @Output() contactSelected = new EventEmitter<Contact>();

  contacts: Contact[] = [];
  groupedContacts: { [letter: string]: Contact[] } = {};

  constructor(private contactService: ContactService) {}

  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  ngOnInit(): void {
    this.contacts = this.contactService
      .getContacts()
      .sort((a, b) => a.name.localeCompare(b.name));
    this.groupContacts();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    const initials = parts.map((part) => part.charAt(0).toUpperCase());
    return initials.slice(0, 2).join('');
  }

  private groupContacts(): void {
    this.groupedContacts = {};
    for (const contact of this.contacts) {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!this.groupedContacts[letter]) {
        this.groupedContacts[letter] = [];
      }
      this.groupedContacts[letter].push(contact);
    }
  }

  onContactClick(contact: Contact): void {
    this.contactSelected.emit(contact);
  }
}
