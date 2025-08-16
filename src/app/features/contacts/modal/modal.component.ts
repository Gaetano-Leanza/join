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
import { Contact } from '../contact-model/contact.model';
import { ContactService } from '../contact-service/contact.service';

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: [
    './modal.component.scss',
    './modal.responsive.scss',
    './modal.responsive2.scss',
  ],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnChanges, OnInit {
  private contactService = inject(ContactService);

  @Input() contactToEdit: Contact | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() contactSaved = new EventEmitter<void>();

  name = '';
  email = '';
  phone = '';
  isEditing = false;
  currentContactId: string | null = null;

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

isValidName(name: string): boolean {
  return /^[A-Za-zäöüÄÖÜß\s\-']+$/.test(name.trim());
}

  ngOnInit(): void {
    this.loadSelectedContact();
  }

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

  private loadSelectedContact(): void {
    const contactId = this.contactService.getSelectedContactId();
    if (contactId) {
      this.contactService.getContactById(contactId).subscribe({
        next: (contact) => contact && this.loadContactData(contact),
        error: (error) => console.error('Error loading contact:', error),
      });
    }
  }

  private loadContactData(contact: Contact): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.currentContactId = contact.id as string;
    this.isEditing = !!contact.id;
  }

  onInputChange(
    field: keyof Pick<Contact, 'name' | 'email' | 'phone'>,
    value: string
  ) {
    this[field] = value;
  }

  handleBackdropClick() {
    this.resetForm();
    this.closed.emit();
  }

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.isEditing = false;
    this.currentContactId = null;
  }

  async deleteContactAndClose(): Promise<void> {
    if (!this.currentContactId) return;

    try {
      await this.contactService.deleteContact(this.currentContactId);
      this.resetForm();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

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
      } else {
        await this.contactService.addContact(contactData);
      }

      this.resetForm();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  private markFormAsTouched(form: NgForm): void {
    Object.values(form.controls).forEach((control) => control.markAsTouched());
  }

  private prepareContactData(): Omit<Contact, 'id'> {
    return {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      updatedAt: new Date(),
      ...(!this.isEditing && { createdAt: new Date() }),
    };
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getAvatarColor(name: string): string {
    if (!name?.trim()) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[firstCharCode % this.avatarColors.length];
  }
}
