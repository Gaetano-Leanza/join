import { Component, inject, OnInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Contact } from './contact-model/contact.model';
import { ContactService } from './contact-service/contact.service';
import { Observable, catchError, of, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * @description Component for displaying and managing a contact list.
 *
 * It supports animations, contact selection, and editing via a modal.
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
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
  /**
   * @description The contact service for data operations.
   */
  private contactService = inject(ContactService);
  /**
   * @description Observable for managing contact state.
   */

  contacts$!: Observable<Contact[]>;
  /**
   * @description The currently selected contact.
   */
  selectedContact: Contact | null = null;
  /**
   * @description Controls the visibility of the modal.
   */
  modalOpen = false;
  /**
   * @description Indicates if the contacts are currently loading.
   */
  loading = true;
  /**
   * @description Stores any error message that occurs during loading.
   */
  error: string | null = null;

  ngOnInit(): void {
    this.loadContacts();
  }
  /**
   * @description Loads contacts with error handling and a loading indicator.
   */

  private loadContacts(): void {
    this.loading = true;
    this.error = null;

    this.contacts$ = this.contactService.getContacts().pipe(
      startWith([]),
      catchError((err) => {
        console.error('Error loading contacts:', err);
        this.error = 'Could not load contacts';
        return of([]);
      })
    );
  }
  /**
   * @description Opens the modal to edit a specific contact.
   * @param contact The contact to be edited.
   */

  editContact(contact: Contact): void {
    this.selectedContact = { ...contact };
    this.modalOpen = true;
  }
  /**
   * @description Selects a contact from the list.
   * @param contact The contact to select.
   */

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
  }
  /**
   * @description Closes the modal and handles the result.
   * @param success A boolean indicating if the operation was successful.
   */

  closeModal(success: boolean): void {
    this.modalOpen = false;
    if (success) {
      this.loadContacts();
    }
    this.selectedContact = null;
  }
}
