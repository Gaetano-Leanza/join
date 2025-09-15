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
 * @description Interface for a Subtask document.
 */
export interface Subtask {
  /** The title of the subtask. */
  title: string;
  /** The completion status of the subtask. */
  done: boolean;
}

/**
 * @description Interface for a Task document in Firestore.
 */
export interface Task {
  /** The unique identifier of the task. */
  id: string;
  /** The title of the task. */
  title: string;
  /** The description of the task. */
  description: string;
  /** The due date of the task as an ISO string. */
  dueDate: string;
  /** The priority of the task. */
  priority: 'low' | 'medium' | 'urgent';
  /** The progress status of the task. */
  progress: 'toDo' | 'inProgress' | 'awaitFeedback' | 'done';
  /** The category of the task. */
  category: string;
  /** The color associated with the category for UI purposes. */
  categoryColor: string;
  /** The name of the person or people assigned to the task. */
  assignedTo: string;
  /** A list of contacts assigned to the task. */
  contacts: string[];
  /** A list of subtasks associated with the task. */
  subtasks: Subtask[];
  /** An optional status for additional labeling. */
  status?: string;
}

/**
 * @description Interface for task updates, where all fields are optional.
 */
export interface TaskUpdate {
  title?: string;
  category?: string;
  description?: string;
  priority?: 'urgent' | 'medium' | 'low';
  progress?: 'toDo' | 'inProgress' | 'awaitFeedback' | 'done';
  subtasks?: Subtask[];
  assignedTo?: string;
  dueDate?: string;
  contacts?: string[];
  categoryColor?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  /** The Firestore instance injected by Angular. */
  private firestore = inject(Firestore);

  /**
   * @description Fetches all tasks from Firestore as an Observable for real-time updates.
   * @returns An Observable list of all tasks.
   */
  getTasks(): Observable<Task[]> {
    const taskCollection = collection(this.firestore, 'tasks');
    return collectionData(taskCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  /**
   * @description Fetches a single task by its ID.
   * @param taskId The ID of the task.
   * @returns An Observable of the task.
   */
  getTaskById(taskId: string): Observable<Task> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return docData(taskDoc, { idField: 'id' }) as Observable<Task>;
  }

  /**
   * @description Adds a new task to Firestore.
   * @param task The task object to be added.
   * @returns A Promise with the reference of the created document.
   */
  addTask(task: Task) {
    const taskCollection = collection(this.firestore, 'tasks');
    return addDoc(taskCollection, task);
  }

  /**
   * @description Updates an existing task.
   * @param taskId The ID of the task to be updated.
   * @param data Partial task data to be updated.
   * @returns A Promise that resolves when the update is complete.
   */
  updateTask(taskId: string, data: Partial<Task>) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskDoc, data);
  }

  /**
   * @description Deletes a task by its ID.
   * @param taskId The ID of the task to be deleted.
   * @returns A Promise that resolves when the deletion is complete.
   */
  deleteTask(taskId: string) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDoc);
  }

  /**
   * @description Updates only the progress status of a task.
   * @param id The ID of the task.
   * @param newStatus The new progress status value ('toDo', 'inProgress', 'awaitFeedback', 'done').
   * @returns A Promise that resolves when the update is complete.
   */
  updateTaskStatus(id: string, newStatus: string) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return updateDoc(taskDoc, { progress: newStatus as Task['progress'] });
  }
}
