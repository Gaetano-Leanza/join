import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { slideInModal } from './modal2.animations';
import { fadeInOutInfo } from './modal2.animations';

import { ContactService } from '../contact-service/contact.service';

/**
 * @description Component for adding a new contact in a modal window.
 */
@Component({
  standalone: true,
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: [
    './modal2.component.scss',
    './modal2.responsive.scss',
    './modal2.responsive2.scss',
  ],
  animations: [slideInModal, fadeInOutInfo],
  imports: [CommonModule, FormsModule],
})
export class Modal2Component implements OnChanges {
  /**
   * @description Service for contact CRUD operations.
   */
  private contactService = inject(ContactService);
  /**
   * @description Controls the visibility of the modal.
   */

  @Input() visible = false;
  /**
   * @description Optional contact to be edited.
   */

  @Input() contactToEdit: {
    name: string;
    email: string;
    phone: string;
    id?: string;
  } | null = null;
  /**
   * @description Event emitted when the modal is closed.
   */

  @Output() closed = new EventEmitter<void>();
  /**
   * @description Event emitted when a contact is saved.
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
   * @description The color of the contact's avatar.
   */
  avatarColor: string | null = null;
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
   * @description Controls the visibility of the success message.
   */
  showSuccessInfo = false;
  /**
   * @description Lifecycle hook: Responds to changes in input properties.
   * @param changes The changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit']?.currentValue) {
      this.loadContactData(this.contactToEdit!);
    }

    if (changes['visible']?.currentValue === false) {
      this.resetForm();
    }
  }
  /**
   * @description Loads the contact data into the form fields.
   * @param contact The contact object.
   */

  private loadContactData(
    contact: NonNullable<typeof this.contactToEdit>
  ): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.avatarColor = contact.name ? this.getAvatarColor(contact.name) : null;
  }
  /**
   * @description Handler for clicking the backdrop, closes the modal.
   */

  handleBackdropClick(): void {
    this.closed.emit();
  }
  /**
   * @description Resets all form fields.
   */

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.avatarColor = null;
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
      const contactData = {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        updatedAt: new Date(),
        color: this.avatarColor || this.getAvatarColor(this.name),
        initials: this.getInitials(this.name),
      };

      if (this.contactToEdit?.id) {
        await this.contactService.updateContact(
          this.contactToEdit.id,
          contactData
        );
      } else {
        await this.contactService.addContact({
          ...contactData,
          createdAt: new Date(),
        });
      }

      this.showSuccessInfo = true;
      setTimeout(() => {
        this.resetForm();
        this.closed.emit();
        this.contactSaved.emit();
        this.showSuccessInfo = false;
      }, 2000);
    } catch (error) {
      console.error('Error saving contact:', error);
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
   * @description Validates the name with a regular expression.
   * @param name The contact's name.
   * @returns True if the name is valid.
   */

  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
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
    return this.avatarColors[
      Math.abs(firstCharCode) % this.avatarColors.length
    ];
  }
  /**
   * @description Updates the avatar color when the name changes.
   */

  onNameChange(): void {
    if (this.name.length === 1 && !this.avatarColor) {
      this.avatarColor =
        this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
    }

    if (!this.name.length) {
      this.avatarColor = null;
    }
  }
}
