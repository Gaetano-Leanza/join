import { Component } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isClicked = false;   
  isMenuOpen = false;  

  constructor(private router: Router) {
   
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        
        if (
          event.url !== '/privacy-policy' &&
          event.url !== '/legal-notice'
        ) {
          this.isClicked = false;
        }
        
        this.isMenuOpen = false;
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true; 
  }

  isInfoPage(): boolean {
    return this.router.url === '/info';
  }
}