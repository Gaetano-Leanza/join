import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  // 👇 Öffentlich zugänglich machen
  public get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getContactById(id: string): Observable<Contact | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }
    try {
      const contactDoc = doc(this.firestore, 'contacts', id);
      return docData(contactDoc, { idField: 'id' }) as Observable<Contact | undefined>;
    } catch (error) {
      console.error('Error loading contact by id:', error);
      return of(undefined);
    }
  }

  getContacts(): Observable<Contact[]> {
    if (!this.isBrowser) {
      return of([]);
    }
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const q = query(contactsRef, orderBy('name', 'asc'));
      return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
    } catch (error) {
      console.error('Error loading contacts:', error);
      return of([]);
    }
  }

  getContact(id: string): Observable<Contact | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }
    try {
      const contactDoc = doc(this.firestore, 'contacts', id);
      return docData(contactDoc, { idField: 'id' }) as Observable<Contact>;
    } catch (error) {
      console.error('Error loading contact:', error);
      return of(undefined);
    }
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    if (!this.isBrowser) {
      console.warn('ContactService addContact called on server side');
      return null;
    }
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const docRef: DocumentReference = await addDoc(contactsRef, contact);
      console.log('Contact added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    if (!this.isBrowser) {
      console.warn('ContactService updateContact called on server side');
      return false;
    }
    try {
      const contactDoc = doc(this.firestore, 'contacts', id);
      await updateDoc(contactDoc, updates);
      console.log('Contact updated:', id);
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    if (!this.isBrowser) {
      console.warn('ContactService deleteContact called on server side');
      return false;
    }
    try {
      const contactDoc = doc(this.firestore, 'contacts', id);
      await deleteDoc(contactDoc);
      console.log('Contact deleted:', id);
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }
}
