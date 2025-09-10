import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { fadeInOutInfo } from '../contacts/modal/modal.animations';
import { getAvatarColor, getInitials } from './avatar-utils';
import { Task, TaskService } from '../../services/task.service';

/**
 * @interface Subtask
 * Represents the structure of a single subtask.
 */
interface Subtask {
  title: string;
  done: boolean;
}

/**
 * @Component AddTaskMobileComponent
 * A component for adding or editing tasks, optimized for mobile views.
 */
@Component({
  selector: 'app-add-task-mobile',
  standalone: true,
  animations: [fadeInOutInfo],
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task-mobile.component.html',
  styleUrls: ['./add-task-mobile.component.scss'],
})
export class AddTaskMobileComponent implements OnInit, OnChanges {
  /** Emits an event to close the component. */
  @Output() close = new EventEmitter<void>();
  /** Emits the updated task data after a successful edit. */
  @Output() taskUpdated = new EventEmitter<Task>();

  /** Determines whether the component's header is visible. */
  @Input() showHeader: boolean = true;
  /** Determines whether the reset button is visible. */
  @Input() showReset: boolean = true;
  /** Determines whether the create button is visible. */
  @Input() showCreate: boolean = true;
  /** Flag to indicate if the component is in edit mode. */
  @Input() editMode: boolean = false;
  /** The task object to be edited. Passed as input when in edit mode. */
  @Input() taskToEdit: Task | null = null;

  /** Reference to the getInitials utility function for template access. */
  getInitials = getInitials;
  /** Reference to the getAvatarColor utility function for template access. */
  getAvatarColor = getAvatarColor;
  /** State for the 'urgent' priority button. */
  isActive1 = false;
  /** State for the 'medium' priority button. */
  isActive2 = false;
  /** State for the 'low' priority button. */
  isActive3 = false;
  /** Focus state for the subtask input field. */
  isSubtaskFocused = false;
  /** Stores the previous value of a subtask before editing. */
  previousSubtaskValue = '';
  /** State for the assign contacts dropdown. */
  isAssignDropdownOpen = false;
  /** State for the category dropdown. */
  isCategoryDropdownOpen = false;
  /** State for the subtask input section. */
  isSubtaskOpen = false;
  /** The currently selected contact. */
  selectedContact: Contact | null = null;
  /** The title of the task. */
  title: string = '';
  /** The description of the task. */
  description: string = '';
  /** The due date of the task. */
  dueDate: string = '';
  /** List of all available contacts. */
  contacts: (Contact & { id: string })[] = [];
  /** A subset of top contacts for quick selection. */
  topContacts: (Contact & { id: string })[] = [];
  /** The selected category for the task. */
  selectedCategory: string = '';
  /** The currently hovered option in a dropdown. */
  hoveredOption: string = '';
  /** The text for a new subtask. */
  subtaskText: string = '';
  /** The list of subtasks for the current task. */
  subtasks: Subtask[] = [];
  /** Default subtask suggestions. */
  defaultSubtasks: string[] = ['Contact Form', 'Write Legal Imprint'];
  /** The current index for default subtask suggestions. */
  currentIndex: number = 0;
  /** The list of contacts selected for the task. */
  selectedContacts: Contact[] = [];
  /** Flag indicating if at least one contact is selected. */
  isContactSelected: boolean = false;
  /** Flag to show a success/info message popup. */
  showSuccessInfo = false;
  /** The message to display in the popup. */
  successMessage = '';
  /** Flag to show validation errors on the form. */
  showError = false;
  /** Tracks validation error for the title field. */
  titleError = false;
  /** Tracks validation error for the due date field. */
  dueDateError = false;
  /** Tracks validation error for the category field. */
  categoryError = false;
  /** Tracks validation error for the priority selection. */
  priorityError = false;
  /** The index of the subtask currently being edited. */
  editSubtaskIndex: number | null = null;

  /**
   * @constructor
   * @param {ContactService} contactService Service for fetching contact data.
   * @param {Firestore} firestore Firestore instance for database interaction.
   * @param {TaskService} taskService Service for task-related operations.
   */
  constructor(
    private contactService: ContactService,
    private firestore: Firestore,
    private taskService: TaskService
  ) {}

  /**
   * Initializes the component by fetching contacts and populating the form if in edit mode.
   */
  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);
        if (this.editMode && this.taskToEdit) {
          this.populateFormWithTaskData(this.taskToEdit);
        }
      },
      error: (err) => console.error('Error loading contacts:', err),
    });
  }

  /**
   * A lifecycle hook that is called when any data-bound property of a directive changes.
   * @param {SimpleChanges} changes The changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['taskToEdit'] &&
      changes['taskToEdit'].currentValue &&
      this.editMode
    ) {
      if (this.contacts.length > 0) {
        this.populateFormWithTaskData(changes['taskToEdit'].currentValue);
      }
    }
    if (changes['editMode'] && !changes['editMode'].currentValue) {
      this.resetForm();
    }
  }

  /**
   * Populates the form fields with data from an existing task for editing.
   * @param {Task} task The task to be edited.
   */
  private populateFormWithTaskData(task: Task) {
    this.title = task.title || '';
    this.description = task.description || '';
    this.dueDate = task.dueDate || '';
    this.selectedCategory = task.category || '';
    this.setPriorityButtons(task.priority);
    this.subtasks = task.subtasks ? [...task.subtasks] : [];
    if (task.contacts && task.contacts.length > 0) {
      this.selectedContacts = this.contacts.filter((contact) =>
        task.contacts.includes(contact.name)
      );
      this.isContactSelected = this.selectedContacts.length > 0;
    }
  }

  /**
   * Sets the active priority button based on the task's priority.
   * @param {string} priority The priority of the task ('urgent', 'medium', 'low').
   */
  private setPriorityButtons(priority: string) {
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = false;
    switch (priority) {
      case 'urgent':
        this.isActive1 = true;
        break;
      case 'medium':
        this.isActive2 = true;
        break;
      case 'low':
        this.isActive3 = true;
        break;
      default:
        this.isActive2 = true;
        break;
    }
  }

  /**
   * Enters edit mode for a specific subtask.
   * @param {number} index The index of the subtask to edit.
   */
  startEditSubtask(index: number) {
    this.editSubtaskIndex = index;
    this.previousSubtaskValue = this.subtasks[index].title;
  }

  /**
   * Saves the changes to the subtask being edited.
   */
  saveSubtaskEdit() {
    if (this.editSubtaskIndex !== null) {
      if (!this.subtasks[this.editSubtaskIndex].title.trim()) {
        this.subtasks[this.editSubtaskIndex].title = this.previousSubtaskValue;
      }
      this.editSubtaskIndex = null;
    }
  }

  /**
   * Cancels the edit of a subtask, reverting any changes.
   */
  cancelSubtaskEdit() {
    if (this.editSubtaskIndex !== null) {
      this.subtasks[this.editSubtaskIndex].title = this.previousSubtaskValue;
      this.editSubtaskIndex = null;
    }
  }

  /**
   * Clears the subtask input field.
   */
  clearSubtask() {
    this.subtaskText = '';
  }

  /**
   * Validates the title field on input.
   */
  onTitleInput() {
    this.titleError = this.title.trim() === '';
    this.updateShowError();
  }

  /**
   * Validates the due date field on input.
   */
  onDueDateInput() {
    this.dueDateError = this.dueDate.trim() === '';
    this.updateShowError();
  }

  /**
   * Updates the general error flag based on individual field errors.
   */
  private updateShowError() {
    const hasAnyError =
      this.titleError ||
      this.dueDateError ||
      this.categoryError ||
      this.priorityError;
    if (!hasAnyError) {
      this.showError = false;
    }
  }

  /**
   * Validates all required form fields.
   */
  private validateAllFields() {
    this.titleError = this.title.trim() === '';
    this.dueDateError = this.dueDate.trim() === '';
    this.categoryError = this.selectedCategory === '';
    this.priorityError = !(this.isActive1 || this.isActive2 || this.isActive3);
  }

  /**
   * Returns a comma-separated string of selected contact names.
   * @returns {string} The concatenated names.
   */
  getSelectedContactsString(): string {
    if (this.selectedContacts.length === 0) {
      return '';
    }
    const names = this.selectedContacts.map((contact) => contact.name);
    return names.join(', ');
  }

  /**
   * Sets the priority to 'urgent'.
   */
  toggleButton1() {
    this.isActive1 = true;
    this.isActive2 = false;
    this.isActive3 = false;
    this.priorityError = false;
    this.updateShowError();
  }

  /**
   * Sets the priority to 'medium'.
   */
  toggleButton2() {
    this.isActive1 = false;
    this.isActive2 = true;
    this.isActive3 = false;
    this.priorityError = false;
    this.updateShowError();
  }

  /**
   * Sets the priority to 'low'.
   */
  toggleButton3() {
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = true;
    this.priorityError = false;
    this.updateShowError();
  }

  /**
   * Toggles the visibility of the contact assignment dropdown.
   */
  toggleAssignDropdown() {
    this.isAssignDropdownOpen = !this.isAssignDropdownOpen;
  }

  /**
   * Toggles the visibility of the category dropdown.
   */
  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  /**
   * Toggles the subtask input area and pre-fills it with default suggestions.
   */
  toggleSubtaskIcon() {
    this.isSubtaskOpen = !this.isSubtaskOpen;
    if (this.isSubtaskOpen && this.currentIndex < this.defaultSubtasks.length) {
      this.subtaskText = this.defaultSubtasks[this.currentIndex];
    } else if (!this.isSubtaskOpen) {
      this.subtaskText = '';
    }
  }

  /**
   * Adds a new subtask to the list.
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
   * Toggles the 'done' status of a subtask.
   * @param {number} index The index of the subtask to toggle.
   */
  toggleSubtaskStatus(index: number) {
    this.subtasks[index].done = !this.subtasks[index].done;
  }

  /**
   * Selects a category and closes the dropdown.
   * @param {string} category The category to select.
   */
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    this.categoryError = false;
    this.updateShowError();
  }

  /**
   * Gets the current priority as a string.
   * @returns {string} The priority value.
   */
  get priority(): string {
    if (this.isActive1) return 'urgent';
    if (this.isActive2) return 'medium';
    if (this.isActive3) return 'low';
    return 'medium';
  }

  /**
   * Gets the progress status of the task.
   * @returns {string} The progress value.
   */
  get progress(): string {
    return this.editMode && this.taskToEdit ? this.taskToEdit.progress : 'toDo';
  }

  /**
   * Checks if the form is valid.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  isFormValid(): boolean {
    const isTitleValid = this.title.trim() !== '';
    const isDueDateValid = this.dueDate.trim() !== '';
    const isCategoryValid = this.selectedCategory !== '';
    const isPriorityValid = this.isActive1 || this.isActive2 || this.isActive3;
    return isTitleValid && isDueDateValid && isCategoryValid && isPriorityValid;
  }

  /**
   * Getter to check for a title error.
   * @returns {boolean} True if there is a title error.
   */
  get hasTitleError(): boolean {
    return this.showError && this.title.trim() === '';
  }

  /**
   * Getter to check for a due date error.
   * @returns {boolean} True if there is a due date error.
   */
  get hasDueDateError(): boolean {
    return this.showError && this.dueDate.trim() === '';
  }

  /**
   * Getter to check for a category error.
   * @returns {boolean} True if there is a category error.
   */
  get hasCategoryError(): boolean {
    return this.showError && this.selectedCategory === '';
  }

  /**
   * Toggles the selection state of a contact.
   * @param {Contact} contact The contact to select or deselect.
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
   * @param {Contact} contact The contact to check.
   * @returns {boolean} True if the contact is selected.
   */
  isContactChecked(contact: Contact): boolean {
    return this.selectedContacts.some((c) => c.id === contact.id);
  }

  /**
   * Main function to create or update a task. Validates the form first.
   */
  async createTask() {
    this.validateAllFields();
    this.showError = true;
    if (!this.isFormValid()) {
      this.showSuccessInfo = true;
      this.successMessage = 'Please fill in all required fields';
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 3000);
      return;
    }
    this.showError = false;
    if (this.editMode && this.taskToEdit) {
      await this.updateTask();
    } else {
      await this.createNewTask();
    }
  }

  /**
   * Updates an existing task in Firestore.
   */
  private async updateTask() {
    if (!this.taskToEdit) return;
    let subtasksToSave =
      this.subtasks.length > 0
        ? this.subtasks
        : this.taskToEdit.subtasks ||
          this.defaultSubtasks.map((title) => ({ title, done: false }));
    const updateData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority as Task['priority'],
      category: this.selectedCategory,
      subtasks: subtasksToSave,
      contacts: this.selectedContacts.map((contact) => contact.name),
      assignedTo: this.selectedContacts
        .map((contact) => contact.name)
        .join(', '),
    };
    try {
      await this.taskService.updateTask(this.taskToEdit.id, updateData);
      const updatedTask: Task = {
        ...this.taskToEdit,
        ...updateData,
      };
      this.taskUpdated.emit(updatedTask);
      this.successMessage = 'Task updated successfully!';
      this.showSuccessInfo = true;
      setTimeout(() => {
        this.showSuccessInfo = false;
        this.close.emit();
      }, 1500);
    } catch (error) {
      console.error('Error updating task: ', error);
      this.successMessage = 'Error updating task.';
      this.showSuccessInfo = true;
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
    }
  }

  /**
   * Creates a new task and adds it to Firestore.
   */
  private async createNewTask() {
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
      this.successMessage = 'Task created successfully!';
      this.showSuccessInfo = true;
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
      this.resetForm();
    } catch (error) {
      console.error('Error creating task: ', error);
    }
  }

  /**
   * Resets all form fields to their default state.
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
    this.isActive2 = false;
    this.isActive3 = false;
    this.isSubtaskOpen = false;
    this.subtaskText = '';
    this.currentIndex = 0;
    this.showError = false;
    this.titleError = false;
    this.dueDateError = false;
    this.categoryError = false;
    this.priorityError = false;
  }

  /**
   * Gets the appropriate text for the submit button based on the mode.
   * @returns {string} The button text.
   */
  get submitButtonText(): string {
    return this.editMode ? 'Update Task' : 'Create Task';
  }

  /**
   * Removes a subtask from the list.
   * @param {number} index The index of the subtask to remove.
   */
  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }
}
