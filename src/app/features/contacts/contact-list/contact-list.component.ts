import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';
import { delay } from 'rxjs/operators';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
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

  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }

    setTimeout(() => {
      this.loadContacts();
    });
  }


  toggleOverlay(): void {
    this.isActive = !this.isActive;
  }

  private loadContacts(): void {
    this.contactService.getContacts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        delay(0) // Kleiner Delay für stabileren Hydrationsprozess
      )
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.error = 'Failed to load contacts';
          this.loading = false;
        }
      });
  }

  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Contact loading requires browser context';
    console.warn(this.error);
  }

  getAvatarColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getInitials(name: string): string {
    return name.split(' ')
              .map(part => part.charAt(0).toUpperCase())
              .slice(0, 2)
              .join('');
  }

  private groupContacts(): void {
    this.groupedContacts = this.contacts.reduce((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      acc[letter] = [...(acc[letter] || []), contact];
      return acc;
    }, {} as { [letter: string]: Contact[] });
  }

  onContactClick(contact: Contact): void {
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
  }

  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts)
                .sort(([a], [b]) => a.localeCompare(b));
  }

  selectedContact: Contact | null = null;


}