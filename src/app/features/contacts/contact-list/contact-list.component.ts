import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
  PLATFORM_ID,
  Inject,
  OnDestroy,
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

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, Modal2Component],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  @Output() contactSelected = new EventEmitter<Contact>();
  
  private contactService = inject(ContactService);
  private destroyRef = inject(DestroyRef);
  private breakpointObserver = inject(BreakpointObserver);
  private platformId = inject(PLATFORM_ID);
  private destroyed$ = new Subject<void>();

  contacts: Contact[] = [];
  groupedContacts: { [letter: string]: Contact[] } = {};
  loading = true;
  error: string | null = null;
  isActive = false;
  selectedContact: Contact | null = null;
  contactToEdit: Contact | null = null;
  modal2Visible = false;
  isMobile = false;

  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];

  ngOnInit(): void {
    this.setupResponsiveBehavior();
    
    if (!isPlatformBrowser(this.platformId)) {
      this.handleServerContext();
      return;
    }
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private setupResponsiveBehavior(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  loadContacts(): void {
    this.contactService.getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.groupContacts();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Fehler beim Laden der Kontakte';
          this.loading = false;
          console.error('Error loading contacts:', error);
        },
      });
  }

  private handleServerContext(): void {
    this.loading = false;
    this.error = 'Kontaktliste benötigt Browser-Kontext';
  }

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[name.trim().charCodeAt(0) % this.avatarColors.length];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
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
  this.contactService.setSelectedContact(contact.id!); 
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
    
    if (this.isMobile) {
      this.toggleOverlay();
    }
  }

  closeDetailSlider(): void {
    this.contactService.setSelectedContact(null);
    this.selectedContact = null;
  }

  get groupedContactsEntries(): [string, Contact[]][] {
    return Object.entries(this.groupedContacts)
      .sort(([a], [b]) => a.localeCompare(b));
  }

  trackContact(_: number, contact: Contact): string {
  return contact.id!; 
  }

  toggleOverlay(): void {
    this.isActive = !this.isActive;
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