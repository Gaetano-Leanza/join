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
 * ContactListComponent - Hauptkomponente für die Kontaktlistenansicht
 * 
 * Verantwortlich für:
 * - Laden und Gruppieren von Kontakten
 * - Anzeige der alphabetisch gruppierten Kontaktliste
 * - Öffnen der Detailansicht bei Kontaktauswahl
 * - Bearbeiten von Kontakten über Modal-Dialog
 * - Hinzufügen neuer Kontakte
 * 
 * @example
 * <app-contact-list></app-contact-list>
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  /** EventEmitter für ausgewählten Kontakt */
  @Output() contactSelected = new EventEmitter<Contact>();
  
  /** Service für Kontaktoperationen */
  private contactService = inject(ContactService);
  
  /** DestroyRef für RxJS Subscription Management */
  private destroyRef = inject(DestroyRef);

  /** Array aller geladener Kontakte */
  contacts: Contact[] = [];
  
  /** Gruppierte Kontakte nach Anfangsbuchstaben */
  groupedContacts: { [letter: string]: Contact[] } = {};
  
  /** Ladezustand der Komponente */
  loading = true;
  
  /** Fehlermeldung, falls vorhanden */
  error: string | null = null;
  
  /** Zustand für Overlay-Anzeige */
  isActive = false;

  /** Aktuell ausgewählter Kontakt für Detailansicht */
  selectedContact: Contact | null = null;

  /** Kontakt, der bearbeitet werden soll */
  contactToEdit: Contact | null = null;

  /** Sichtbarkeit des Bearbeitungsmodals */
  modal1Visible = false;
  
  /** Sichtbarkeit des Hinzufügen-Modals */
  modal2Visible = false;

  /** Farbpalette für Avatar-Hintergründe */
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
   * Konstruktor der ContactListComponent
   * @param platformId - ID der Plattform (Browser/Server)
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Initialisierungslogik der Komponente
   * Lädt Kontakte oder zeigt Server-Kontext-Fehler
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
   * Schaltet den Overlay-Zustand um
   */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /**
   * Lädt Kontakte vom ContactService
   * @throws Gibt Fehler aus wenn Laden fehlschlägt
   */
  loadContacts(): void {
    console.log('Lade Kontakte...');
    this.contactService
      .getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef), delay(0))
      .subscribe({
        next: (contacts) => {
          console.log(`${contacts.length} Kontakte geladen`, contacts);
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Fehler beim Laden der Kontakte:', error);
          this.error = 'Failed to load contacts';
          this.loading = false;
        },
      });
  }

  /**
   * Behandelt Server-Kontext (z.B. SSR)
   * Setzt entsprechende Fehlermeldung
   */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Contact loading requires browser context';
    console.warn(this.error);
  }

  /**
   * Ermittelt die Avatar-Hintergrundfarbe basierend auf dem Namen
   * @param name - Der Name des Kontakts
   * @returns Hex-Farbcode für den Avatar
   */
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }

  /**
   * Generiert Initialen aus dem Namen
   * @param name - Der vollständige Name
   * @returns Initialen (max. 2 Buchstaben)
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Gruppiert Kontakte nach Anfangsbuchstaben
   * @private
   */
  private groupContacts(): void {
    console.log('Gruppiere Kontakte...');
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(contact);
      return acc;
    }, {} as { [letter: string]: Contact[] });
    console.log('Gruppierte Kontakte:', this.groupedContacts);
  }

  /**
   * Handler für Kontaktauswahl
   * @param contact - Der ausgewählte Kontakt
   */
  onContactClick(contact: Contact): void {
    console.log('Kontakt geklickt - öffne Detail-Slider:', contact);
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
  }

  /**
   * Öffnet das Bearbeitungsmodal
   * @param contact - Der zu bearbeitende Kontakt
   */
  openEditModal(contact: Contact): void {
    console.log('Öffne Bearbeitungsmodal für:', contact);
    this.contactToEdit = contact;
    this.modal1Visible = true;
  }

  /**
   * Schließt die Detailansicht
   */
  closeDetailSlider(): void {
    this.selectedContact = null;
  }

  /**
   * Getter für gruppierte Kontakte als sortiertes Array
   * @returns Sortiertes Array von [Buchstabe, Kontakte[]] Paaren
   */
  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }

  /**
   * TrackBy-Funktion für die Kontaktliste
   * @param index - Index des Elements
   * @param contact - Kontaktobjekt
   * @returns Eindeutige ID des Kontakts
   */
  trackContact(index: number, contact: Contact): string {
    return contact.id;
  }

  /**
   * Öffnet das Modal zum Hinzufügen neuer Kontakte
   */
  openModal2(): void {
    console.log('Öffne Modal für neuen Kontakt');
    this.modal2Visible = true;
  }

  /**
   * Schließt das Bearbeitungsmodal
   */
  closeModal1(): void {
    console.log('Schließe Bearbeitungsmodal');
    this.modal1Visible = false;
    this.contactToEdit = null;
  }

  /**
   * Schließt das Hinzufügen-Modal
   */
  closeModal2(): void {
    console.log('Schließe Hinzufügen-Modal');
    this.modal2Visible = false;
  }

  /**
   * Handler für gespeicherte Kontakte
   * Lädt die Kontaktliste neu und schließt das Modal
   */
  onContactSaved(): void {
    console.log('Kontakt gespeichert - Aktualisiere Liste');
    this.loadContacts();
    this.closeModal1();
  }
}