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

/**
 * Service für den Zugriff auf Firestore-Datenbank.
 * Führt CRUD-Operationen auf Collections und Dokumenten aus.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private injector = inject(Injector);
  private firestore = inject(Firestore);

  /**
   * Führt eine Funktion im Angular-Injektionskontext aus.
   * @param fn Funktion, die im InjectionContext ausgeführt wird.
   * @returns Ergebnis der Funktion.
   */
  private executeInContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

  /**
   * Gibt die Daten einer Collection zurück, optional sortiert nach einem Feld.
   * @template T Typ der zurückgegebenen Objekte.
   * @param collectionPath Pfad der Collection.
   * @param orderField Feldname zum Sortieren (Standard: 'name').
   * @returns Observable mit dem Array der Dokumente.
   */
  getCollectionData<T>(collectionPath: string, orderField: string = 'name'): Observable<T[]> {
    return this.executeInContext(() => {
      const ref = collection(this.firestore, collectionPath);
      const q = query(ref, orderBy(orderField, 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<T[]>;
    });
  }

  /**
   * Gibt ein einzelnes Dokument anhand der ID zurück.
   * @template T Typ des zurückgegebenen Dokuments.
   * @param collectionPath Pfad der Collection.
   * @param id ID des Dokuments.
   * @returns Observable mit dem Dokument.
   */
  getDocumentById<T>(collectionPath: string, id: string): Observable<T> {
    return this.executeInContext(() => {
      const ref = doc(this.firestore, collectionPath, id);
      return docData(ref, { idField: 'id' }) as Observable<T>;
    });
  }

  /**
   * Fügt ein neues Dokument in der Collection hinzu.
   * @template T Typ der Daten.
   * @param collectionPath Pfad der Collection.
   * @param data Daten des neuen Dokuments.
   * @returns Promise mit der ID des neuen Dokuments.
   */
  async addDocument<T extends DocumentData>(collectionPath: string, data: T): Promise<string> {
    return this.executeInContext(async () => {
      const ref = collection(this.firestore, collectionPath);
      const docRef = await addDoc(ref, data);
      return docRef.id;
    });
  }

  /**
   * Aktualisiert ein Dokument mit den gegebenen Änderungen.
   * @template T Typ des Dokuments.
   * @param collectionPath Pfad der Collection.
   * @param id ID des zu aktualisierenden Dokuments.
   * @param updates Teilobjekt mit zu ändernden Feldern.
   * @returns Promise<void>
   */
  async updateDocument<T>(collectionPath: string, id: string, updates: Partial<T>): Promise<void> {
    return this.executeInContext(async () => {
      const ref = doc(this.firestore, collectionPath, id);
      await updateDoc(ref, updates);
    });
  }

  /**
   * Löscht ein Dokument anhand seiner ID.
   * @param collectionPath Pfad der Collection.
   * @param id ID des zu löschenden Dokuments.
   * @returns Promise<void>
   */
  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    return this.executeInContext(async () => {
      const ref = doc(this.firestore, collectionPath, id);
      await deleteDoc(ref);
    });
  }
}
