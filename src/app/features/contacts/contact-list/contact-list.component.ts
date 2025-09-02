import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  OnDestroy,
  Input,
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

/**
 * @description Component for displaying a list of contacts, handling contact selection, and managing modals.
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  /**
   * @description Event emitted when a contact is selected.
   */
  @Output() contactSelected = new EventEmitter<Contact>();

  /**
   * @description Service for managing contacts.
   */
  private contactService = inject(ContactService);

  /**
   * @description Reference for automatically destroying subscriptions.
   */
  private destroyRef = inject(DestroyRef);

  /**
   * @description Observer for responsive layouts.
   */
  private breakpointObserver = inject(BreakpointObserver);

  /**
   * @description Platform ID to distinguish between server and browser context.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Subject to complete observables on component destruction.
   */
  private destroyed$ = new Subject<void>();

  /**
   * @description List of all contacts.
   */
  contacts: Contact[] = [];

  /**
   * @description Contacts grouped by the first letter of their name.
   */
  groupedContacts: { [letter: string]: Contact[] } = {};

  /**
   * @description Loading state of the contact list.
   */
  loading = true;

  /**
   * @description Error message for contact loading.
   */
  error: string | null = null;

  /**
   * @description Status of the detail slider (visible or not).
   */
  isActive = false;

  /**
   * @description The currently selected contact.
   */
  selectedContact: Contact | null = null;

  /**
   * @description The contact to be edited.
   */
  contactToEdit: Contact | null = null;

  /**
   * @description Visibility of the second modal.
   */
  modal2Visible = false;

  /**
   * @description Indicates if the device is mobile.
   */
  isMobile = false;

  /**
   * @description Determines if the add button should be shown.
   */
  @Input() showAddButton: boolean = true;

  /**
   * @description Determines if the mobile add button should be shown.
   */
  @Input() showAddButtonMobile = true;

  /**
   * @description Color palette for avatars.
   */
  private readonly avatarColors = [
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
   * @description Lifecycle hook for component initialization.
   */
  ngOnInit(): void {
    this.setupResponsiveBehavior();

    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    this.loadContacts();
  }

  /**
   * @description Lifecycle hook for component destruction.
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * @description Sets up responsive behavior by observing breakpoints.
   */
  private setupResponsiveBehavior(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  /**
   * @description Loads contacts using the contact service.
   */
  loadContacts(): void {
    this.contactService
      .getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading contacts';
          this.loading = false;
          console.error('Error loading contacts:', error);
        },
      });
  }

  /**
   * @description Handles component behavior when running in a server context.
   */
  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Contact list requires a browser context';
  }

  /**
   * @description Calculates an avatar color based on the contact name.
   * @param name The contact's name.
   * @returns A hex color code.
   */
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[
      name.trim().charCodeAt(0) % this.avatarColors.length
    ];
  }

  /**
   * @description Extracts initials from a name.
   * @param name The contact's name.
   * @returns The initials (e.g., "AB").
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * @description Groups contacts by the first letter of their name.
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
   * @description Handles a contact click event.
   * @param contact The selected contact.
   */
  onContactClick(contact: Contact): void {
    this.contactService.setSelectedContact(contact.id!);
    this.selectedContact = contact;
    this.contactSelected.emit(contact);

    if (this.isMobile) {
      this.toggleOverlay();
    }
  }

  /**
   * @description Closes the detail slider.
   */
  closeDetailSlider(): void {
    this.contactService.setSelectedContact(null);
    this.selectedContact = null;
  }

  /**
   * @description Gets sorted entries of the grouped contacts.
   * @returns An array of [letter, contacts] pairs, sorted alphabetically by letter.
   */
  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }

  /**
   * @description TrackBy function for ngFor.
   * @param _ The index (not used).
   * @param contact The contact.
   * @returns The contact's ID.
   */
  trackContact(_: number, contact: Contact): string {
    return contact.id!;
  }

  /**
   * @description Toggles the overlay status.
   */
  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  /**
   * @description Opens the second modal.
   */
  openModal2(): void {
    this.modal2Visible = true;
  }

  /**
   * @description Closes the second modal.
   */
  closeModal2(): void {
    this.modal2Visible = false;
  }

  /**
   * @description Reloads contacts after a contact has been saved.
   */
  onContactSaved(): void {
    this.loadContacts();
  }
}