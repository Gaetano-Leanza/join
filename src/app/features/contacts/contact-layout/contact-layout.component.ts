import { Component, HostListener, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ModalComponent } from '../modal/modal.component';
import { ContactService } from '../contact-service/contact.service';

@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ModalComponent],
  templateUrl: './contact-layout.component.html',
  styleUrls: [
    './contact-layout.component.scss',
    './contact-layout.responsive.scss',
  ],
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
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ContactLayoutComponent implements OnInit {
  selectedContact: Contact | null = null;
  isModalVisible = false;
  isSmallScreen = false;
  sidePanelActive = false;
  isMenuOpen = false;

  @ViewChild('burgerButton', { static: false }) burgerButton!: ElementRef;
  @ViewChild('burgerMenu', { static: false }) burgerMenu!: ElementRef;

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
    this.contactService.setSelectedContact(contact.id || null);
    if (this.isSmallScreen) {
      this.sidePanelActive = true;
    }
  }

  closeSidePanel() {
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
    this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideMenu = this.burgerMenu?.nativeElement.contains(
      event.target
    );
    const clickedBurgerButton = this.burgerButton?.nativeElement.contains(
      event.target
    );

    if (!clickedInsideMenu && !clickedBurgerButton) {
      this.isMenuOpen = false;
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
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
    if (!name) return colors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
  }

  async onDeleteContact(): Promise<void> {
    if (!this.selectedContact?.id) return;

    try {
      await this.contactService.deleteContact(this.selectedContact.id);
      this.selectedContact = null;
      this.sidePanelActive = false;
      this.contactService.setSelectedContact(null);
      this.isModalVisible = false;
    } catch (error) {
      console.error('Error deleting contact:', error);
      // Hier könnten Sie eine Fehlermeldung anzeigen
    }
  }
}