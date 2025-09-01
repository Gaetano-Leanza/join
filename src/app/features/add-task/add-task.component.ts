import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { fadeInOutInfo } from '../contacts/modal/modal.animations';
import { getAvatarColor, getInitials } from './avatar-utils';

interface Subtask {
  title: string;
  done: boolean;
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  animations: [fadeInOutInfo],
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss', './add-task.responsive.scss'],
})
export class AddTaskComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Input() showHeader: boolean = true;
  @Input() showReset: boolean = true;
  @Input() showCreate: boolean = true;

  getInitials = getInitials;
  getAvatarColor = getAvatarColor;
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
  subtasks: Subtask[] = [];
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

  // Neue Properties für Kontaktauswahl
  selectedContacts: Contact[] = [];
  isContactSelected: boolean = false;

  private dropdownElement: HTMLElement | null = null;

  constructor(
    private contactService: ContactService,
    private firestore: Firestore
  ) {}

  showSuccessInfo = false;
  successMessage = '';

  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);
      },
      error: (err) => console.error('Fehler beim Laden der Kontakte:', err),
    });

    // Event-Listener für Klicks außerhalb des Dropdowns
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy() {
    // Event-Listener entfernen, wenn Komponente zerstört wird
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  getSelectedContactsString(): string {
    if (this.selectedContacts.length === 0) {
      return '';
    }
    
    const names = this.selectedContacts.map(contact => contact.name);
    return names.join(', ');
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

  toggleAssignDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAssignDropdownOpen = !this.isAssignDropdownOpen;
    
    // Dropdown-Element referenzieren
    if (this.isAssignDropdownOpen) {
      setTimeout(() => {
        this.dropdownElement = document.querySelector('.assign-dropdown');
      }, 0);
    }
  }

  private handleDocumentClick(event: MouseEvent) {
    if (this.isAssignDropdownOpen && this.dropdownElement) {
      const target = event.target as HTMLElement;
      
      // Prüfen, ob das angeklickte Element innerhalb des Dropdowns liegt
      const clickedInside = this.dropdownElement.contains(target);
      
      // Prüfen, ob auf den Input oder das Icon geklickt wurde
      const isInput = target.closest('.placeholder7');
      const isIcon = target.closest('.icon-category');
      
      // Wenn außerhalb geklickt wurde und nicht auf Input/Icon, Dropdown schließen
      if (!clickedInside && !isInput && !isIcon) {
        this.isAssignDropdownOpen = false;
      }
    }
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
      this.subtasks.push({
        title: this.subtaskText.trim(),
        done: true,
      });
      console.log(
        'Subtask hinzugefügt:',
        this.subtaskText.trim(),
        'done: true'
      );
      this.currentIndex++;
      if (this.currentIndex < this.defaultSubtasks.length) {
        this.subtaskText = this.defaultSubtasks[this.currentIndex];
      } else {
        this.subtaskText = '';
        this.isSubtaskOpen = false;
      }
    }
  }

  toggleSubtaskStatus(index: number) {
    this.subtasks[index].done = !this.subtasks[index].done;
    console.log('Subtask Status geändert:', this.subtasks[index]);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    console.log('Ausgewählte Kategorie:', category);
  }

  get priority(): string {
    if (this.isActive1) return 'urgent';
    if (this.isActive2) return 'medium';
    if (this.isActive3) return 'low';
    return 'medium';
  }

  get progress(): string {
    return 'toDo';
  }

  isFormValid(): boolean {
    return (
      this.title.trim() !== '' &&
      this.dueDate.trim() !== '' &&
      this.selectedCategory !== '' &&
      this.selectedContacts.length > 0 &&
      (this.isActive1 || this.isActive2 || this.isActive3)
    );
  }

  toggleContactSelection(contact: Contact): void {
    const index = this.selectedContacts.findIndex((c) => c.id === contact.id);

    if (index > -1) {
      this.selectedContacts.splice(index, 1);
    } else {
      this.selectedContacts.push(contact);
    }

    this.isContactSelected = this.selectedContacts.length > 0;
    console.log(
      'Ausgewählte Kontakte:',
      this.selectedContacts.map((c) => c.name)
    );
  }

  isContactChecked(contact: Contact): boolean {
    return this.selectedContacts.some((c) => c.id === contact.id);
  }

  async createTask() {
    if (!this.isFormValid()) {
      this.showSuccessInfo = true;
      this.successMessage = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
      return;
    }

    // Wenn keine Subtasks hinzugefügt -> default false Subtasks
    let subtasksToSave =
      this.subtasks.length > 0
        ? this.subtasks
        : this.defaultSubtasks.map((title) => ({ title, done: false }));

    const taskData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      progress: this.progress,
      assignedTo: this.selectedContacts.map((contact) => contact.name),
      category: this.selectedCategory,
      subtasks: subtasksToSave,
      contacts: this.selectedContacts.map((contact) => contact.name),
      status: 'open',
    };

    try {
      const taskCollection = collection(this.firestore, 'tasks');
      await addDoc(taskCollection, taskData);
      this.successMessage = 'Task erfolgreich erstellt!';
      this.showSuccessInfo = true;
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
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
    this.selectedContacts = [];
    this.isContactSelected = false;
    this.subtasks = [];
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = false;
    this.isSubtaskOpen = false;
    this.subtaskText = '';
    this.currentIndex = 0;
  }
}