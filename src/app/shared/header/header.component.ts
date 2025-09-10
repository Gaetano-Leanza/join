import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { getInitials } from '../../../app/features/add-task/avatar-utils';

/**
 * @description The main header component of the application.
 *
 * It provides the navigation header menu and manages states
 * like open/closed status and click interactions.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  /**
   * @description Whether a button or element in the header has been clicked.
   */
  isClicked = false;
  /**
   * @description Whether the header menu is currently open.
   */

  isMenuOpen = false;
  /**
   * @description The username to be displayed in the header.
   */
  username: string = 'G';

  /**
   * @description Lifecycle hook that runs when the component is initialized.
   * Fetches the username from session storage.
   */
  ngOnInit() {
    this.username = sessionStorage.getItem('username') || 'Guest';
  }
  /**
   * @description Creates an instance of the HeaderComponent.
   * @param router The Angular Router for monitoring navigation events.
   * The header automatically closes the menu on every page change,
   * except on specific pages like '/privacy-policy' or '/legal-notice'.
   */

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url !== '/privacy-policy' && event.url !== '/legal-notice') {
          this.isClicked = false;
        }
        this.isMenuOpen = false;
      });
  }
  /**
   * @description Toggles the menu status.
   * Opens it if closed, closes it if open.
   */

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  /**
   * @description Closes the menu and sets the clicked status.
   */

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }
  /**
   * @description Checks if the current page is the info page.
   * @returns true if the current URL is '/info', otherwise false.
   */

  isInfoPage(): boolean {
    return this.router.url === '/info';
  }

  /**
   * @description Gets the initials from the username stored in session storage.
   * @returns {string} The user's initials.
   */
  getInitials(): string {
    const username = sessionStorage.getItem('username') || '';
    return getInitials(username);
  }
}
