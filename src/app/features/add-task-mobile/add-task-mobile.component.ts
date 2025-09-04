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

interface Subtask {
  title: string;
  done: boolean;
}

@Component({
  selector: 'app-add-task-mobile',
  standalone: true,
  animations: [fadeInOutInfo],
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task-mobile.component.html',
  styleUrls: ['./add-task-mobile.component.scss'],
})
export class AddTaskMobileComponent implements OnInit, OnChanges {
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  @Input() showHeader: boolean = true;
  @Input() showReset: boolean = true;
  @Input() showCreate: boolean = true;
  @Input() editMode: boolean = false;
  @Input() taskToEdit: Task | null = null;

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

  selectedContacts: Contact[] = [];
  isContactSelected: boolean = false;
  showSuccessInfo = false;
  successMessage = '';
  showError = false;

  // Spezifische Fehler-Tracking
  titleError = false;
  dueDateError = false;
  categoryError = false;
  priorityError = false;

  constructor(
    private contactService: ContactService,
    private firestore: Firestore,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);

        if (this.editMode && this.taskToEdit) {
          this.populateFormWithTaskData(this.taskToEdit);
        }
      },
      error: (err) => console.error('Fehler beim Laden der Kontakte:', err),
    });
  }

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

    console.log('Form mit Task-Daten befüllt:', task);
  }

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

  // Validation Methods
  onTitleInput() {
    console.log('Title input:', this.title);
    this.titleError = this.title.trim() === '';
    this.updateShowError();
  }

  onDueDateInput() {
    console.log('Due date input:', this.dueDate);
    this.dueDateError = this.dueDate.trim() === '';
    this.updateShowError();
  }

  private updateShowError() {
    // Wenn alle Felder valid sind, verstecke Fehler
    const hasAnyError =
      this.titleError ||
      this.dueDateError ||
      this.categoryError ||
      this.priorityError;
    if (!hasAnyError) {
      this.showError = false;
    }
  }

  private validateAllFields() {
    this.titleError = this.title.trim() === '';
    this.dueDateError = this.dueDate.trim() === '';
    this.categoryError = this.selectedCategory === '';
    this.priorityError = !(this.isActive1 || this.isActive2 || this.isActive3);

    console.log('Validation results:', {
      titleError: this.titleError,
      dueDateError: this.dueDateError,
      categoryError: this.categoryError,
      priorityError: this.priorityError,
    });
  }

  onSubtaskInput() {}

  clearSubtask() {
    this.subtaskText = '';
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
    this.priorityError = false;
    this.updateShowError();
    console.log('Button 1 ist aktiv');
  }

  toggleButton2() {
    this.isActive1 = false;
    this.isActive2 = true;
    this.isActive3 = false;
    this.priorityError = false;
    this.updateShowError();
    console.log('Button 2 ist aktiv');
  }

  toggleButton3() {
    this.isActive1 = false;
    this.isActive2 = false;
    this.isActive3 = true;
    this.priorityError = false;
    this.updateShowError();
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
      this.subtasks.push({
        title: this.subtaskText.trim(),
        done: false,
      });
      this.subtaskText = '';
    }
  }

  toggleSubtaskStatus(index: number) {
    this.subtasks[index].done = !this.subtasks[index].done;
    console.log('Subtask Status geändert:', this.subtasks[index]);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    this.categoryError = false;
    this.updateShowError();
    console.log('Ausgewählte Kategorie:', category);
  }

  get priority(): string {
    if (this.isActive1) return 'urgent';
    if (this.isActive2) return 'medium';
    if (this.isActive3) return 'low';
    return 'medium';
  }

  get progress(): string {
    return this.editMode && this.taskToEdit ? this.taskToEdit.progress : 'toDo';
  }

  isFormValid(): boolean {
    const isTitleValid = this.title.trim() !== '';
    const isDueDateValid = this.dueDate.trim() !== '';
    const isCategoryValid = this.selectedCategory !== '';
    const isPriorityValid = this.isActive1 || this.isActive2 || this.isActive3;

    console.log('Form Validation:', {
      isTitleValid,
      isDueDateValid,
      isCategoryValid,
      isPriorityValid,
    });

    return isTitleValid && isDueDateValid && isCategoryValid && isPriorityValid;
  }

  // Getter für Template
  get hasTitleError(): boolean {
    return this.showError && this.title.trim() === '';
  }

  get hasDueDateError(): boolean {
    return this.showError && this.dueDate.trim() === '';
  }

  get hasCategoryError(): boolean {
    return this.showError && this.selectedCategory === '';
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
    console.log('CreateTask aufgerufen');

    // Validiere alle Felder
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

    // Form ist valid
    this.showError = false;

    if (this.editMode && this.taskToEdit) {
      await this.updateTask();
    } else {
      await this.createNewTask();
    }
  }

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
      console.error('Fehler beim Aktualisieren des Tasks: ', error);
      this.successMessage = 'Error updating task.';
      this.showSuccessInfo = true;
      setTimeout(() => {
        this.showSuccessInfo = false;
      }, 2000);
    }
  }

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
    this.showError = false;
    this.titleError = false;
    this.dueDateError = false;
    this.categoryError = false;
    this.priorityError = false;
  }

  get submitButtonText(): string {
    return this.editMode ? 'Update Task' : 'Create Task';
  }

  editSubtaskIndex: number | null = null;

  startEditSubtask(index: number) {
    this.editSubtaskIndex = index;
  }

  saveSubtaskEdit() {
    this.editSubtaskIndex = null;
  }

  removeSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }
}
