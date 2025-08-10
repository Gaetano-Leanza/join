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

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit {
  @Output() contactSelected = new EventEmitter<Contact>();
  private contactService = inject(ContactService);
  private destroyRef = inject(DestroyRef);

  contacts: Contact[] = [];
  groupedContacts: { [letter: string]: Contact[] } = {};
  loading = true;
  error: string | null = null;
  isActive = false;
  selectedContact: Contact | null = null;
  contactToEdit: Contact | null = null;
  modal2Visible = false;

  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    setTimeout(() => this.loadContacts());
  }

  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  loadContacts(): void {
    console.log('Lade Kontakte...');
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
          console.error('Fehler beim Laden:', error);
          this.error = 'Fehler beim Laden der Kontakte';
          this.loading = false;
        },
      });
  }

  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Kontaktliste benötigt Browser-Kontext';
    console.warn(this.error);
  }

  getAvatarColor(name: string): string {
    return name ? this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length] : this.avatarColors[0];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  private groupContacts(): void {
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = acc[letter] || [];
      acc[letter].push(contact);
      return acc;
    }, {} as { [letter: string]: Contact[] });
  }

  onContactClick(contact: Contact): void {
    this.contactService.setSelectedContact(contact.id);
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
    
    if (window.innerWidth <= 768) {
      this.toggleOverlay();
    }
  }

  closeDetailSlider(): void {
    this.contactService.setSelectedContact(null);
    this.selectedContact = null;
  }

  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) => a.localeCompare(b));
  }

  trackContact(index: number, contact: Contact): string {
    return contact.id;
  }

  openModal2(): void {
    this.modal2Visible = true;
  }

  closeModal2(): void {
    this.modal2Visible = false;
  }

  onContactSaved(): void {
    this.loadContacts();
  }
}