// contact.service.ts

import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Observable, of } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  isBrowser: any;
  constructor(private firebaseService: FirebaseService) {}

  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts');
  }

  getContactById(id: string): Observable<Contact | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument('contacts', contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument('contacts', id, updates);
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      await this.firebaseService.deleteDocument('contacts', id);
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }
}
