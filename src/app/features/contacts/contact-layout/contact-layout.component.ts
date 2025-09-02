import { Component, HostListener, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Contact } from '../contact-model/contact.model';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { ModalComponent } from '../modal/modal.component';
import { ContactService } from '../contact-service/contact.service';
import { fadeInOutInfo } from '../modal/modal.animations';



/**
 * @description Main layout component for the contacts view.
 * It manages the display of the contact list, contact details, and various modals and panels,
 * adapting to different screen sizes.
 */
@Component({
  selector: 'app-contact-layout',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ModalComponent],
  templateUrl: './contact-layout.component.html',
  styleUrls: [
    './contact-layout.component.scss',
    './contact-layout.responsive.scss',
  ],
  animations: [fadeInOutInfo, trigger('slideIn', [
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
  /**
   * @description Controls the visibility of a success/info modal.
   */
  showSuccessInfo = false;
  /**
   * @description The currently selected contact.
   */
  selectedContact: Contact | null = null;

  /**
   * @description Controls the visibility of the main modal.
   */
  isModalVisible = false;

  /**
   * @description Indicates if the current screen is small (e.g., mobile).
   */
  isSmallScreen = false;

  /**
   * @description Controls the visibility of the side panel.
   */
  sidePanelActive = false;

  /**
   * @description Controls the open/closed state of the burger menu.
   */
  isMenuOpen = false;

  /**
   * @description Reference to the burger button element in the template.
   */
  @ViewChild('burgerButton', { static: false }) burgerButton!: ElementRef;

  /**
   * @description Reference to the burger menu element in the template.
   */
  @ViewChild('burgerMenu', { static: false }) burgerMenu!: ElementRef;

  /**
   * @description Creates an instance of ContactLayoutComponent.
   * @param contactService The service for managing contacts.
   * @param platformId The platform identifier, used to check if the app is running in a browser.
   */
  constructor(
    private contactService: ContactService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * @description Lifecycle hook that is called after Angular has initialized all data-bound properties.
   * Checks the screen size on component initialization.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  /**
   * @description Host listener for the window resize event.
   * Dynamically checks the screen size on window resize.
   */
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  /**
   * @description Checks the current screen width and updates the `isSmallScreen` property.
   * If not on a small screen, the side panel is deactivated.
   */
  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen = window.innerWidth <= 950;
      if (!this.isSmallScreen) {
        this.sidePanelActive = false;
      }
    }
  }

  /**
   * @description Selects a contact and updates the UI accordingly.
   * @param contact The contact to be selected.
   */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.contactService.setSelectedContact(contact.id || null);
    if (this.isSmallScreen) {
      this.sidePanelActive = true;
    }
  }

  /**
   * @description Closes the side panel and deselects the contact.
   */
  closeSidePanel() {
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
    this.isMenuOpen = false;
  }

  /**
   * @description Toggles the visibility of the burger menu.
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * @description Closes the burger menu.
   */
  closeMenu() {
    this.isMenuOpen = false;
  }

  /**
   * @description Host listener for document clicks.
   * Closes the burger menu if the click target is outside the menu and the burger button.
   * @param event The mouse click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideMenu = this.burgerMenu?.nativeElement.contains(event.target);
    const clickedBurgerButton = this.burgerButton?.nativeElement.contains(event.target);

    if (!clickedInsideMenu && !clickedBurgerButton) {
      this.isMenuOpen = false;
    }
  }

  /**
   * @description Calculates the initials from a contact's name.
   * @param name The name of the contact.
   * @returns The capitalized initials.
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * @description Calculates an avatar color based on the contact's name.
   * @param name The name of the contact.
   * @returns A hex color code.
   */
  getAvatarColor(name: string): string {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
      '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548',
    ];
    if (!name) return colors[0];
    const firstCharCode = name.trim().charCodeAt(0);
    return colors[firstCharCode % colors.length];
  }

  /**
   * @description Opens the modal.
   */
  openModal() {
    this.isModalVisible = true;
  }

  /**
   * @description Closes the modal and deselects the contact.
   */
  closeModal() {
    this.isModalVisible = false;
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
  }

  /**
   * @description Deletes the currently selected contact.
   * @returns A Promise that resolves when the deletion is complete.
   */
  async onDeleteContact(): Promise<void> {
    if (!this.selectedContact?.id) return;

    try {
      setTimeout(() => this.showSuccessInfo = false, 2000);
      await this.contactService.deleteContact(this.selectedContact.id);
      this.selectedContact = null;
      this.sidePanelActive = false;
      this.contactService.setSelectedContact(null);
      this.isModalVisible = false;
      this.showSuccessInfo = true;
      setTimeout(() => this.showSuccessInfo = false, 2000);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
}