import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ModalBoardComponent } from './modal-board/modal-board.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { map, Subscription } from 'rxjs';

// Services
import { TaskService, Task, Subtask } from '../../services/task.service';
import { ContactService } from '../contacts/contact-service/contact.service';

// Models
import { Contact } from '../contacts/contact-model/contact.model';
import { ModalBoardAddTaskComponent } from './modal-board-add-task/modal-board-add-task.component';
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, ModalBoardAddTaskComponent, FormsModule,ModalBoardComponent ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy {
  /**
   * Returns the corresponding CSS class for a task category.
   * @param {string} category - The category of the task.
   * @returns {string} The name of the CSS class.
   */
  getCategoryClass(category: string): string {
    switch (category) {
      case 'User Story':
        return 'user-story';
      case 'Technical Task':
        return 'technical-task';
      default:
        return '';
    }
  }

  /** Status of the modal for the task detail view. */
  showModal = false;

  /** Array for tasks in the 'To Do' column. */
  todo: Task[] = [];
  /** Array for tasks in the 'In Progress' column. */
  inprogress: Task[] = [];
  /** Array for tasks in the 'Await Feedback' column. */
  awaitfeedback: Task[] = [];
  /** Array for tasks in the 'Done' column. */
  done: Task[] = [];

  /** The currently selected task to be displayed in the modal. */
  selectedTask: Task | null = null;

  /** The currently selected contact. */
  selectedContact: (Contact & { id: string }) | null = null;

  /** Subscription to the task data. */
  private tasksSubscription: Subscription;

  /**
   * Color palette for contact avatars.
   * @private
   * @readonly
   */
  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  /** The current search term for filtering tasks. */
  searchTerm: string = '';

  /** Message displayed when no tasks are found. */
  noTasksMessage: string = '';

  /** A master list containing all tasks for filtering purposes. */
  private allTasks: Task[] = [];

  /**
   * Initializes the component and subscribes to task data.
   * @param {TaskService} taskService - The service for managing tasks.
   * @param {ContactService} contactService - The service for managing contacts.
   */
  constructor(
    private taskService: TaskService,
    private contactService: ContactService,
  ) {
    this.tasksSubscription = this.taskService.getTasks().pipe(
      map(tasks => tasks.map(t => this.mapTask(t)))
    ).subscribe(tasks => {
      this.allTasks = tasks;
      this.filterTasks(); // Initial filtering on load
    });
  }

  /**
   * Filters tasks based on the `searchTerm` and distributes them into the columns.
   * If the search term is empty, all tasks are displayed.
   */
  filterTasks(): void {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      this.todo = this.allTasks.filter(t => t.progress === 'toDo');
      this.inprogress = this.allTasks.filter(t => t.progress === 'inProgress');
      this.awaitfeedback = this.allTasks.filter(t => t.progress === 'awaitFeedback');
      this.done = this.allTasks.filter(t => t.progress === 'done');
      this.noTasksMessage = '';
      return;
    }

    const filtered = this.allTasks.filter(
      t =>
        (t.title && t.title.toLowerCase().startsWith(search)) ||
        (t.description && t.description.toLowerCase().startsWith(search))
    );

    this.todo = filtered.filter(t => t.progress === 'toDo');
    this.inprogress = filtered.filter(t => t.progress === 'inProgress');
    this.awaitfeedback = filtered.filter(t => t.progress === 'awaitFeedback');
    this.done = filtered.filter(t => t.progress === 'done');

    this.noTasksMessage = filtered.length === 0 ? 'No results found.' : '';
  }

  /**
   * Calculates a deterministic avatar color based on the name.
   * @param {string} name - The contact's name.
   * @returns {string} A hex color code.
   */
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length];
  }

  /**
   * Extracts the initials from a full name.
   * @param {string} name - The contact's name.
   * @returns {string} The initials (e.g., "AB").
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Lifecycle hook called when the component is destroyed to clean up subscriptions.
   */
  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  /**
   * Counts the number of completed subtasks for a given task.
   * @param {Task} task - The task whose subtasks are to be counted.
   * @returns {number} The number of completed subtasks.
   */
  getDoneSubtasks(task: Task): number {
    const subtasks: Subtask[] = this.parseSubtasks(task.subtasks);
    return subtasks.filter(s => s.done).length;
  }

  /**
   * Calculates the progress of subtasks as a percentage.
   * @param {Task} task - The task for which to calculate the progress.
   * @returns {number} The progress percentage (0-100).
   */
  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const totalSubtasks = this.parseSubtasks(task.subtasks).length;
    if (totalSubtasks === 0) return 0;
    return (this.getDoneSubtasks(task) / totalSubtasks) * 100;
  }

  /**
   * Maps and normalizes raw task data from Firestore into a structured Task object.
   * @private
   * @param {*} task - The raw task data.
   * @returns {Task} The normalized Task object.
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
      contacts: task.contacts || task.assignedTo || [],
      status: task.status || '',
    };
  }

  /**
   * Generates a deterministic color based on the category name.
   * @private
   * @param {string} category - The name of the category.
   * @returns {string} A hex color code.
   */
  private getCategoryColor(category: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', '#6A0572'];
    const index = Math.abs(this.hashCode(category)) % colors.length;
    return colors[index];
  }

  /**
   * Generates a simple hash code for a string.
   * @private
   * @param {string} str - The input string.
   * @returns {number} The generated hash code.
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  /**
   * Parses subtasks, which can be an array or a string, into a consistent format.
   * @private
   * @param {*} subtasks - The subtasks in various formats.
   * @returns {Subtask[]} An array of Subtask objects.
   */
  private parseSubtasks(subtasks: any): Subtask[] {
    if (!subtasks) return [];
    if (Array.isArray(subtasks)) {
      return subtasks.map(sub => ({
        title: sub.title || sub || '',
        done: sub.done || false
      }));
    }
    if (typeof subtasks === 'string') {
      return subtasks.split(',').map(title => ({
        title: title.trim(),
        done: false
      }));
    }
    return [];
  }

  /**
   * Maps a priority string to the defined `Task['priority']` type.
   * @private
   * @param {string} priority - The priority as a string (e.g., 'low', 'medium', 'urgent').
   * @returns {Task['priority']} The normalized priority.
   */
  private mapPriority(priority: string): Task['priority'] {
    const priorityMap: Record<string, Task['priority']> = {
      'low': 'low',
      'medium': 'medium',
      'urgent': 'urgent'
    };
    return priorityMap[priority?.toLowerCase()] || 'medium';
  }

  /**
   * Handles the drag-and-drop event for tasks.
   * Updates the task status when it's moved to a different column.
   * @param {CdkDragDrop<Task[]>} event - The drag-and-drop event object.
   */
  drop(event: CdkDragDrop<Task[]>) {
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

        this.taskService.updateTask(task.id, { progress: newProgress } as Partial<Task>)
          .catch(error => {
            console.error('Error updating task:', error);
            // Optional: Revert UI change on error
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
            task.progress = this.getProgressFromContainerId(event.previousContainer.id) || task.progress;
          });
      }
    }
  }

  /**
   * Determines the progress status based on the ID of the target container.
   * @private
   * @param {string} containerId - The ID of the drop container.
   * @returns {Task['progress'] | null} The corresponding progress status or null.
   */
  private getProgressFromContainerId(containerId: string): Task['progress'] | null {
    const progressMap: Record<string, Task['progress']> = {
      'todoList': 'toDo',
      'inProgressList': 'inProgress',
      'awaitFeedbackList': 'awaitFeedback',
      'doneList': 'done'
    };
    return progressMap[containerId] || null;
  }

  /**
   * Opens the modal to display task details.
   * @param {Task} task - The task to be displayed in the modal.
   */

openTaskModal(task: Task) {
  this.selectedTask = task;
}

  /**
   * TrackBy function for `ngFor` to optimize performance when rendering task lists.
   * @param {number} index - The index of the item in the array.
   * @param {Task} task - The task object.
   * @returns {string} The unique ID of the task.
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }
}
