import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Observable } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

/**
 * Service zur Verwaltung von Kontakten über Firebase.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  /** ID des aktuell ausgewählten Kontakts */
  private selectedContactId: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  /** Setzt die aktuell ausgewählte Kontakt-ID */
  setSelectedContact(contactId: string | null): void {
    this.selectedContactId = contactId;
  }

  /** Gibt die aktuell ausgewählte Kontakt-ID zurück */
  getSelectedContactId(): string | null {
    return this.selectedContactId;
  }

  /** Liefert alle Kontakte aus Firebase zurück */
  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts');
  }

  /** Liefert einen einzelnen Kontakt anhand der ID zurück */
  getContactById(id: string): Observable<Contact | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  /** Fügt einen neuen Kontakt hinzu */
  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument('contacts', contact);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kontakts:', error);
      return null;
    }
  }

  /** Aktualisiert einen bestehenden Kontakt */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument('contacts', id, updates);
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
      return false;
    }
  }

  /** Löscht einen Kontakt */
  async deleteContact(id: string): Promise<boolean> {
    try {
      await this.firebaseService.deleteDocument('contacts', id);
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Kontakts:', error);
      return false;
    }
  }
}
