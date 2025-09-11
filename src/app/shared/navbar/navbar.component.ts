import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * @description The navigation bar component for the application.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule,CommonModule],
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


   constructor(private router: Router) {}
  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }

 
}
