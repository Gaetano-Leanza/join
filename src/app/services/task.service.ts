import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * Interface für ein Subtask-Dokument.
 */
export interface Subtask {
  /** Titel der Subtask */
  title: string;
  /** Status, ob die Subtask erledigt ist */
  done: boolean;
}

/**
 * Interface für ein Task-Dokument in Firestore.
 */
export interface Task {
  /** Eindeutige ID des Tasks */
  id: string;
  /** Zugewiesene Person */
  assignedTo: string;
  /** Kategorie des Tasks */
  category: string;
  /** Farbe der Kategorie für UI */
  categoryColor: string; 
  /** Beschreibung des Tasks */
  description: string;
  /** Fälligkeitsdatum als ISO-String */
  dueDate: string;
  /** Priorität des Tasks */
  priority: 'low' | 'medium' | 'urgent';
  /** Fortschrittsstatus des Tasks */
  progress: 'toDo' | 'inProgress' | 'awaitFeedback' | 'done';
  /** Liste der Subtasks */
  subtasks: Subtask[];
  /** Titel des Tasks */
  title: string;
  /** Zugewiesene Kontakte */
  contacts: string; 
}

/**
 * Interface für Task-Updates (alle Felder optional).
 */
export interface TaskUpdate {
  title?: string;
  category?: string;
  description?: string;
  priority?: 'urgent' | 'medium' | 'low';
  progress?: 'toDo' | 'inProgress' | 'awaitFeedback' | 'done';
  subtasks?: string[];
  assignedTo?: string;
  dueDate?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  /** Firestore-Instanz */
  private firestore: Firestore = inject(Firestore);

  /** Referenz zur Task-Collection in Firestore */
  private taskCollection = collection(this.firestore, 'tasks');

  /**
   * Holt alle Tasks aus Firestore als Observable (Realtime-Updates).
   * @returns Observable-Liste aller Tasks
   */
  getTasks(): Observable<Task[]> {
    return collectionData(this.taskCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  /**
   * Holt ein einzelnes Task anhand der ID.
   * @param taskId Die ID des Tasks
   * @returns Observable des Tasks
   */
  getTaskById(taskId: string): Observable<Task> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return docData(taskDoc, { idField: 'id' }) as Observable<Task>;
  }

  /**
   * Fügt ein neues Task in Firestore hinzu.
   * @param task Das Task-Objekt, das hinzugefügt werden soll
   * @returns Promise mit Referenz des erstellten Dokuments
   */
  addTask(task: Task) {
    return addDoc(this.taskCollection, task);
  }

  /**
   * Aktualisiert ein bestehendes Task.
   * @param taskId Die ID des zu aktualisierenden Tasks
   * @param data Teilweise Task-Daten, die aktualisiert werden sollen
   * @returns Promise<void>
   */
  updateTask(taskId: string, data: Partial<Task>) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskDoc, data);
  }

  /**
   * Löscht ein Task anhand der ID.
   * @param taskId Die ID des zu löschenden Tasks
   * @returns Promise<void>
   */
  deleteTask(taskId: string) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDoc);
  }

  /**
   * Aktualisiert nur den Status eines Tasks.
   * @param id Die ID des Tasks
   * @param newStatus Neuer Statuswert (toDo, inProgress, awaitFeedback, done)
   * @returns Promise<void>
   */
  updateTaskStatus(id: string, newStatus: string) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return updateDoc(taskDoc, { progress: newStatus as Task['progress'] });
  }
}