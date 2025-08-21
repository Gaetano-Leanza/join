import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { ContactListComponent } from '../contacts/contact-list/contact-list.component';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ContactListComponent],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss', './add-task.responsive.scss'],
})
export class AddTaskComponent implements OnInit {
  isActive1 = false;
  isActive2 = false;
  isActive3 = false;

  isAssignDropdownOpen = false;
  isCategoryDropdownOpen = false;
  isSubtaskOpen = false;

  title: string = '';
  description: string = '';

  contacts: (Contact & { id: string })[] = [];
  topContacts: (Contact & { id: string })[] = [];

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

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);
      },
      error: (err) => console.error('Fehler beim Laden der Kontakte:', err),
    });
  }

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[
      name.trim().charCodeAt(0) % this.avatarColors.length
    ];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  toggleButton1() {
    this.isActive1 = !this.isActive1;
  }

  toggleButton2() {
    this.isActive2 = !this.isActive2;
  }

  toggleButton3() {
    this.isActive3 = !this.isActive3;
  }

  toggleAssignDropdown() {
    this.isAssignDropdownOpen = !this.isAssignDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleSubtaskIcon() {
    this.isSubtaskOpen = !this.isSubtaskOpen;
  }

  addTask() {
    if (this.title.trim()) {
      console.log('Neue Aufgabe:', {
        title: this.title,
        description: this.description,
        buttonStates: {
          button1: this.isActive1,
          button2: this.isActive2,
          button3: this.isActive3,
        },
        assignedContacts: this.topContacts,
      });

      this.title = '';
      this.description = '';
    } else {
      alert('Bitte gib einen Titel für die Aufgabe ein.');
    }
  }

  onContactSelected(contact: Contact) {
    console.log('Kontakt ausgewählt:', contact);
    // Hier könntest du z.B. selectedContacts in einem Array speichern
  }
}
