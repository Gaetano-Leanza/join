import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';

/**
 * Navigationsleiste-Komponente für die Anwendung.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']  // Korrektur: styleUrl → styleUrls
})
export class NavbarComponent {

 isMenuOpen = false; 
isClicked=true;
  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true; 
  }
 

}
