import { Component, inject, OnInit } from '@angular/core'; 
import { trigger, style, transition, animate } from '@angular/animations';
import { Contact } from './contact-model/contact.model';
import { ContactService } from './contact-service/contact.service';
import { Observable, catchError, of, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * Komponente zur Anzeige und Verwaltung einer Kontaktliste.
 * 
 * Unterstützt Animationen, Auswahl eines Kontakts und Bearbeitung via Modal.
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule], // CommonModule für *ngIf, *ngFor etc.
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);

  // Zustandsmanagement mit klareren Typen
  contacts$!: Observable<Contact[]>;
  selectedContact: Contact | null = null;
  modalOpen = false;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadContacts();
  }

  /**
   * Lädt Kontakte mit Fehlerbehandlung und Ladeindikator
   */
  private loadContacts(): void {
    this.loading = true;
    this.error = null;
    
    this.contacts$ = this.contactService.getContacts().pipe(
      startWith([]), // Vermeidet undefined beim ersten Laden
      catchError((err) => {
        console.error('Fehler beim Laden der Kontakte:', err);
        this.error = 'Kontakte konnten nicht geladen werden';
        return of([]);
      })
    );
  }

  /**
   * Öffnet das Modal zum Bearbeiten eines Kontakts
   */
  editContact(contact: Contact): void {
    this.selectedContact = { ...contact }; // Clone für Immutability
    this.modalOpen = true;
  }

  /**
   * Wählt einen Kontakt aus
   */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;
  }

  /**
   * Schließt das Modal und behandelt das Ergebnis
   */
  closeModal(success: boolean): void {
    this.modalOpen = false;
    if (success) {
      this.loadContacts(); // Daten neu laden bei Änderungen
    }
    this.selectedContact = null;
  }
}