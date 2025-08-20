import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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

// Modelle
import { Contact } from '../contacts/contact-model/contact.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy {
  /** Modal-Status für Task-Details */
  showModal = false;

  /** Lokale Arrays für die Spalten */
  todo: Task[] = [];
  inprogress: Task[] = [];
  awaitfeedback: Task[] = [];
  done: Task[] = [];

  /** Aktuell ausgewählter Task für Details */
  selectedTask: Task | null = null;

  /** Aktuell ausgewählter Kontakt */
  selectedContact: (Contact & { id: string }) | null = null;

  private tasksSubscription: Subscription;

  constructor(
    private taskService: TaskService,
    private contactService: ContactService
  ) {
    this.tasksSubscription = this.taskService.getTasks().pipe(
      map(tasks => tasks.map(t => this.mapTask(t)))
    ).subscribe(tasks => {
      this.todo = tasks.filter(t => t.progress === 'toDo');
      this.inprogress = tasks.filter(t => t.progress === 'inProgress');
      this.awaitfeedback = tasks.filter(t => t.progress === 'awaitFeedback');
      this.done = tasks.filter(t => t.progress === 'done');
    });
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  /**
   * Normalisiert Task-Daten aus Firestore.
   * @param task Rohdaten eines Tasks
   * @returns Task-Objekt mit korrekten Typen
   */
  private mapTask(task: any): Task {
    console.log('Raw task data:', task);
    return {
      id: task.id || '',
      assignedTo: task.assignedTo || '',
      category: task.category || '',
      categoryColor: task.categoryColor || this.getCategoryColor(task.category),
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: this.mapPriority(task.priority),
      progress: task.progress || 'toDo',
      subtasks: this.parseSubtasks(task.subtasks),
      title: task.title || task.titile || '',
      contacts: task.contacts || task.assignedTo || ''
    };
  }

  /**
   * Generiert eine Farbe basierend auf der Kategorie.
   * @param category Kategorie-Name
   * @returns Hex-Farbcode
   */
  private getCategoryColor(category: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', '#6A0572'];
    const index = Math.abs(this.hashCode(category)) % colors.length;
    return colors[index];
  }

  /**
   * Erzeugt einen Hash-Wert für einen String.
   * @param str Input-String
   * @returns Ganzzahl-Hash
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
   * Parst Subtasks aus verschiedenen Formaten.
   * @param subtasks Array oder CSV-String
   * @returns Array von Subtask-Objekten
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
   * Normalisiert die Priorität eines Tasks.
   * @param priority String-Priorität
   * @returns Task-Priority
   */
  private mapPriority(priority: string): Task['priority'] {
    const priorityMap: Record<string, Task['priority']> = {
      'low': 'low',
      'medium': 'medium',
      'urgent': 'urgent'
    };
    
    return priorityMap[priority.toLowerCase()] || 'medium';
  }

  /**
   * Behandelt Drag & Drop von Tasks zwischen Listen.
   * @param event CdkDragDrop Event
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
        // Sofortige UI-Aktualisierung
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        // Firebase-Update
        this.taskService.updateTask(task.id, { progress: newProgress } as Partial<Task>)
          .catch(error => {
            console.error('Error updating task:', error);
            // Bei Fehler: Rückgängig machen
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          });
      }
    }
  }

  /**
   * Bestimmt den Fortschrittswert basierend auf der Container-ID.
   * @param containerId ID der Drop-Container
   * @returns Fortschrittsstatus oder null
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
   * Öffnet das Task-Modal für Details.
   * @param task Ausgewählter Task
   */
  openTaskModal(task: Task) {
    this.selectedTask = task;
    this.showModal = true;
  }

  /**
   * TrackBy-Funktion für ngFor zur Verbesserung der Performance.
   * @param index Index im Array
   * @param task Task-Objekt
   * @returns Task-ID
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }
}