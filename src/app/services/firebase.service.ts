import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  // Prüft, ob wir im Browser sind
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Collection Data laden
  getCollectionData<T>(collectionName: string): Observable<T[]> {
    if (!this.isBrowser) {
      return of([]); // Leeres Array für SSR
    }
    
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<T[]>;
  }

  // Einzelnes Dokument laden
  getDocumentData<T>(collectionName: string, id: string): Observable<T | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }
    
    const docRef = doc(this.firestore, collectionName, id);
    return docData(docRef) as Observable<T>;
  }

  // Dokument hinzufügen
  async addDocument<T>(collectionName: string, data: T): Promise<string | null> {
    if (!this.isBrowser) {
      return null;
    }
    
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  }

  // Dokument aktualisieren
  async updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }
    
    try {
      const docRef = doc(this.firestore, collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }

  // Dokument löschen
  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }
    
    try {
      const docRef = doc(this.firestore, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}