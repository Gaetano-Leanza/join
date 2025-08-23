import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { ContactListComponent } from '../contacts/contact-list/contact-list.component';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ContactListComponent, FormsModule],
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
  selectedContact: Contact | null = null;
  title: string = '';
  description: string = '';
  dueDate: string = '';
  contacts: (Contact & { id: string })[] = [];
  topContacts: (Contact & { id: string })[] = [];
  selectedCategory: string = '';
  hoveredOption: string = '';
  subtaskText: string = '';
  subtasks: string[] = [];
  defaultSubtasks: string[] = ['Contact Form', 'Write Legal Imprint'];
  currentIndex: number = 0;

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

  constructor(
    private contactService: ContactService,
    private firestore: Firestore
  ) {}

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
    this.isActive1 = true;
    this.isActive2 = false;
    this.isActive3 = false;
    console.log('Button 1 ist aktiv');
  }

  toggleButton2() {
    this.isActive1 = false;
    this.isActive2 = true;
    this.isActive3 = false;
    console.log('Button 2 ist aktiv');
  }

  toggleButton3() {
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = true;
    console.log('Button 3 ist aktiv');
  }

  toggleAssignDropdown() {
    this.isAssignDropdownOpen = !this.isAssignDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleSubtaskIcon() {
    this.isSubtaskOpen = !this.isSubtaskOpen;

    if (this.isSubtaskOpen && this.currentIndex < this.defaultSubtasks.length) {
      this.subtaskText = this.defaultSubtasks[this.currentIndex];
    } else if (!this.isSubtaskOpen) {
      this.subtaskText = '';
    }
  }

  addSubtask() {
    if (this.subtaskText.trim()) {
      this.subtasks.push(this.subtaskText.trim());
      console.log(this.subtaskText.trim());

      this.currentIndex++;

      if (this.currentIndex < this.defaultSubtasks.length) {
        this.subtaskText = this.defaultSubtasks[this.currentIndex];
      } else {
        this.subtaskText = '';
        this.isSubtaskOpen = false;
      }
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    console.log('Ausgewählte Kategorie:', category);
  }

  get priority(): string {
    if (this.isActive1) return 'high';
    if (this.isActive2) return 'medium';
    if (this.isActive3) return 'low';
    return 'medium';
  }

  get progress(): string {
    return 'To Do';
  }

  isFormValid(): boolean {
    return (
      this.title.trim() !== '' &&
      this.dueDate.trim() !== '' &&
      this.selectedCategory !== '' &&
      this.selectedContact !== null &&
      (this.isActive1 || this.isActive2 || this.isActive3)
    );
  }

  async createTask() {
    if (!this.isFormValid()) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    const taskData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      progress: this.progress,
      assignedTo: this.selectedContact!.name,
      category: this.selectedCategory,
      subtasks: this.subtasks
    };

    try {
      const taskCollection = collection(this.firestore, 'tasks');
      await addDoc(taskCollection, taskData);
      console.log('Task erfolgreich erstellt!');
      this.resetForm();
    } catch (error) {
      console.error('Fehler beim Erstellen des Tasks: ', error);
    }
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.selectedCategory = '';
    this.selectedContact = null;
    this.subtasks = [];
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = false;
    this.isSubtaskOpen = false;
    this.subtaskText = '';
    this.currentIndex = 0;
  }

  onContactSelected(contact: Contact) {
    this.selectedContact = contact;
    this.isAssignDropdownOpen = false;
  }
}