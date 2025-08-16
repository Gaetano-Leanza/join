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
import { ContactService } from '../contact-service/contact.service';

@Component({
  standalone: true,
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: [
    './modal2.component.scss',
    './modal2.responsive.scss',
    './modal2.responsive2.scss'
  ],
  animations: [slideInModal],
  imports: [CommonModule, FormsModule],
})
export class Modal2Component implements OnChanges {
  private contactService = inject(ContactService);

  @Input() visible = false;
  @Input() contactToEdit: {
    name: string;
    email: string;
    phone: string;
    id?: string;
  } | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() contactSaved = new EventEmitter<void>();

  name = '';
  email = '';
  phone = '';
  avatarColor: string | null = null;

  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactToEdit']?.currentValue) {
      this.loadContactData(this.contactToEdit!);
    }

    if (changes['visible']?.currentValue === false) {
      this.resetForm();
    }
  }

  private loadContactData(contact: NonNullable<typeof this.contactToEdit>): void {
    this.name = contact.name || '';
    this.email = contact.email || '';
    this.phone = contact.phone || '';
    this.avatarColor = contact.name ? this.getAvatarColor(contact.name) : null;
  }

  handleBackdropClick(): void {
    this.closed.emit();
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.avatarColor = null;
  }

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
        updatedAt: new Date()
      };

      if (this.contactToEdit?.id) {
        await this.contactService.updateContact(this.contactToEdit.id, contactData);
      } else {
        await this.contactService.addContact({
          ...contactData,
          createdAt: new Date()
        });
      }

      this.resetForm();
      this.closed.emit();
      this.contactSaved.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  }

  private markFormAsTouched(form: NgForm): void {
    Object.values(form.controls).forEach(control => control.markAsTouched());
  }

  isValidName(name: string): boolean {
    return /^[A-Za-z\s\-]+$/.test(name.trim());
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getAvatarColor(name: string): string {
    if (!name?.trim()) return this.avatarColors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return this.avatarColors[Math.abs(firstCharCode) % this.avatarColors.length];
  }

  onNameChange(): void {
    if (this.name.length === 1 && !this.avatarColor) {
      this.avatarColor = this.avatarColors[
        Math.floor(Math.random() * this.avatarColors.length)
      ];
    }

    if (!this.name.length) {
      this.avatarColor = null;
    }
  }
}