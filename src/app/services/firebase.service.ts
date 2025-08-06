import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private injector = inject(Injector);
  private firestore = inject(Firestore);

  private executeInContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

  getCollectionData<T>(collectionPath: string, orderField: string = 'name'): Observable<T[]> {
    return this.executeInContext(() => {
      const ref = collection(this.firestore, collectionPath);
      const q = query(ref, orderBy(orderField, 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<T[]>;
    });
  }

  getDocumentById<T>(collectionPath: string, id: string): Observable<T> {
    return this.executeInContext(() => {
      const ref = doc(this.firestore, collectionPath, id);
      return docData(ref, { idField: 'id' }) as Observable<T>;
    });
  }

  async addDocument<T extends DocumentData>(collectionPath: string, data: T): Promise<string> {
    return this.executeInContext(async () => {
      const ref = collection(this.firestore, collectionPath);
      const docRef = await addDoc(ref, data);
      return docRef.id;
    });
  }

  async updateDocument<T>(collectionPath: string, id: string, updates: Partial<T>): Promise<void> {
    return this.executeInContext(async () => {
      const ref = doc(this.firestore, collectionPath, id);
      await updateDoc(ref, updates);
    });
  }

  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    return this.executeInContext(async () => {
      const ref = doc(this.firestore, collectionPath, id);
      await deleteDoc(ref);
    });
  }
}