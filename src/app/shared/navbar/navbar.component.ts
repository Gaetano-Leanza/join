import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * @description The navigation bar component for the application.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  /**
   * @description Indicates if the navigation menu is currently open.
   */
  isMenuOpen = false;
  /**
   * @description Indicates if a menu item has been clicked.
   */
  isClicked = true;
  
  /**
   * @description Tracks if user is logged in
   */
  isLoggedIn = false;
  
  /**
   * @description Current route path
   */
  currentRoute = '';
  
  /**
   * @description Subscription to auth state changes
   */
  private authSub!: Subscription;
  
  /**
   * @description Subscription to router events
   */
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Sofortigen Auth-Status abrufen
    this.isLoggedIn = this.authService.getCurrentAuthState();
    
    // Auth-Status-Änderungen überwachen
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    // Aktuelle Route sofort setzen
    this.currentRoute = this.router.url;
    
    // Router-Änderungen überwachen
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  /**
   * @description Determines if navigation links should be shown
   */
  get showNavigationLinks(): boolean {
    const isPolicyPage = 
      this.currentRoute.includes('/privacy-policy') || 
      this.currentRoute.includes('/legal-notice');
    
    return this.isLoggedIn || !isPolicyPage;
  }

  /**
   * @description Navigates to login page
   */
  navigateToLogin() {
    this.router.navigate(['/login']).then(success => {
      if (!success) {
        console.error('Navigation to login failed');
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * @description Closes the navigation menu.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }
}