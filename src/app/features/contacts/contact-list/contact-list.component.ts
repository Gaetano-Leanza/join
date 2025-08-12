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
import { delay } from 'rxjs/operators';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';
import { ModalComponent } from '../modal/modal.component';
import { Modal2Component } from '../modal2/modal2.component';

/**
 * Component for displaying and managing a list of contacts
 * Provides functionality for contact selection, grouping, and modal interactions
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  /** Event emitted when a contact is selected */
  @Output() contactSelected = new EventEmitter<Contact>();
  
  /** Injected contact service for data operations */
  private contactService = inject(ContactService);
  
  /** Injected destroy reference for subscription cleanup */
  private destroyRef = inject(DestroyRef);

  /** Array of all contacts */
  contacts: Contact[] = [];
  
  /** Contacts grouped by first letter of name */
  groupedContacts: { [letter: string]: Contact[] } = {};
  
  /** Loading state indicator */
  loading = true;
  
  /** Error message if loading fails */
  error: string | null = null;
  
  /** Active state for overlay toggle */
  isActive = false;
  
  /** Currently selected contact */
  selectedContact: Contact | null = null;
  
  /** Contact being edited */
  contactToEdit: Contact | null = null;
  
  /** Visibility state of modal2 */
  modal2Visible = false;

  /** Array of predefined avatar colors */
  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  /**
   * Constructor
   * @param {Object} platformId - Platform identifier for browser detection
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Component initialization
   * Handles platform detection and initiates contact loading
   */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    setTimeout(() => this.loadContacts());
  }

  /**
   * Toggles the overlay active state
   */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /**
   * Loads contacts from the service
   * Updates component state based on loading success or failure
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
          this.error = 'Fehler beim Laden der Kontakte';
          this.loading = false;
        },
      });
  }

  /**
   * Handles server-side rendering context
   * Sets appropriate error state when browser context is not available
   */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Kontaktliste benötigt Browser-Kontext';
  }

  /**
   * Gets avatar color for a contact based on name
   * @param {string} name - Contact name
   * @returns {string} Hex color code
   */
  getAvatarColor(name: string): string {
    return name ? this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length] : this.avatarColors[0];
  }

  /**
   * Generates initials from contact name
   * @param {string} name - Contact full name
   * @returns {string} Uppercase initials (max 2 characters)
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Groups contacts alphabetically by first letter of name
   * Updates the groupedContacts object
   */
  private groupContacts(): void {
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = acc[letter] || [];
      acc[letter].push(contact);
      return acc;
    }, {} as { [letter: string]: Contact[] });
  }

  /**
   * Handles contact selection click event
   * Emits contactSelected event and manages overlay for mobile
   * @param {Contact} contact - Selected contact object
   */
  onContactClick(contact: Contact): void {
    this.contactService.setSelectedContact(contact.id);
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
    
    if (window.innerWidth <= 768) {
      this.toggleOverlay();
    }
  }

  /**
   * Closes the contact detail slider
   * Resets selected contact state
   */
  closeDetailSlider(): void {
    this.contactService.setSelectedContact(null);
    this.selectedContact = null;
  }

  /**
   * Gets grouped contacts as sorted array entries
   * @returns {[string, Contact[]][]} Array of letter-contacts pairs sorted alphabetically
   */
  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) => a.localeCompare(b));
  }

  /**
   * Track function for Angular's trackBy directive
   * @param {number} index - Item index
   * @param {Contact} contact - Contact object
   * @returns {string} Unique contact identifier
   */
  trackContact(index: number, contact: Contact): string {
    return contact.id;
  }

  /**
   * Opens modal2 dialog
   */
  openModal2(): void {
    this.modal2Visible = true;
  }

  /**
   * Closes modal2 dialog
   */
  closeModal2(): void {
    this.modal2Visible = false;
  }

  /**
   * Handles contact saved event
   * Reloads contacts to reflect changes
   */
  onContactSaved(): void {
    this.loadContacts();
  }
}