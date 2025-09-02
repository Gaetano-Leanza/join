import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

/**
 * @description Service for managing contacts via Firebase.
 *
 * Manages:
 * - Contact selection
 * - CRUD operations (Create, Read, Update, Delete)
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  /**
   * @description The ID of the currently selected contact.
   */
  private selectedContactId: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  /**
   * @description Sets the currently selected contact ID.
   * @param contactId The ID of the contact or null.
   */
  setSelectedContact(contactId: string | null): void {
    this.selectedContactId = contactId;
  }

  /**
   * @description Returns the currently selected contact ID.
   * @returns The contact's ID or null.
   */
  getSelectedContactId(): string | null {
    return this.selectedContactId;
  }

  /**
   * @description Fetches all contacts from Firebase.
   * @returns An Observable with a list of contacts including their IDs.
   */
  getContacts(): Observable<(Contact & { id: string })[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts').pipe(
      tap(() => console.debug('Contacts loaded successfully')),
      catchError((err) => {
        console.error('Firebase error:', err);
        return throwError(() => new Error('Database error'));
      })
    );
  }

  /**
   * @description Fetches a single contact by ID.
   * @param id The ID of the contact.
   * @returns An Observable with the contact including its ID or undefined.
   */
  getContactById(id: string): Observable<(Contact & { id: string }) | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  /**
   * @description Adds a new contact.
   * @param contact The contact without an ID.
   * @returns A Promise with the new contact's ID or null on error.
   */
  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument<Contact>('contacts', contact as Contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  /**
   * @description Updates an existing contact.
   * @param id The ID of the contact.
   * @param updates A partial object with the fields to update.
   * @returns A Promise that resolves to true on success, false on error.
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument<Contact>('contacts', id, updates);
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  /**
   * @description Deletes a contact by ID.
   * @param id The ID of the contact.
   * @returns A Promise that resolves to true on success, false on error.
   */
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