import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';

/**
 * @description The navigation bar component for the application.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  /**
   * @description Indicates if the navigation menu is currently open.
   */
  isMenuOpen = false;
  /**
   * @description Indicates if a menu item has been clicked.
   */
  isClicked = true;
  /**
   * @description Closes the navigation menu.
   */

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }
}
