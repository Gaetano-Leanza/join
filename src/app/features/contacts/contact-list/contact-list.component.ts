import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';
import { delay } from 'rxjs/operators';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  /**
   * EventEmitter, der ausgelöst wird, wenn ein Kontakt ausgewählt wird.
   * Gibt das ausgewählte Contact-Objekt weiter.
   */
  @Output() contactSelected = new EventEmitter<Contact>();

  /** Service zum Laden der Kontakte */
  private contactService = inject(ContactService);

  /** Referenz zum Zerstören von Subscriptions bei Komponentenzerstörung */
  private destroyRef = inject(DestroyRef);

  /** Liste aller Kontakte */
  contacts: Contact[] = [];

  /** Kontakte gruppiert nach Anfangsbuchstaben des Namens */
  groupedContacts: { [letter: string]: Contact[] } = {};

  /** Status, ob Kontakte gerade geladen werden */
  loading = true;

  /** Fehlermeldung, falls das Laden fehlschlägt */
  error: string | null = null;

  /** Flag für das Overlay (z.B. Menü sichtbar oder nicht) */
  isActive = false;

  /** Farbpalette für Avatare */
  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  /**
   * Konstruktor
   * @param platformId Plattformkennung zur Unterscheidung Browser/Server
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Angular Lifecycle-Hook, der nach der Initialisierung ausgeführt wird.
   * Lädt die Kontakte nur im Browser-Kontext.
   */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }

    // SetTimeout sorgt dafür, dass das Laden asynchron erfolgt
    setTimeout(() => {
      this.loadContacts();
    });
  }

  /**
   * Schaltet den Overlay-Zustand um (sichtbar/nicht sichtbar)
   */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /**
   * Lädt die Kontaktliste vom Service.
   * Abonniert den Observable-Stream und verarbeitet die Ergebnisse.
   * Bei Fehlern wird eine Fehlermeldung gesetzt.
   */
  private loadContacts(): void {
    this.contactService.getContacts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        delay(0) // Verzögerung, um den Observable-Stream asynchron zu machen
      )
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
        }
      });
  }

  /**
   * Behandlung, wenn die Komponente auf dem Server gerendert wird.
   * Setzt den Lade-Status auf false und zeigt eine Warnung an.
   */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Contact loading requires browser context';
    console.warn(this.error);
  }

  /**
   * Berechnet eine Avatar-Farbe basierend auf dem Namen des Kontakts.
   * @param name Name des Kontakts
   * @returns Hex-Farbcode aus der Farbpalette
   */
  getAvatarColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  /**
   * Gibt die Initialen eines Namens zurück (zwei Buchstaben groß).
   * @param name Vollständiger Name
   * @returns Initialen (max. 2 Buchstaben)
   */
  getInitials(name: string): string {
    return name.split(' ')
              .map(part => part.charAt(0).toUpperCase())
              .slice(0, 2)
              .join('');
  }

  /**
   * Gruppiert die Kontakte nach ihrem Anfangsbuchstaben.
   * Das Ergebnis wird in groupedContacts gespeichert.
   */
  private groupContacts(): void {
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = [...(acc[letter] || []), contact];
      return acc;
    }, {} as { [letter: string]: Contact[] });
  }

  /**
   * Wird aufgerufen, wenn ein Kontakt angeklickt wird.
   * Setzt den aktuell ausgewählten Kontakt und emittiert das Event.
   * @param contact Der angeklickte Kontakt
   */
  onContactClick(contact: Contact): void {
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
  }

  /**
   * Liefert die gruppierten Kontakte als sortierte Einträge zurück.
   * @returns Array aus [Buchstabe, Kontaktliste] Paaren, alphabetisch sortiert
   */
  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts)
                .sort(([a], [b]) => a.localeCompare(b));
  }

  /** Der aktuell ausgewählte Kontakt, falls einer gewählt wurde */
  selectedContact: Contact | null = null;

}
