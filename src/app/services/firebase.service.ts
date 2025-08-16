import { inject, Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  addDoc,
  doc,
  docData,
  updateDoc,
  deleteDoc,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);

  getCollectionData<T>(path: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, path);
    const q = query(collectionRef, orderBy('name', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Liefert die Daten eines einzelnen Dokuments anhand seiner ID.
   * 
   * @template T Typ des Dokuments
   * @param collectionPath Pfad der Collection
   * @param id ID des Dokuments
   * @returns Observable mit dem Dokument vom Typ T
   */
  getDocumentById<T>(collectionPath: string, id: string): Observable<T> {
    const ref = doc(this.firestore, collectionPath, id);
    return docData(ref, { idField: 'id' }) as Observable<T>;
  }

  /**
   * Fügt ein neues Dokument in eine Collection ein.
   * 
   * @template T Typ der Daten, die hinzugefügt werden
   * @param collectionPath Pfad der Collection
   * @param data Objekt mit den Daten für das neue Dokument
   * @returns Promise, das die ID des neu erstellten Dokuments zurückgibt
   */
  async addDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    const ref = collection(this.firestore, collectionPath);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  /**
   * Aktualisiert ein bestehendes Dokument.
   * 
   * @template T Typ der Daten im Dokument
   * @param collectionPath Pfad der Collection
   * @param id ID des zu aktualisierenden Dokuments
   * @param updates Teilobjekt mit den zu aktualisierenden Feldern
   * @returns Promise<void>
   */
  async updateDocument<T>(
    collectionPath: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const ref = doc(this.firestore, collectionPath, id);
    await updateDoc(ref, updates);
  }

  /**
   * Löscht ein Dokument anhand seiner ID.
   * 
   * @param collectionPath Pfad der Collection
   * @param id ID des zu löschenden Dokuments
   * @returns Promise<void>
   */
  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    const ref = doc(this.firestore, collectionPath, id);
    await deleteDoc(ref);
  }
}
