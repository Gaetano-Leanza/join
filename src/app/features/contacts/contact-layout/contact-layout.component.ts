import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ModalComponent } from '../modal/modal.component';
import { ContactService } from '../contact-service/contact.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ModalComponent, RouterLink],
  templateUrl: './contact-layout.component.html',
  styleUrls: [
    './contact-layout.component.scss',
    './contact-layout.responsive.scss',
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ContactLayoutComponent {
  selectedContact: Contact | null = null;
  isModalVisible = false;
  isSmallScreen = false;
  sidePanelActive = false;
  isMenuOpen = false;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 950;
    if (!this.isSmallScreen) {
      this.sidePanelActive = false;
    }
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    if (this.isSmallScreen) {
      this.sidePanelActive = true;
    }
  }

  closeSidePanel() {
    this.sidePanelActive = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
      '#03A9F4', '#009688', '#4CAF50', '#FFC107',
      '#FF9800', '#795548',
    ];
    if (!name) return colors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  openModal() {
    this.isModalVisible = true;
  }

  /**
   * 🔹 Beim Schließen des Modals immer auch den Side-Panel schließen
   */
  closeModal() {
    this.isModalVisible = false;
    this.selectedContact = null;   // Kontakt zurücksetzen
    this.sidePanelActive = false;  // Side-Panel schließen
  }

  async onDeleteContact(): Promise<void> {
    if (!this.selectedContact?.id) return;

    const confirmed = confirm(
      `Möchtest du den Kontakt "${this.selectedContact.name}" wirklich löschen?`
    );
    if (!confirmed) return;

    const success = await this.contactService.deleteContact(this.selectedContact.id);

    if (success) {
      alert('Kontakt erfolgreich gelöscht.');
      this.selectedContact = null;
      this.sidePanelActive = false;
      this.contactService.setSelectedContact(null);
      this.isModalVisible = false;
    } else {
      alert('Fehler beim Löschen des Kontakts.');
    }
  }
}
