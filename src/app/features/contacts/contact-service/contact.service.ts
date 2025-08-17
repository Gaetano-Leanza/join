import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

/**
 * Service zur Verwaltung von Kontakten über Firebase.
 * 
 * Verwaltet:
 * - Auswahl eines Kontakts
 * - CRUD-Operationen (Create, Read, Update, Delete)
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  /** ID des aktuell ausgewählten Kontakts */
  private selectedContactId: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Setzt die aktuell ausgewählte Kontakt-ID.
   * @param contactId ID des Kontakts oder null
   */
  setSelectedContact(contactId: string | null): void {
    this.selectedContactId = contactId;
  }

  /**
   * Gibt die aktuell ausgewählte Kontakt-ID zurück.
   * @returns ID des Kontakts oder null
   */
  getSelectedContactId(): string | null {
    return this.selectedContactId;
  }

  /**
   * Holt alle Kontakte aus Firebase.
   * @returns Observable mit einer Liste von Kontakten inkl. ID
   */
  getContacts(): Observable<(Contact & { id: string })[]> {
    return this.firebaseService.getCollectionData<Contact>('contacts').pipe(
      tap(() => console.debug('Kontakte erfolgreich geladen')),
      catchError((err) => {
        console.error('Firebase Fehler:', err);
        return throwError(() => new Error('Datenbankfehler'));
      })
    );
  }

  /**
   * Holt einen einzelnen Kontakt anhand der ID.
   * @param id ID des Kontakts
   * @returns Observable mit Kontakt inkl. ID oder undefined
   */
  getContactById(id: string): Observable<(Contact & { id: string }) | undefined> {
    return this.firebaseService.getDocumentById<Contact>('contacts', id);
  }

  /**
   * Fügt einen neuen Kontakt hinzu.
   * @param contact Kontakt ohne ID
   * @returns Promise mit der neuen Kontakt-ID oder null bei Fehler
   */
  async addContact(contact: Omit<Contact, 'id'>): Promise<string | null> {
    try {
      return await this.firebaseService.addDocument<Contact>('contacts', contact as Contact);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kontakts:', error);
      return null;
    }
  }

  /**
   * Aktualisiert einen bestehenden Kontakt.
   * @param id ID des Kontakts
   * @param updates Teilobjekt mit zu aktualisierenden Feldern
   * @returns Promise, true bei Erfolg, false bei Fehler
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    try {
      await this.firebaseService.updateDocument<Contact>('contacts', id, updates);
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
      return false;
    }
  }

  /**
   * Löscht einen Kontakt anhand der ID.
   * @param id ID des Kontakts
   * @returns Promise, true bei Erfolg, false bei Fehler
   */
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
