import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Observable } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

/**
 * Service zur Verwaltung von Kontakten.
 * 
 * Bietet Methoden zum Abrufen, Hinzufügen, Aktualisieren und Löschen von Kontakten
 * über den FirebaseService.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  /** Flag, das angibt, ob die Umgebung ein Browser ist (nicht genutzt). */
  isBrowser: any;

  /**
   * Erstellt eine neue Instanz des ContactService.
   * 
   * @param firebaseService - Service für Firebase-Datenzugriffe.
   */
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Liefert eine Observable-Liste aller Kontakte.
   * 
   * @returns Observable mit dem Array von Kontakten.
   */
  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts');
  }

  /**
   * Liefert einen Kontakt anhand seiner ID.
   * 
   * @param id - Die ID des Kontakts.
   * @returns Observable mit dem Kontakt oder `undefined`, wenn nicht gefunden.
   */
  getContactById(id: string): Observable<Contact | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  /**
   * Fügt einen neuen Kontakt hinzu.
   * 
   * @param contact - Der Kontakt ohne ID (wird automatisch generiert).
   * @returns Die ID des neu hinzugefügten Kontakts oder `null` bei Fehler.
   */
  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument('contacts', contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  /**
   * Aktualisiert einen bestehenden Kontakt.
   * 
   * @param id - ID des zu aktualisierenden Kontakts.
   * @param updates - Teilmenge der Kontakt-Daten, die aktualisiert werden sollen.
   * @returns `true`, wenn die Aktualisierung erfolgreich war, sonst `false`.
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument('contacts', id, updates);
      return true;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  /**
   * Löscht einen Kontakt anhand seiner ID.
   * 
   * @param id - ID des zu löschenden Kontakts.
   * @returns `true`, wenn die Löschung erfolgreich war, sonst `false`.
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
