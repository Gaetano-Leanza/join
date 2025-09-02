import { Component, OnDestroy } from '@angular/core';
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
import { ContactService } from '../contacts/contact-service/contact.service';

// Models
import { Contact } from '../contacts/contact-model/contact.model';
import { ModalBoardAddTaskComponent } from './modal-board-add-task/modal-board-add-task.component';
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
  styleUrls: ['./board.component.scss','./board.responsive.scss'],
})
export class BoardComponent implements OnDestroy {
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

  showModal = false;

  todo: Task[] = [];
  inprogress: Task[] = [];
  awaitfeedback: Task[] = [];
  done: Task[] = [];

  selectedTask: Task | null = null;
  selectedContact: (Contact & { id: string }) | null = null;
  private tasksSubscription: Subscription;

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

  searchTerm: string = '';
  noTasksMessage: string = '';
  private allTasks: Task[] = [];

  constructor(private taskService: TaskService) {
    this.tasksSubscription = this.taskService
      .getTasks()
      .pipe(map((tasks) => tasks.map((t) => this.mapTask(t))))
      .subscribe((tasks) => {
        this.allTasks = tasks;
        this.filterTasks();
      });
  }

  filterTasks(): void {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      this.todo = this.allTasks.filter((t) => t.progress === 'toDo');
      this.inprogress = this.allTasks.filter((t) => t.progress === 'inProgress');
      this.awaitfeedback = this.allTasks.filter((t) => t.progress === 'awaitFeedback');
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

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length];
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

 getDoneSubtasks(task: Task): number {
  if (!task.subtasks) return 0;
  return task.subtasks.filter(s => s.done).length;
}

getSubtaskProgress(task: Task): number {
  if (!task.subtasks || task.subtasks.length === 0) return 0;
  const done = this.getDoneSubtasks(task);
  return Math.round((done / task.subtasks.length) * 100);
}

  /**
   * Normalize raw task data from Firestore into Task.
   * Now normalizes contacts to a string[] (supports old assignedTo string and new contacts array).
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
      // normalize contacts: supports array | comma-separated string | single assignedTo string
      contacts: this.parseContacts(task.contacts ?? task.assignedTo),
      status: task.status || '',
    };
  }

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
   * Parse contacts into a string array.
   * Accepts:
   * - array of strings,
   * - comma-separated string,
   * - single string (assignedTo)
   * - array of objects with name property (defensive)
   */
  private parseContacts(contacts: any): string[] {
    if (!contacts) return [];
    if (Array.isArray(contacts)) {
      return contacts
        .map((c) => {
          if (!c) return '';
          if (typeof c === 'string') return c;
          // if object, try to extract common fields
          if (typeof c === 'object') return (c.name || c.fullName || c.displayName || '').toString();
          return c.toString();
        })
        .filter((c) => !!c);
    }
    if (typeof contacts === 'string') {
      // support comma-separated or single name
      if (contacts.includes(',')) {
        return contacts.split(',').map((s) => s.trim()).filter((s) => !!s);
      }
      if (contacts.trim().length === 0) return [];
      return [contacts.trim()];
    }
    // fallback
    return [];
  }

  private mapPriority(priority: string): Task['priority'] {
    const priorityMap: Record<string, Task['priority']> = {
      low: 'low',
      medium: 'medium',
      urgent: 'urgent',
    };
    return priorityMap[priority?.toLowerCase()] || 'medium';
  }

  async drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
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
            task.progress = this.getProgressFromContainerId(event.previousContainer.id) || task.progress;
          });
      }
    }
  }

  private getProgressFromContainerId(containerId: string): Task['progress'] | null {
    const progressMap: Record<string, Task['progress']> = {
      todoList: 'toDo',
      inProgressList: 'inProgress',
      awaitFeedbackList: 'awaitFeedback',
      doneList: 'done',
    };
    return progressMap[containerId] || null;
  }

  openTaskModal(task: Task) {
    this.selectedTask = task;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }


}