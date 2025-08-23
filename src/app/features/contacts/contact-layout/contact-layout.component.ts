import { Component, HostListener, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  showSuccessInfo = false;
  /** Der aktuell ausgewählte Kontakt. */
  selectedContact: Contact | null = null;

  /** Sichtbarkeit des Modals. */
  isModalVisible = false;

  /** True, wenn das Display als klein (z.B. mobile) gilt. */
  isSmallScreen = false;

  /** True, wenn das Side Panel aktiv ist. */
  sidePanelActive = false;

  /** True, wenn das Burger-Menü geöffnet ist. */
  isMenuOpen = false;

  /** Referenz auf den Burger-Button im Template. */
  @ViewChild('burgerButton', { static: false }) burgerButton!: ElementRef;

  /** Referenz auf das Burger-Menü im Template. */
  @ViewChild('burgerMenu', { static: false }) burgerMenu!: ElementRef;

  /**
   * @param contactService Service zur Verwaltung von Kontakten
   * @param platformId Plattformkennung (Browser oder Server).
   * Wird benötigt, da SSR kein `window`-Objekt kennt.
   */
  constructor(
    private contactService: ContactService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Lifecycle-Hook: Initialisierung des Components.
   * Prüft beim Start die Bildschirmgröße nur,
   * wenn die App tatsächlich im Browser läuft.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  /**
   * HostListener: Reagiert auf Fenster-Resize Events.
   * Funktioniert nur im Browser, nicht bei SSR.
   */
  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  /**
   * Prüft die aktuelle Bildschirmgröße und passt
   * die Side-Panel-Logik entsprechend an.
   * Wird abgesichert, damit kein Fehler in SSR auftritt.
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
   * Setzt einen Kontakt als ausgewählt.
   * @param contact Kontakt, der ausgewählt werden soll
   */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.contactService.setSelectedContact(contact.id || null);
    if (this.isSmallScreen) {
      this.sidePanelActive = true;
    }
  }

  /** Schließt das Side Panel und entfernt die Auswahl. */
  closeSidePanel() {
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
    this.isMenuOpen = false;
  }

  /** Wechselt den Status des Burger-Menüs. */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /** Schließt das Burger-Menü. */
  closeMenu() {
    this.isMenuOpen = false;
  }

  /**
   * HostListener: Schließt das Burger-Menü,
   * wenn außerhalb geklickt wurde.
   * @param event MouseEvent des Klicks
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
   * Berechnet die Initialen eines Namens.
   * @param name Name des Kontakts
   * @returns Initialen in Großbuchstaben
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Berechnet eine Avatar-Farbe basierend auf dem Namen.
   * @param name Name des Kontakts
   * @returns Hex-Farbcode
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

  /** Öffnet das Modal. */
  openModal() {
    this.isModalVisible = true;
  }

  /** Schließt das Modal und entfernt die Auswahl. */
  closeModal() {
    this.isModalVisible = false;
    this.selectedContact = null;
    this.contactService.setSelectedContact(null);
    this.sidePanelActive = false;
  }

  /**
   * Löscht den aktuell ausgewählten Kontakt.
   * @returns Promise<void> nach erfolgreichem oder fehlgeschlagenem Löschvorgang
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
      // Optional: Anzeige einer Fehlermeldung
    }
  }
}
