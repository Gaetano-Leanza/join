import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal.animations';
import { fadeInOutInfo } from './modal.animations';

import { Contact } from '../contact-model/contact.model';
import { ContactService } from '../contact-service/contact.service';

/**
 * @description Component for adding, editing, and deleting a contact in a modal window.
 */
@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: [
    './modal.component.scss',
    './modal.responsive.scss',
    './modal.responsive2.scss',
  ],
  animations: [slideInModal, fadeInOutInfo],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  /**
   * @description Service for contact CRUD operations.
   */
  private contactService = inject(ContactService);
  /**
   * @description The contact to be edited.
   */

  @Input() contactToEdit: Contact | null = null;
  /**
   * @description Controls the visibility of the modal.
   */

  @Input() visible = false;
  /**
   * @description Event emitted when the modal is closed.
   */

  @Output() closed = new EventEmitter<void>();
  /**
   * @description Event emitted when a contact is saved or deleted.
   */

  @Output() contactSaved = new EventEmitter<void>();
  /**
   * @description The name input field.
   */

  name = '';
  /**
   * @description The email input field.
   */
  email = '';
  /**
   * @description The phone input field.
   */
  phone = '';
  /**
   * @description Indicates if the component is in editing mode.
   */

  isEditing = false;
  /**
   * @description The ID of the current contact.
   */

  currentContactId: string | null = null;
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
   * @description Controls the visibility of a success/info modal.
   */

  showSuccessInfo = false;
  /**
   * @description The success or error message to display.
   */
  successMessage = '';
  /**
   * @description Validates the name with a regular expression.
   * @param name The contact's name.
   * @returns True if the name is valid.
   */

  isValidName(name: string): boolean {
    return /^[A-Za-zäöüÄÖÜß\s\-']+$/.test(name.trim());
  }
  /**
   * @description Lifecycle hook: Initializes the component.
   */

  ngOnInit(): void {
    this.loadSelectedContact();
  }
  /**
   * @description Lifecycle hook: Responds to changes in input properties.
   * @param changes The changed properties.
   */

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit']?.currentValue) {
      this.loadContactData(this.contactToEdit!);
      this.isEditing = true;
    } else if (
      changes['visible']?.currentValue &&
      !changes['visible'].previousValue
    ) {
      this.loadSelectedContact();
    }
  }
  /**
   * @description Loads the currently selected contact from the service.
   */

  private loadSelectedContact(): void {
    const contactId = this.contactService.getSelectedContactId();
    if (contactId) {
      this.contactService.getContactById(contactId).subscribe({
        next: (contact) => contact && this.loadContactData(contact),
        error: (error) => console.error('Error loading contact:', error),
      });
    }
  }
  /**
   * @description Loads the contact data into the form fields.
   * @param contact The contact object.
   */

  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id as string;
    this.isEditing = !!contact.id;
  }
  /**
   * @description Updates the corresponding field on input changes.
   * @param field The field name ('name', 'email', or 'phone').
   * @param value The value of the field.
   */

  onInputChange(
    field: keyof Pick<Contact, 'name' | 'email' | 'phone'>,
    value: string
  ) {
    this[field] = value;
  }
  /**
   * @description Handler for clicking the backdrop, closes the modal.
   */

  handleBackdropClick() {
    this.closed.emit();
  }
  /**
   * @description Resets all form fields.
   */

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }
  /**
   * @description Saves the contact (new or edited).
   * @param form The NgForm of the input form.
   */

  async saveContact(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.markFormAsTouched(form);
      return;
    }

    try {
      const contactData = this.prepareContactData();

      if (this.isEditing && this.currentContactId) {
        await this.contactService.updateContact(
          this.currentContactId,
          contactData
        );
        this.successMessage = 'Contact successfully edited';
        this.showSuccessInfo = true;
        setTimeout(() => {
          this.showSuccessInfo = false;
          this.resetForm();
          this.closed.emit();
          this.contactSaved.emit();
        }, 2000);
        return;
      } else {
        await this.contactService.addContact(contactData);
        this.successMessage = 'Contact successfully added';
        this.showSuccessInfo = true;
        setTimeout(() => {
          this.showSuccessInfo = false;
          this.resetForm();
          this.closed.emit();
          this.contactSaved.emit();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }
  /**
   * @description Deletes the current contact and closes the modal.
   */

  async deleteContactAndClose(): Promise<void> {
    if (!this.currentContactId) return;

    try {
      this.showSuccessInfo = true;
      this.successMessage = 'Contact successfully deleted'; // Close modal after a timeout so the message remains visible.

      setTimeout(async () => {
        await this.contactService.deleteContact(this.currentContactId!);
        this.resetForm();
        this.closed.emit();
        this.contactSaved.emit();
        this.showSuccessInfo = false;
      }, 2000);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
  /**
   * @description Marks all form fields as 'touched'.
   * @param form The NgForm instance.
   */

  private markFormAsTouched(form: NgForm): void {
    Object.values(form.controls).forEach((control) => control.markAsTouched());
  }
  /**
   * @description Prepares the contact data for the service.
   * @returns The contact data object.
   */

  private prepareContactData(): Omit<Contact, 'id'> {
    const trimmedName = this.name.trim();
    return {
      name: trimmedName,
      email: this.email.trim(),
      phone: this.phone.trim(),
      color: this.getAvatarColor(trimmedName),
      initials: this.getInitials(trimmedName),
      updatedAt: new Date(),
      ...(!this.isEditing && { createdAt: new Date() }),
    };
  }
  /**
   * @description Calculates the initials of the name for the avatar.
   * @param name The contact's name.
   * @returns 1-2 letter initials.
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
   * @description Calculates the avatar color based on the first letter of the name.
   * @param name The contact's name.
   * @returns A hex color code.
   */

  getAvatarColor(name: string): string {
    if (!name?.trim()) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}
