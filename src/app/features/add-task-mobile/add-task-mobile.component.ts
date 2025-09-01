import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contacts/contact-service/contact.service';
import { Contact } from '../contacts/contact-model/contact.model';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { fadeInOutInfo } from '../contacts/modal/modal.animations';
import { getAvatarColor, getInitials } from './avatar-utils';
import { Task, TaskService } from '../../services/task.service'; // Task importieren

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
  @Output() taskUpdated = new EventEmitter<Task>(); // Neues Event für Updates
  
  @Input() showHeader: boolean = true;
  @Input() showReset: boolean = true;
  @Input() showCreate: boolean = true;
  @Input() editMode: boolean = false; // Neuer Input für Edit-Modus
  @Input() taskToEdit: Task | null = null; // Neuer Input für zu editierenden Task

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

  constructor(
    private contactService: ContactService,
    private firestore: Firestore,
    private taskService: TaskService // TaskService hinzufügen
  ) {}

  showSuccessInfo = false;
  successMessage = '';
  showError = false;

  ngOnInit() {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.topContacts = contacts.slice(0, 3);
        
        // Wenn wir im Edit-Modus sind und bereits einen Task haben, befülle die Felder
        if (this.editMode && this.taskToEdit) {
          this.populateFormWithTaskData(this.taskToEdit);
        }
      },
      error: (err) => console.error('Fehler beim Laden der Kontakte:', err),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reagiere auf Änderungen des taskToEdit Inputs
    if (changes['taskToEdit'] && changes['taskToEdit'].currentValue && this.editMode) {
      if (this.contacts.length > 0) {
        this.populateFormWithTaskData(changes['taskToEdit'].currentValue);
      }
    }
    
    // Reset form wenn editMode deaktiviert wird
    if (changes['editMode'] && !changes['editMode'].currentValue) {
      this.resetForm();
    }
  }

  private populateFormWithTaskData(task: Task) {
    this.title = task.title || '';
    this.description = task.description || '';
    this.dueDate = task.dueDate || '';
    this.selectedCategory = task.category || '';

    // Priority buttons setzen
    this.setPriorityButtons(task.priority);

    // Subtasks setzen
    this.subtasks = task.subtasks ? [...task.subtasks] : [];

    // Kontakte setzen
    if (task.contacts && task.contacts.length > 0) {
      this.selectedContacts = this.contacts.filter(contact => 
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
        this.isActive2 = true; // Default auf medium
        break;
    }
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
    return this.editMode && this.taskToEdit ? this.taskToEdit.progress : 'toDo';
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
       this.showError = true;
      this.showSuccessInfo = true;
      this.successMessage = 'Please fill in all required fields';
      setTimeout(() => {
        this.showSuccessInfo = false;

      }, 2000);
      return;
    }

    if (this.editMode && this.taskToEdit) {
      // Task aktualisieren
      await this.updateTask();
    } else {
      // Neuen Task erstellen
      await this.createNewTask();
    }
  }

  private async updateTask() {
    if (!this.taskToEdit) return;

    // Wenn keine Subtasks hinzugefügt -> vorhandene Subtasks beibehalten oder default false Subtasks
    let subtasksToSave = this.subtasks.length > 0 
      ? this.subtasks 
      : this.taskToEdit.subtasks || this.defaultSubtasks.map((title) => ({ title, done: false }));

    const updateData = {
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority as Task['priority'],
      category: this.selectedCategory,
      subtasks: subtasksToSave,
      contacts: this.selectedContacts.map((contact) => contact.name),
      assignedTo: this.selectedContacts.map((contact) => contact.name).join(', ')
    };

    try {
      await this.taskService.updateTask(this.taskToEdit.id, updateData);
      
      // Emit das aktualisierte Task-Objekt
      const updatedTask: Task = {
        ...this.taskToEdit,
        ...updateData
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

  // Getter für Button-Text
  get submitButtonText(): string {
    return this.editMode ? 'Update Task' : 'Create Task';
  }
}