import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { fadeInOutInfo } from '../contacts/modal/modal.animations';
import { getAvatarColor, getInitials } from './avatar-utils';
import { Router } from '@angular/router';


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
  isActive2 = true;
  isActive3 = false;
  isAssignDropdownOpen = false;
  isCategoryDropdownOpen = false;
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

  selectedContacts: Contact[] = [];
  isContactSelected: boolean = false;

  isTitleFocused = false;
  isDescriptionFocused = false;
  isDueDateFocused = false;
  isCategoryInputFocused = false;
  isSubtaskFocused = false;

  showTitleError = false;
  showDueDateError = false;
  showCategoryError = false;

  private dropdownElement: HTMLElement | null = null;

  constructor(
    private contactService: ContactService,
    private firestore: Firestore,
    private router: Router
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

    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  getSelectedContactsString(): string {
    if (this.selectedContacts.length === 0) {
      return '';
    }

    const names = this.selectedContacts.map((contact) => contact.name);
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

    if (this.isAssignDropdownOpen) {
      setTimeout(() => {
        this.dropdownElement = document.querySelector('.assign-dropdown');
      }, 0);
    }
  }

  private handleDocumentClick(event: MouseEvent) {
    if (this.isAssignDropdownOpen && this.dropdownElement) {
      const target = event.target as HTMLElement;

      const clickedInside = this.dropdownElement.contains(target);

      const isInput = target.closest('.placeholder7');
      const isIcon = target.closest('.icon-category');

      if (!clickedInside && !isInput && !isIcon) {
        this.isAssignDropdownOpen = false;
      }
    }

    if (this.isCategoryDropdownOpen) {
      const target = event.target as HTMLElement;
      const categoryDropdown = document.querySelector('.category-modal');
      const clickedInsideCategory = categoryDropdown?.contains(target);
      const isCategoryInput = target.closest('.placeholder8');
      const isCategoryIcon = target.closest('.icon-category');

      if (!clickedInsideCategory && !isCategoryInput && !isCategoryIcon) {
        this.isCategoryDropdownOpen = false;
        this.isCategoryInputFocused = false;
        this.validateField('category');
      }
    }
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    if (!this.isCategoryDropdownOpen) {
      this.isCategoryInputFocused = false;
    }
  }

  onCategoryIconClick(event: Event) {
    event.stopPropagation();
    this.isCategoryInputFocused = true;
    this.toggleCategoryDropdown();
  }

  onCategoryBlur() {
    setTimeout(() => {
      if (!this.isCategoryDropdownOpen) {
        this.isCategoryInputFocused = false;
        this.validateField('category');
      }
    }, 100);
  }

  clearSubtaskInput() {
    this.subtaskText = '';
  }

  addSubtask() {
    if (this.subtaskText.trim()) {
      this.subtasks.push({
        title: this.subtaskText.trim(),
        done: false,
      });
      console.log('Subtask hinzugefügt:', this.subtaskText.trim());
      this.subtaskText = '';
    }
  }

  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }

  toggleSubtaskStatus(index: number) {
    this.subtasks[index].done = !this.subtasks[index].done;
    console.log('Subtask Status geändert:', this.subtasks[index]);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    this.showCategoryError = false;
    console.log('Ausgewählte Kategorie:', category);
  }

  validateField(fieldName: string) {
    switch (fieldName) {
      case 'title':
        this.showTitleError = !this.title.trim();
        break;
      case 'dueDate':
        this.showDueDateError = !this.dueDate;
        break;
      case 'category':
        this.showCategoryError = !this.selectedCategory;
        break;
    }
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
    this.validateField('title');
    this.validateField('dueDate');
    this.validateField('category');

    if (!this.isFormValid()) {
      this.showSuccessInfo = true;
      this.successMessage = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
      return;
    }

    const taskData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      progress: this.progress,
      assignedTo: this.selectedContacts.map((contact) => contact.name),
      category: this.selectedCategory,
      subtasks: this.subtasks,
      contacts: this.selectedContacts.map((contact) => contact.name),
      status: 'open',
    };

    try {
      const taskCollection = collection(this.firestore, 'tasks');
      await addDoc(taskCollection, taskData);
      
      this.resetForm();
      this.navigateToBoard();
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
    this.isActive2 = true;
    this.isActive3 = false;
    this.subtaskText = '';
    this.showTitleError = false;
    this.showDueDateError = false;
    this.showCategoryError = false;
  }

  navigateToBoard() {
  this.router.navigate(['/board']);
}
}