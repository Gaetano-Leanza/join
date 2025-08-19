import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * Interface für ein Task-Dokument in Firestore
 */
export interface Task {
  id?: string;                                // Firestore ID
  title: string;                              
  category: string;                           
  description: string;                       
  priority: 'urgent' | 'medium' | 'low';    
  status: 'todo' | 'inprogress' | 'awaitfeedback' | 'done'; // Board-Status
  subtasks?: string[];                      

  /** 
   * Verknüpfung zu einem Kontakt:
   * Hier wird nur die ID aus der Collection "contacts" gespeichert.
   * Den kompletten Kontakt kannst du über ContactService nachladen.
   */
  assignedTo?: string;                        // z.B. "contactDocId"
  
  dueDate?: string;                           // z.B. "28/08/2025"
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore: Firestore = inject(Firestore);
  private taskCollection = collection(this.firestore, 'tasks');

  /**
   * Holt alle Tasks aus Firestore als Observable (Realtime-Updates).
   */
  getTasks(): Observable<Task[]> {
    return collectionData(this.taskCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  /**
   * Holt ein einzelnes Task anhand der ID.
   */
  getTaskById(taskId: string): Observable<Task> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return docData(taskDoc, { idField: 'id' }) as Observable<Task>;
  }

  /**
   * Fügt ein neues Task in Firestore hinzu.
   */
  addTask(task: Task) {
    return addDoc(this.taskCollection, task);
  }

  /**
   * Aktualisiert ein bestehendes Task.
   */
  updateTask(taskId: string, data: Partial<Task>) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskDoc, data);
  }

  /**
   * Löscht ein Task.
   */
  deleteTask(taskId: string) {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDoc);
  }
}