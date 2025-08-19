import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';
import { ModalComponent } from '../modal/modal.component';
import { Modal2Component } from '../modal2/modal2.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  /**
   * Event, das ausgelöst wird, wenn ein Kontakt ausgewählt wird.
   */
  @Output() contactSelected = new EventEmitter<Contact>();
  
  /** Service zur Verwaltung von Kontakten. */
  private contactService = inject(ContactService);

  /** Reference für automatische Zerstörung von Subscriptions. */
  private destroyRef = inject(DestroyRef);

  /** Beobachter für responsive Layouts. */
  private breakpointObserver = inject(BreakpointObserver);

  /** Plattform-ID, um zwischen Server und Browser zu unterscheiden. */
  private platformId = inject(PLATFORM_ID);

  /** Subject zum Beenden von Observables bei Zerstörung. */
  private destroyed$ = new Subject<void>();

  /** Liste aller Kontakte. */
  contacts: Contact[] = [];

  /** Kontakte gruppiert nach Anfangsbuchstaben. */
  groupedContacts: { [letter: string]: Contact[] } = {};

  /** Ladezustand der Kontaktliste. */
  loading = true;

  /** Fehlernachricht beim Laden der Kontakte. */
  error: string | null = null;

  /** Status des Detail-Sliders (sichtbar oder nicht). */
  isActive = false;

  /** Aktuell ausgewählter Kontakt. */
  selectedContact: Contact | null = null;

  /** Kontakt, der bearbeitet werden soll. */
  contactToEdit: Contact | null = null;

  /** Sichtbarkeit des zweiten Modals. */
  modal2Visible = false;

  /** True, wenn auf mobilem Gerät. */
  isMobile = false;

  /** Farbpalette für Avatare. */
  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  /** Initialisierung des Components. */
  ngOnInit(): void {
    this.setupResponsiveBehavior();
    
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    this.loadContacts();
  }

  /** Aufräumarbeiten beim Zerstören des Components. */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /** Überwacht Breakpoints und setzt `isMobile`. */
  private setupResponsiveBehavior(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  /** Lädt Kontakte über den Service. */
  loadContacts(): void {
    this.contactService.getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Fehler beim Laden der Kontakte';
          this.loading = false;
          console.error('Error loading contacts:', error);
        },
      });
  }

  /** Behandlung, wenn Component im Server-Kontext läuft. */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Kontaktliste benötigt Browser-Kontext';
  }

  /**
   * Berechnet eine Avatar-Farbe basierend auf dem Namen.
   * @param name Name des Kontakts
   * @returns Hex-Farbcode
   */
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length];
  }

  /**
   * Extrahiert Initialen aus dem Namen.
   * @param name Name des Kontakts
   * @returns Initialen (z.B. "AB")
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /** Gruppiert Kontakte nach Anfangsbuchstaben. */
private groupContacts(): void {
  this.groupedContacts = this.contacts
    .filter(contact => contact.name && contact.name.trim().length > 0) // Nur Kontakte mit Namen (Fix für die "Noname" Kontakte)
    .reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = acc[letter] || [];
      acc[letter].push(contact);
      return acc;
    }, {} as { [letter: string]: Contact[] });
}

  /**
   * Reagiert auf Klick auf einen Kontakt.
   * @param contact Ausgewählter Kontakt
   */
  onContactClick(contact: Contact): void {
    this.contactService.setSelectedContact(contact.id!); 
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
    
    if (this.isMobile) {
      this.toggleOverlay();
    }
  }

  /** Schließt den Detail-Slider. */
  closeDetailSlider(): void {
    this.contactService.setSelectedContact(null);
    this.selectedContact = null;
  }

  /** Gibt die Einträge der gruppierten Kontakte sortiert zurück. */
  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts)
      .sort(([a], [b]) => a.localeCompare(b));
  }

  /**
   * TrackBy-Funktion für ngFor.
   * @param _ Index (nicht verwendet)
   * @param contact Kontakt
   * @returns ID des Kontakts
   */
  trackContact(_: number, contact: Contact): string {
    return contact.id!; 
  }

  /** Wechselt den Overlay-Status. */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /** Öffnet das zweite Modal. */
  openModal2(): void {
    this.modal2Visible = true;
  }

  /** Schließt das zweite Modal. */
  closeModal2(): void {
    this.modal2Visible = false;
  }

  /** Lädt die Kontakte neu, nachdem ein Kontakt gespeichert wurde. */
  onContactSaved(): void {
    this.loadContacts();
  }
}
