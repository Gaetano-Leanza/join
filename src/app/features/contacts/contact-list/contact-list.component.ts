import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model'; 
import { delay } from 'rxjs/operators';
import { ModalComponent } from '../modal/modal.component';
import { Modal2Component } from '../modal2/modal2.component';


/**
 * Komponente zur Anzeige einer alphabetisch gruppierten Kontaktliste.
 *
 * Lädt Kontakte vom ContactService, zeigt sie gruppiert an und ermöglicht das
 * Öffnen und Bearbeiten einzelner Kontakte in Modal-Fenstern.
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  /**
   * Event, das ausgelöst wird, wenn ein Kontakt ausgewählt wurde.
   */
  @Output() contactSelected = new EventEmitter<Contact>();

  /** Service für Kontakt-Datenzugriff (wird per `inject` eingebunden) */
  private contactService = inject(ContactService);

  /** Referenz zum Lifecycle-Destroy-Token für unsubscription */
  private destroyRef = inject(DestroyRef);

  /** Alle geladenen Kontakte */
  contacts: Contact[] = [];

  /** Kontakte gruppiert nach erstem Buchstaben des Namens */
  groupedContacts: { [letter: string]: Contact[] } = {};

  /** Zeigt Ladezustand an */
  loading = true;

  /** Fehlermeldung bei Ladefehler */
  error: string | null = null;

  /** Steuert eine optionale UI-Overlay-Anzeige */
  isActive = false;

  /** Aktuell selektierter Kontakt */
  selectedContact: Contact | null = null;

  /** Steuerung Sichtbarkeit des ersten Modals */
  modal1Visible = false;

  /** Steuerung Sichtbarkeit des zweiten Modals */
  modal2Visible = false;

  /** Kontakt, der im Modal zum Bearbeiten gesetzt wird */
  contactToEdit: Contact | null = null;

  /** Mögliche Farben für Avatar-Hintergründe */
  private avatarColors: string[] = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#3F51B5',
    '#03A9F4',
    '#009688',
    '#4CAF50',
    '#FFC107',
    '#FF9800',
    '#795548',
  ];

  /**
   * Konstruktor mit Plattform-ID Injection, um Plattform-Kontext zu prüfen.
   * @param platformId Plattform-Kontext (Browser / Server)
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Lifecycle-Hook beim Initialisieren der Komponente.
   * Prüft Plattform und lädt Kontakte im Browser-Kontext.
   */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    setTimeout(() => {
      this.loadContacts();
    });
  }

  /**
   * Umschalten eines Overlays in der UI.
   */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /**
   * Lädt alle Kontakte vom Service und gruppiert sie alphabetisch.
   * Handhabt Fehler und aktualisiert Ladezustand.
   */
  loadContacts(): void {
    this.contactService
      .getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef), delay(0))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.error = 'Failed to load contacts';
          this.loading = false;
        },
      });
  }

  /**
   * Behandlung bei Ausführung im Server-Kontext (z.B. SSR).
   * Setzt Ladezustand und Fehlerhinweis.
   */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Contact loading requires browser context';
    console.warn(this.error);
  }

  /**
   * Bestimmt eine Avatar-Hintergrundfarbe basierend auf dem ersten Buchstaben des Namens.
   * @param name Name des Kontakts
   * @returns Hex-Farbcode für Avatar-Hintergrund
   */
  getAvatarColor(name: string): string {
    const colors = ['#5c6bc0', '#007cee', '#4caf50', '#f44336', '#ff9800'];
    if (!name) return colors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  /**
   * Extrahiert Initialen aus dem Namen (maximal 2 Buchstaben).
   * @param name Vollständiger Name
   * @returns Großbuchstaben der ersten zwei Namensbestandteile
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Gruppiert die Kontakte alphabetisch nach dem ersten Buchstaben.
   */
  private groupContacts(): void {
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = [...(acc[letter] || []), contact];
      return acc;
    }, {} as { [letter: string]: Contact[] });
  }

  /**
   * Behandelt Klick auf einen Kontakt.
   * Setzt selektierten Kontakt und emittiert `contactSelected`.
   * @param contact Angeclickter Kontakt
   */
  onContactClick(contact: Contact): void {
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
    console.log('Ausgewählter Kontakt:', contact);
  }

  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }

  editContact(contactId: string) {
    console.log('🔍 editContact START mit ID:', contactId, typeof contactId);

    this.contactService.getContactById(contactId).subscribe(
      (contact) => {
        console.log('📌 Kontakt vom Service erhalten:', contact);

        if (contact) {
          this.contactToEdit = {
            id: contact.id, 
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
          };

          this.modal1Visible = true;

          console.log('✅ Parent Werte korrekt gesetzt:', {
            contactToEdit: this.contactToEdit,
            modal1Visible: this.modal1Visible,
            idType: typeof this.contactToEdit.id,
          });
        } else {
          console.warn('⚠️ Kein Kontakt gefunden mit ID:', contactId);
          this.contactToEdit = null;
          this.modal1Visible = false;
        }
      },
      (error) => {
        console.error('❌ Fehler beim Laden des Kontakts:', error);
        this.contactToEdit = null;
        this.modal1Visible = false;
      }
    );
  }

  /**
   * Öffnet das erste Modal.
   */
  openModal1() {
    this.modal1Visible = true;
  }

  /**
   * Öffnet das zweite Modal.
   */
  openModal2() {
    this.modal2Visible = true;
  }

  /**
   * Schließt das erste Modal und setzt den bearbeiteten Kontakt zurück. */

  closeModal1() {
    this.modal1Visible = false;
    this.contactToEdit = null; // Kontakt zurücksetzen beim Schließen
  }

  /**
   * Schließt das zweite Modal.
   */
  closeModal2() {
    this.modal2Visible = false;
  }

  /**
   * Wird aufgerufen, wenn ein Kontakt im Modal erfolgreich gespeichert wurde.
   * Lädt die Kontaktliste neu und schließt das Modal.
   */
  onContactSaved() {
    this.loadContacts();
    this.closeModal1();
  }
}
