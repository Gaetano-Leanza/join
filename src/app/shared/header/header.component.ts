import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Header-Komponente mit Navigationselementen.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  /**
   * @param router Angular Router zur Navigation und URL-Prüfung.
   */
  constructor(private router: Router) {}

  /**
   * Prüft, ob die aktuelle Route die Info-Seite ist.
   * @returns true, wenn URL '/info' ist, sonst false.
   */
  isInfoPage(): boolean {
    return this.router.url === '/info';
  }

  isMenuOpen = false;
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    console.log("funktioniert");
  }
  closeMenu(): void {
    this.isMenuOpen = false;
  }

 

}
