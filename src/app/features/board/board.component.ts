import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalBoardComponent } from './modal-board/modal-board.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { map, Subscription } from 'rxjs';

// Services
import { TaskService, Task, Subtask } from '../../services/task.service';

// Models
import { Contact } from '../contacts/contact-model/contact.model';
import { ModalBoardAddTaskComponent } from './modal-board-add-task/modal-board-add-task.component';

/**
 * @Component BoardComponent
 * This component displays the main task board, allowing users to view and manage tasks
 * in different progress columns (To Do, In Progress, Await Feedback, Done).
 * It supports drag-and-drop functionality to move tasks between columns.
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ModalBoardAddTaskComponent,
    FormsModule,
    ModalBoardComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss', './board.responsive.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  /** Flag to control the visibility of the "Add Task" modal. */
  showModal = false;
  /** Delay in milliseconds for starting a drag operation, adjusted for device width. */
  dragDelay = 0;

  /** Array of tasks in the 'To Do' column. */
  todo: Task[] = [];
  /** Array of tasks in the 'In Progress' column. */
  inprogress: Task[] = [];
  /** Array of tasks in the 'Await Feedback' column. */
  awaitfeedback: Task[] = [];
  /** Array of tasks in the 'Done' column. */
  done: Task[] = [];

  /** The currently selected task to be displayed in a modal. */
  selectedTask: Task | null = null;
  /** The currently selected contact. */
  selectedContact: (Contact & { id: string }) | null = null;
  /** Subscription to the tasks observable from TaskService. */
  private tasksSubscription: Subscription;

  /** A predefined list of colors for user avatars. */
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

  /** The search term entered by the user to filter tasks. */
  searchTerm: string = '';
  /** A message to display when no tasks match the search criteria. */
  noTasksMessage: string = '';
  /** A local copy of all tasks to perform filtering on. */
  private allTasks: Task[] = [];

  /**
   * @constructor
   * @param {TaskService} taskService - The service for managing task data.
   */
  constructor(private taskService: TaskService) {
    this.tasksSubscription = this.taskService
      .getTasks()
      .pipe(map((tasks) => tasks.map((t) => this.mapTask(t))))
      .subscribe((tasks) => {
        this.allTasks = tasks;
        this.filterTasks();
      });
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   */
  ngOnInit() {
    this.setDragDelay();
    window.addEventListener('resize', this.setDragDelay.bind(this));
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from observables and removes event listeners to prevent memory leaks.
   */
  ngOnDestroy() {
    window.removeEventListener('resize', this.setDragDelay.bind(this));
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  /**
   * Sets the drag-and-drop delay based on the window width.
   * A longer delay is used on smaller screens to support touch-based scrolling.
   */
  setDragDelay() {
    this.dragDelay = window.innerWidth <= 1299 ? 300 : 0;
  }

  /**
   * Returns a hex color code based on the task category.
   * @param {string} category - The category of the task.
   * @returns {string} The corresponding color code.
   */
  public getCategoryColor(category: string): string {
    switch (category) {
      case 'User Story':
        return ' #0038FF';
      case 'Technical Task':
        return ' #1FD7C1';
      default:
        return '#CCCCCC';
    }
  }

  /**
   * Filters the tasks displayed on the board based on the search term.
   */
  filterTasks(): void {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      this.todo = this.allTasks.filter((t) => t.progress === 'toDo');
      this.inprogress = this.allTasks.filter(
        (t) => t.progress === 'inProgress'
      );
      this.awaitfeedback = this.allTasks.filter(
        (t) => t.progress === 'awaitFeedback'
      );
      this.done = this.allTasks.filter((t) => t.progress === 'done');
      this.noTasksMessage = '';
      return;
    }

    const filtered = this.allTasks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(search)) ||
        (t.description && t.description.toLowerCase().includes(search))
    );

    this.todo = filtered.filter((t) => t.progress === 'toDo');
    this.inprogress = filtered.filter((t) => t.progress === 'inProgress');
    this.awaitfeedback = filtered.filter((t) => t.progress === 'awaitFeedback');
    this.done = filtered.filter((t) => t.progress === 'done');
    this.noTasksMessage = filtered.length === 0 ? 'No results found' : '';
  }

  /**
   * Generates a color for an avatar based on a name.
   * @param {string} name - The name of the user.
   * @returns {string} A hex color code.
   */
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[
      name.trim().charCodeAt(0) % this.avatarColors.length
    ];
  }

  /**
   * Extracts initials from a full name.
   * @param {string} name - The full name.
   * @returns {string} The initials (e.g., "JD" for "John Doe").
   */
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Calculates the number of completed subtasks for a given task.
   * @param {Task} task - The task to check.
   * @returns {number} The count of subtasks where `done` is true.
   */
  getDoneSubtasks(task: Task): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter((s) => s.done).length;
  }

  /**
   * Calculates the progress of subtasks as a percentage.
   * @param {Task} task - The task containing the subtasks.
   * @returns {number} The completion percentage (0-100).
   */
  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const done = this.getDoneSubtasks(task);
    return Math.round((done / task.subtasks.length) * 100);
  }

  /**
   * Normalizes raw task data from Firestore into a structured Task object.
   * @private
   * @param {any} task - The raw task data from Firestore.
   * @returns {Task} A structured Task object.
   */
  private mapTask(task: any): Task {
    return {
      id: task.id || '',
      assignedTo: task.assignedTo || '',
      category: task.category || '',
      categoryColor: task.categoryColor || this.getCategoryColor(task.category),
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: this.mapPriority(task.priority),
      progress: task.progress || 'toDo',
      subtasks: task.subtasks || [],
      title: task.title || task.titile || '',
      contacts: this.parseContacts(task.contacts ?? task.assignedTo),
      status: task.status || '',
    };
  }

  /**
   * Parses the subtasks field from various possible formats into a consistent Subtask array.
   * @private
   * @param {any} subtasks - The subtasks data.
   * @returns {Subtask[]} An array of Subtask objects.
   */
  private parseSubtasks(subtasks: any): Subtask[] {
    if (!subtasks) return [];
    if (Array.isArray(subtasks)) {
      return subtasks.map((sub) => ({
        title: sub.title || sub || '',
        done: sub.done || false,
      }));
    }
    if (typeof subtasks === 'string') {
      return subtasks.split(',').map((title) => ({
        title: title.trim(),
        done: false,
      }));
    }
    return [];
  }

  /**
   * Parses the contacts field from various possible formats into a string array.
   * @private
   * @param {any} contacts - The contacts data, which could be an array, a string, or null.
   * @returns {string[]} An array of contact names.
   */
  private parseContacts(contacts: any): string[] {
    if (!contacts) return [];
    if (Array.isArray(contacts)) {
      return contacts
        .map((c) => {
          if (!c) return '';
          if (typeof c === 'string') return c;
          if (typeof c === 'object')
            return (c.name || c.fullName || c.displayName || '').toString();
          return c.toString();
        })
        .filter((c) => !!c);
    }
    if (typeof contacts === 'string') {
      if (contacts.includes(',')) {
        return contacts
          .split(',')
          .map((s) => s.trim())
          .filter((s) => !!s);
      }
      if (contacts.trim().length === 0) return [];
      return [contacts.trim()];
    }
    return [];
  }

  /**
   * Maps a string priority to the `Task['priority']` type.
   * @private
   * @param {string} priority - The priority string (e.g., 'low', 'medium', 'urgent').
   * @returns {Task['priority']} The mapped priority type, defaulting to 'medium'.
   */
  private mapPriority(priority: string): Task['priority'] {
    const priorityMap: Record<string, Task['priority']> = {
      low: 'low',
      medium: 'medium',
      urgent: 'urgent',
    };
    return priorityMap[priority?.toLowerCase()] || 'medium';
  }

  /**
   * Handles the drop event when a task is moved within or between columns.
   * @param {CdkDragDrop<Task[]>} event - The drag-and-drop event object.
   */
  async drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newProgress = this.getProgressFromContainerId(event.container.id);

      if (newProgress && task.id) {
        task.progress = newProgress;
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        this.taskService
          .updateTask(task.id, { progress: newProgress } as Partial<Task>)
          .catch((error) => {
            console.error('Error updating task:', error);
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
            task.progress =
              this.getProgressFromContainerId(event.previousContainer.id) ||
              task.progress;
          });
      }
    }
  }

  /**
   * Determines the progress status from the ID of the drop container.
   * @private
   * @param {string} containerId - The ID of the CDK drop list container.
   * @returns {Task['progress'] | null} The corresponding progress status or null if not found.
   */
  private getProgressFromContainerId(
    containerId: string
  ): Task['progress'] | null {
    const progressMap: Record<string, Task['progress']> = {
      todoList: 'toDo',
      inProgressList: 'inProgress',
      awaitFeedbackList: 'awaitFeedback',
      doneList: 'done',
    };
    return progressMap[containerId] || null;
  }

  /**
   * Opens a modal to display the details of a selected task.
   * @param {Task} task - The task to be displayed.
   */
  openTaskModal(task: Task) {
    this.selectedTask = task;
  }

  /**
   * A trackBy function for Angular's ngFor to improve performance when rendering lists.
   * @param {number} index - The index of the item.
   * @param {Task} task - The task object.
   * @returns {string} The unique ID of the task.
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }
}
