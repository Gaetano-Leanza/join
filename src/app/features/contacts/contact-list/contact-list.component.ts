import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  private avatarColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
  ];

  ngOnInit(): void {
    // ✅ isBrowser ist jetzt öffentlich zugänglich
    if (this.contactService.isBrowser) {
      this.loadContacts();
    } else {
      this.loading = false;
      this.error = 'Kontakte können im Server-Kontext nicht geladen werden.';
    }
  }

  private loadContacts(): void {
    this.contactService.getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
          this.error = null;
        },
        error: (error) => {
          console.error('Error loading contacts:', error);
          this.error = 'Fehler beim Laden der Kontakte';
          this.loading = false;
        }
      });
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    const initials = parts.map((part) => part.charAt(0).toUpperCase());
    return initials.slice(0, 2).join('');
  }

  private groupContacts(): void {
    this.groupedContacts = {};
    for (const contact of this.contacts) {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!this.groupedContacts[letter]) {
        this.groupedContacts[letter] = [];
      }
      this.groupedContacts[letter].push(contact);
    }
  }

  onContactClick(contact: Contact): void {
    console.log('Contact clicked:', contact);
    this.contactSelected.emit(contact);
  }

  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts).sort(([a], [b]) => a.localeCompare(b));
  }
}
