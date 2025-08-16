import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// AngularFire / Firestore
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore = inject(Firestore);

  getCollectionData<T>(
    collectionPath: string,
    orderField: string = 'name'
  ): Observable<T[]> {
    const ref = collection(this.firestore, collectionPath);
    const q = query(ref, orderBy(orderField, 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  getDocumentById<T>(collectionPath: string, id: string): Observable<T> {
    const ref = doc(this.firestore, collectionPath, id);
    return docData(ref, { idField: 'id' }) as Observable<T>;
  }

  async addDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    const ref = collection(this.firestore, collectionPath);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  async updateDocument<T>(
    collectionPath: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const ref = doc(this.firestore, collectionPath, id);
    await updateDoc(ref, updates);
  }

  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    const ref = doc(this.firestore, collectionPath, id);
    await deleteDoc(ref);
  }
}