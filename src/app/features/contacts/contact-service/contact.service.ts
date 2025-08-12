import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Observable } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

/**
 * Service for managing contact data operations
 * Provides CRUD operations and state management for contacts using Firebase
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  /** Browser detection property */
  isBrowser: any;
  
  /** ID of currently selected contact */
  private selectedContactId: string | null = null; 

  /**
   * Constructor
   * @param {FirebaseService} firebaseService - Injected Firebase service for data operations
   */
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Sets the currently selected contact ID
   * @param {string | null} contactId - ID of contact to select, or null to deselect
   */
  setSelectedContact(contactId: string | null): void {
    this.selectedContactId = contactId;
  }

  /**
   * Gets the currently selected contact ID
   * @returns {string | null} ID of selected contact or null if none selected
   */
  getSelectedContactId(): string | null {
    return this.selectedContactId;
  }

  /**
   * Retrieves all contacts from Firebase
   * @returns {Observable<Contact[]>} Observable stream of contact array
   */
  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts');
  }

  /**
   * Retrieves a specific contact by ID
   * @param {string} id - Contact ID to retrieve
   * @returns {Observable<Contact | undefined>} Observable of contact or undefined if not found
   */
  getContactById(id: string): Observable<Contact | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  /**
   * Adds a new contact to Firebase
   * @param {Omit<Contact, 'id'>} contact - Contact data without ID
   * @returns {Promise<string | null>} Promise resolving to new contact ID or null on error
   */
  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument('contacts', contact);
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates an existing contact in Firebase
   * @param {string} id - ID of contact to update
   * @param {Partial<Contact>} updates - Partial contact data with changes
   * @returns {Promise<boolean>} Promise resolving to true on success, false on error
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument('contacts', id, updates);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deletes a contact from Firebase
   * @param {string} id - ID of contact to delete
   * @returns {Promise<boolean>} Promise resolving to true on success, false on error
   */
  async deleteContact(id: string): Promise<boolean> {
    try {
      await this.firebaseService.deleteDocument('contacts', id);
      return true;
    } catch (error) {
      return false;
    }
  }
}