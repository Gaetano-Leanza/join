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

/**
 * @interface Subtask
 * Represents a single subtask item.
 */
interface Subtask {
  title: string;
  done: boolean;
}

/**
 * @Component AddTaskComponent
 * This component provides a form to create a new task.
 * It can be used as a standalone page or as a modal dialog.
 */
@Component({
  selector: 'app-add-task',
  standalone: true,
  animations: [fadeInOutInfo],
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss', './add-task.responsive.scss'],
})
export class AddTaskComponent implements OnInit, OnDestroy {
  /** Emits an event to close the component, typically when used as a modal. */
  @Output() close = new EventEmitter<void>();
  /** Determines if the header should be displayed. */
  @Input() showHeader: boolean = true;
  /** Determines if the reset button should be displayed. */
  @Input() showReset: boolean = true;
  /** Determines if the create task button should be displayed. */
  @Input() showCreate: boolean = true;
  /** Emits an event when a new task has been successfully created. */
  @Output() taskCreated = new EventEmitter<void>();
  /** Indicates if the component is being rendered inside a modal. */
  @Input() isModal = false;

  /** Reference to the getInitials utility function. */
  getInitials = getInitials;
  /** Reference to the getAvatarColor utility function. */
  getAvatarColor = getAvatarColor;
  /** State for the 'urgent' priority button. */
  isActive1 = false;
  /** State for the 'medium' priority button. */
  isActive2 = true;
  /** State for the 'low' priority button. */
  isActive3 = false;
  /** State for the assign contacts dropdown. */
  isAssignDropdownOpen = false;
  /** State for the category dropdown. */
  isCategoryDropdownOpen = false;
  /** The currently selected contact (legacy, see selectedContacts). */
  selectedContact: Contact | null = null;
  /** The title of the task. */
  title: string = '';
  /** The description of the task. */
  description: string = '';
  /** The due date of the task. */
  dueDate: string = '';
  /** Array of all available contacts. */
  contacts: (Contact & { id: string })[] = [];
  /** A subset of contacts to display at the top of the list. */
  topContacts: (Contact & { id: string })[] = [];
  /** The selected category for the task. */
  selectedCategory: string = '';
  /** The currently hovered option in a dropdown. */
  hoveredOption: string = '';
  /** The text for a new subtask. */
  subtaskText: string = '';
  /** Array of subtasks for the current task. */
  subtasks: Subtask[] = [];
  /** The index of the subtask currently being edited. */
  editingIndex: number | null = null;
  /** Stores the previous value of a subtask before editing. */
  previousValue: string = '';

  /** Array of contacts assigned to the task. */
  selectedContacts: Contact[] = [];
  /** Flag indicating if at least one contact is selected. */
  isContactSelected: boolean = false;

  /** Focus state for the title input. */
  isTitleFocused = false;
  /** Focus state for the description input. */
  isDescriptionFocused = false;
  /** Focus state for the due date input. */
  isDueDateFocused = false;
  /** Focus state for the category input. */
  isCategoryInputFocused = false;
  /** Focus state for the subtask input. */
  isSubtaskFocused = false;

  /** Error visibility state for the title field. */
  showTitleError = false;
  /** Error visibility state for the due date field. */
  showDueDateError = false;
  /** Error visibility state for the category field. */
  showCategoryError = false;

  private dropdownElement: HTMLElement | null = null;
  
  /** State for showing a success or info message popup. */
  showSuccessInfo = false;
  /** The message to be displayed in the popup. */
  successMessage = '';

  /**
   * @constructor
   * @param {ContactService} contactService - Service to manage contact data.
   * @param {Firestore} firestore - Firestore instance for database operations.
   * @param {Router} router - Angular router for navigation.
   */
  constructor(
    private contactService: ContactService,
    private firestore: Firestore,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);
      },
      error: (err) => console.error('Error loading contacts:', err),
    });

    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   */
  ngOnDestroy() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  /**
   * Returns a comma-separated string of selected contact names.
   * @returns {string} The string of names.
   */
  getSelectedContactsString(): string {
    if (this.selectedContacts.length === 0) {
      return '';
    }
    const names = this.selectedContacts.map((contact) => contact.name);
    return names.join(', ');
  }

  /**
   * Sets the task priority to 'urgent'.
   */
  toggleButton1() {
    this.isActive1 = true;
    this.isActive2 = false;
    this.isActive3 = false;
  }

  /**
   * Sets the task priority to 'medium'.
   */
  toggleButton2() {
    this.isActive1 = false;
    this.isActive2 = true;
    this.isActive3 = false;
  }

  /**
   * Sets the task priority to 'low'.
   */
  toggleButton3() {
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = true;
  }

  /**
   * Toggles the visibility of the contact assignment dropdown.
   * @param {Event} [event] - The click event to stop propagation.
   */
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
  
  /**
   * Handles global click events to close dropdowns when clicking outside.
   * @param {MouseEvent} event - The mouse event.
   */
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

  /**
   * Toggles the visibility of the category dropdown.
   */
  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    if (!this.isCategoryDropdownOpen) {
      this.isCategoryInputFocused = false;
    }
  }

  /**
   * Handles the click event on the category dropdown icon.
   * @param {Event} event - The click event.
   */
  onCategoryIconClick(event: Event) {
    event.stopPropagation();
    this.isCategoryInputFocused = true;
    this.toggleCategoryDropdown();
  }

  /**
   * Handles the blur event for the category input to manage focus state.
   */
  onCategoryBlur() {
    setTimeout(() => {
      if (!this.isCategoryDropdownOpen) {
        this.isCategoryInputFocused = false;
        this.validateField('category');
      }
    }, 100);
  }

  /**
   * Clears the subtask input field.
   */
  clearSubtaskInput() {
    this.subtaskText = '';
  }

  /**
   * Adds a new subtask to the subtasks list.
   */
  addSubtask() {
    if (this.subtaskText.trim()) {
      this.subtasks.push({
        title: this.subtaskText.trim(),
        done: false,
      });
      this.subtaskText = '';
    }
  }

  /**
   * Removes a subtask from the list.
   * @param {number} index - The index of the subtask to remove.
   */
  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }

  /**
   * Starts editing a subtask.
   * @param {number} index - The index of the subtask to edit.
   */
  startEditing(index: number) {
    this.editingIndex = index;
    this.previousValue = this.subtasks[index].title;
  }

  /**
   * Stops editing a subtask and saves the changes.
   */
  stopEditing() {
    if (this.editingIndex !== null) {
      if (!this.subtasks[this.editingIndex].title.trim()) {
        this.subtasks[this.editingIndex].title = this.previousValue;
      }
      this.editingIndex = null;
    }
  }

  /**
   * Cancels editing a subtask and reverts to the previous value.
   */
  cancelEditing() {
    if (this.editingIndex !== null) {
      this.subtasks[this.editingIndex].title = this.previousValue;
      this.editingIndex = null;
    }
  }

  /**
   * Selects a category for the task.
   * @param {string} category - The category to select.
   */
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    this.showCategoryError = false;
  }

  /**
   * Validates a specific form field and shows an error if it's invalid.
   * @param {string} fieldName - The name of the field to validate.
   */
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

  /**
   * Gets the current priority based on the active button.
   * @returns {string} The priority ('urgent', 'medium', or 'low').
   */
  get priority(): string {
    if (this.isActive1) return 'urgent';
    if (this.isActive2) return 'medium';
    if (this.isActive3) return 'low';
    return 'medium';
  }

  /**
   * Gets the initial progress status for the new task.
   * @returns {string} The progress status ('toDo').
   */
  get progress(): string {
    return 'toDo';
  }

  /**
   * Checks if the entire form is valid.
   * @returns {boolean} True if the form is valid, otherwise false.
   */
  isFormValid(): boolean {
    return (
      this.title.trim() !== '' &&
      this.dueDate.trim() !== '' &&
      this.selectedCategory !== '' &&
      this.selectedContacts.length > 0 &&
      (this.isActive1 || this.isActive2 || this.isActive3)
    );
  }

  /**
   * Toggles the selection of a contact for task assignment.
   * @param {Contact} contact - The contact to toggle.
   */
  toggleContactSelection(contact: Contact): void {
    const index = this.selectedContacts.findIndex((c) => c.id === contact.id);
    if (index > -1) {
      this.selectedContacts.splice(index, 1);
    } else {
      this.selectedContacts.push(contact);
    }
    this.isContactSelected = this.selectedContacts.length > 0;
  }

  /**
   * Checks if a contact is currently selected.
   * @param {Contact} contact - The contact to check.
   * @returns {boolean} True if the contact is selected, otherwise false.
   */
  isContactChecked(contact: Contact): boolean {
    return this.selectedContacts.some((c) => c.id === contact.id);
  }

  /**
   * Creates a new task and saves it to Firestore.
   */
  async createTask() {
    this.validateField('title');
    this.validateField('dueDate');
    this.validateField('category');

    if (!this.isFormValid()) {
      this.showSuccessInfo = true;
      this.successMessage = 'Please fill in all required fields';
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
      this.taskCreated.emit();
    } catch (error) {
      console.error('Error creating the task: ', error);
    }
  }

  /**
   * Resets all form fields to their initial state.
   */
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
    this.editingIndex = null;
  }

  /**
   * Navigates the user to the main board page.
   */
  navigateToBoard() {
    this.router.navigate(['/board']);
  }
}