import { inject, Injectable, Injector, runInInjectionContext, Optional } from '@angular/core';
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
  DocumentData,
  DocumentReference,
  UpdateData
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

/**
 * Service für Firestore-Operationen mit Angular und Firebase.
 * Bietet CRUD-Funktionen für Collections und Dokumente.
 * SSR-sicher durch optionale Firestore-Injection.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  /** Firestore-Instanz für Datenbankoperationen - OPTIONAL für SSR */
  private firestore: Firestore | null = null;

  /** Injector für `runInInjectionContext` zur sicheren Ausführung */
  private injector = inject(Injector);

  constructor(@Optional() firestore: Firestore) {
    this.firestore = firestore;
    console.log('FirebaseService initialisiert:', this.firestore ? 'mit Firestore' : 'ohne Firestore (SSR)');
  }

  /**
   * Überprüft ob Firestore verfügbar ist
   */
  private isFirestoreAvailable(): boolean {
    return !!this.firestore;
  }

  /**
   * Führt eine Operation innerhalb des Angular-Injektionskontextes aus.
   * @param operation Die auszuführende Funktion
   * @returns Das Ergebnis der Operation
   */
  private firestoreOperation<T>(operation: () => T): T | null {
    if (!this.isFirestoreAvailable()) {
      console.warn('Firestore nicht verfügbar (SSR) - Operation übersprungen');
      return null;
    }
    return runInInjectionContext(this.injector, operation);
  }

  /**
   * Holt alle Dokumente einer Collection, sortiert nach dem Feld 'name'.
   * @template T Typ der Dokumentdaten
   * @param path Pfad zur Collection
   * @returns Observable einer Liste von Dokumenten mit `id`
   */
  getCollectionData<T extends DocumentData>(path: string): Observable<(T & { id: string })[]> {
    if (!this.isFirestoreAvailable()) {
      console.warn('getCollectionData übersprungen (SSR) - leere Liste zurückgeben');
      return of([]);
    }

    const result = this.firestoreOperation(() => {
      const collectionRef = collection(this.firestore!, path);
      const q = query(collectionRef, orderBy('name', 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<(T & { id: string })[]>;
    });

    return result || of([]);
  }

  /**
   * Holt ein einzelnes Dokument anhand seiner ID.
   * @template T Typ der Dokumentdaten
   * @param collectionPath Pfad zur Collection
   * @param id Dokument-ID
   * @returns Observable des Dokuments oder `undefined`, falls nicht gefunden
   */
  getDocumentById<T extends DocumentData>(
    collectionPath: string,
    id: string
  ): Observable<(T & { id: string }) | undefined> {
    if (!this.isFirestoreAvailable()) {
      console.warn('getDocumentById übersprungen (SSR) - undefined zurückgeben');
      return of(undefined);
    }

    const result = this.firestoreOperation(() => {
      const ref = doc(this.firestore!, collectionPath, id) as DocumentReference<T, T>;
      return docData(ref, { idField: 'id' }) as Observable<(T & { id: string }) | undefined>;
    });

    return result || of(undefined);
  }

  /**
   * Fügt ein neues Dokument in eine Collection ein.
   * @template T Typ der Dokumentdaten
   * @param collectionPath Pfad zur Collection
   * @param data Die zu speichernden Daten
   * @returns Die ID des erstellten Dokuments
   */
  async addDocument<T extends DocumentData>(collectionPath: string, data: T): Promise<string> {
    if (!this.isFirestoreAvailable()) {
      console.warn('addDocument übersprungen (SSR) - leere ID zurückgeben');
      return '';
    }

    const result = this.firestoreOperation(async () => {
      const ref = collection(this.firestore!, collectionPath);
      const docRef = await addDoc(ref, data);
      return docRef.id;
    });

    return await (result || Promise.resolve(''));
  }

  /**
   * Aktualisiert ein bestehendes Dokument.
   * @template T Typ der Dokumentdaten
   * @param collectionPath Pfad zur Collection
   * @param id Dokument-ID
   * @param updates Die zu aktualisierenden Felder
   */
  async updateDocument<T extends DocumentData>(
    collectionPath: string,
    id: string,
    updates: UpdateData<T>
  ): Promise<void> {
    if (!this.isFirestoreAvailable()) {
      console.warn('updateDocument übersprungen (SSR)');
      return;
    }

    const result = this.firestoreOperation(async () => {
      const ref = doc(this.firestore!, collectionPath, id) as DocumentReference<T, T>;
      await updateDoc(ref, updates);
    });

    if (result) {
      await result;
    }
  }

  /**
   * Löscht ein Dokument anhand seiner ID.
   * @param collectionPath Pfad zur Collection
   * @param id Dokument-ID
   */
  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    if (!this.isFirestoreAvailable()) {
      console.warn('deleteDocument übersprungen (SSR)');
      return;
    }

    const result = this.firestoreOperation(async () => {
      const ref = doc(this.firestore!, collectionPath, id);
      await deleteDoc(ref);
    });

    if (result) {
      await result;
    }
  }
}