import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { ModalBoardComponent } from './modal-board/modal-board.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule,ModalBoardComponent,FormsModule ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy {
  getCategoryClass(category: string): string {
    switch (category) {
      case 'Development':
        return 'category-development';
      case 'User Story':
        return 'category-user-story';
      case 'Design':
        return 'category-design';
      case 'Technical':
      case 'Technical Task':
        return 'category-technical';
      case 'Documentation':
        return 'category-documentation';
      default:
        return '';
    }
  }
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

    /** Farbpalette für Avatare. */
    private readonly avatarColors = [
      '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
      '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
    ];

  /** Suchbegriff für die Task-Suche */
  searchTerm: string = '';

  /** Hinweistext, wenn keine Tasks gefunden werden */
  noTasksMessage: string = '';

  /** Master-Liste aller Tasks (für Filterzwecke) */
  private allTasks: Task[] = [];
  

  constructor(
    private taskService: TaskService,
    private contactService: ContactService,
  ) {
    this.tasksSubscription = this.taskService.getTasks().pipe(
      map(tasks => tasks.map(t => this.mapTask(t)))
    ).subscribe(tasks => {
      this.allTasks = tasks;
      this.filterTasks(); // Initiale Filterung
    });
  }

  /**
   * Filtert Tasks anhand des Suchbegriffs und verteilt sie auf die Spalten.
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

  // Suche nur, wenn title/description mit search ANFÄNGT
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
   * Wendet den aktuellen Filter (searchTerm) auf die Master-Liste an.
   */
  

    /**
     * Berechnet eine Avatar-Farbe basierend auf dem Namen.
     * @param name Name des Kontakts
     * @returns Hex-Farbcode
     */
    getAvatarColor(name: string): string {
      if (!name) return this.avatarColors[0];
      return this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length];
    }

    /**
     * Extrahiert Initialen aus dem Namen.
     * @param name Name des Kontakts
     * @returns Initialen (z.B. "AB")
     */
    getInitials(name: string): string {
      return name
        .split(' ')
        .filter(part => part.length > 0)
        .map(part => part[0].toUpperCase())
        .slice(0, 2)
        .join('');
    }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }


    getDoneSubtasks(task: Task): number {
    const subtasks: Subtask[] = this.parseSubtasks(task.subtasks);
    return subtasks.filter(s => s.done).length;
  }

  /**
   * Calculates the progress of subtasks as a percentage.
   * @param {Task} task - The task for which the progress is to be calculated.
   * @returns {number} The progress percentage (0-100).
   */
  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return (this.getDoneSubtasks(task) / task.subtasks.length) * 100;
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
      subtasks: task.subtasks || '',
      title: task.title || task.titile || '',
      contacts: task.contacts || task.assignedTo || '',
      status: task.status || '', 
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
        // Sofortige UI-Aktualisierung (Task-Status im Objekt direkt ändern)
        task.progress = newProgress;
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        // Asynchrones Update in Firestore, UI bleibt sofort aktuell
        this.taskService.updateTask(task.id, { progress: newProgress } as Partial<Task>)
          .catch(error => {
            console.error('Error updating task:', error);
            // Optional: Rückgängig machen bei Fehler
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
    // Nur das Task-Modal öffnen, NICHT showModal setzen!
    this.selectedTask = task;
    // Entferne oder lasse folgende Zeile weg:
    // this.showModal = true;
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
