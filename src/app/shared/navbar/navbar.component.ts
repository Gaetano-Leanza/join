import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { UserStateService } from '../../services/userstate.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isClicked = true;

  hasAccessToSummary = false;
  currentRoute = '';

  private userStateSub!: Subscription;
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    console.log('[Navbar] ngOnInit gestartet');

    // Subscription auf UserState
    this.userStateSub = this.userStateService.hasAccessToSummary$.subscribe(
      (access) => {
        console.log('[Navbar] UserState update (hasAccessToSummary$):', access);
        this.hasAccessToSummary = access;
      }
    );

    this.currentRoute = this.router.url;
    console.log('[Navbar] initial currentRoute:', this.currentRoute);

    // Router-Events
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        console.log('[Navbar] route changed:', this.currentRoute);
      });
  }

  ngOnDestroy() {
    if (this.userStateSub) this.userStateSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  /** Prüft, ob aktuelle Seite Policy ist */
  get isOnPolicyPage(): boolean {
    return (
      this.currentRoute.includes('/privacy-policy') ||
      this.currentRoute.includes('/legal-notice')
    );
  }

  /** App-Navigation anzeigen? */
  get showAppLinks(): boolean {
    return this.hasAccessToSummary; // Policy-Seiten werden hier nicht ausgeschlossen
  }

  /** Login-Link anzeigen? */
  get showLoginLink(): boolean {
    return !this.hasAccessToSummary && !this.isOnPolicyPage;
  }

  navigateToLogin() {
    this.router.navigate(['/login']).then((success) => {
      if (!success) {
        console.error('Navigation to login failed');
        this.router.navigate(['/']);
      }
    });
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }
}
