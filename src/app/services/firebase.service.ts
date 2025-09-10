import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Optional,
} from '@angular/core';
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
  UpdateData,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

/**
 * @description Service for Firestore operations with Angular and Firebase.
 * Provides CRUD functions for collections and documents.
 * SSR-safe due to optional Firestore injection.
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  /**
   * @description Firestore instance for database operations - OPTIONAL for SSR.
   */
  private firestore: Firestore | null = null;
  /**
   * @description Injector for `runInInjectionContext` for safe execution.
   */

  private injector = inject(Injector);

  /**
   * @constructor
   * @param {Firestore} firestore - Optional Firestore instance, making the service SSR-safe.
   */
  constructor(@Optional() firestore: Firestore) {
    this.firestore = firestore;
  }
  /**
   * @description Checks if Firestore is available.
   * @returns True if Firestore is available.
   */

  private isFirestoreAvailable(): boolean {
    return !!this.firestore;
  }
  /**
   * @description Executes an operation within the Angular injection context.
   * @param operation The function to be executed.
   * @returns The result of the operation.
   */

  private firestoreOperation<T>(operation: () => T): T | null {
    if (!this.isFirestoreAvailable()) {
      return null;
    }
    return runInInjectionContext(this.injector, operation);
  }
  /**
   * @description Validates user credentials by checking email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A promise that resolves with the user data object if valid, otherwise null.
   */

  async validateUser(email: string, password: string): Promise<any> {
    if (!this.isFirestoreAvailable()) {
      return null;
    }

    try {
      const result = this.firestoreOperation(async () => {
        const usersRef = collection(this.firestore!, 'users');
        const q = query(
          usersRef,
          where('email', '==', email),
          where('password', '==', password)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Return the first user found (including all data)
          const userDoc = querySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
      });
      return await (result || Promise.resolve(null));
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }
  /**
   * @description Fetches all documents from a collection, sorted by the 'name' field.
   * @template T Type of the document data.
   * @param path The path to the collection.
   * @returns An Observable of a list of documents with `id`.
   */

  getCollectionData<T extends DocumentData>(
    path: string
  ): Observable<(T & { id: string })[]> {
    if (!this.isFirestoreAvailable()) {
      return of([]);
    }

    const result = this.firestoreOperation(() => {
      const collectionRef = collection(this.firestore!, path);
      const q = query(collectionRef, orderBy('name', 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<
        (T & { id: string })[]
      >;
    });

    return result || of([]);
  }
  /**
   * @description Fetches a single document by its ID.
   * @template T Type of the document data.
   * @param collectionPath The path to the collection.
   * @param id The document ID.
   * @returns An Observable of the document or `undefined` if not found.
   */

  getDocumentById<T extends DocumentData>(
    collectionPath: string,
    id: string
  ): Observable<(T & { id: string }) | undefined> {
    if (!this.isFirestoreAvailable()) {
      return of(undefined);
    }

    const result = this.firestoreOperation(() => {
      const ref = doc(this.firestore!, collectionPath, id) as DocumentReference<
        T,
        T
      >;
      return docData(ref, { idField: 'id' }) as Observable<
        (T & { id: string }) | undefined
      >;
    });

    return result || of(undefined);
  }
  /**
   * @description Adds a new document to a collection.
   * @template T Type of the document data.
   * @param collectionPath The path to the collection.
   * @param data The data to be saved.
   * @returns The ID of the created document.
   */

  async addDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    if (!this.isFirestoreAvailable()) {
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
   * @description Updates an existing document.
   * @template T Type of the document data.
   * @param collectionPath The path to the collection.
   * @param id The document ID.
   * @param updates The fields to be updated.
   */

  async updateDocument<T extends DocumentData>(
    collectionPath: string,
    id: string,
    updates: UpdateData<T>
  ): Promise<void> {
    if (!this.isFirestoreAvailable()) {
      return;
    }

    const result = this.firestoreOperation(async () => {
      const ref = doc(this.firestore!, collectionPath, id) as DocumentReference<
        T,
        T
      >;
      await updateDoc(ref, updates);
    });

    if (result) {
      await result;
    }
  }
  /**
   * @description Deletes a document by its ID.
   * @param collectionPath The path to the collection.
   * @param id The document ID.
   */

  async deleteDocument(collectionPath: string, id: string): Promise<void> {
    if (!this.isFirestoreAvailable()) {
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
