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
  /**
   * Controls the state of the mobile menu (open/closed).
   */
  isMenuOpen = false;

  /**
   * Tracks whether a menu item was clicked.
   */
  isClicked = true;

  /**
   * Whether the user currently has access to the summary section.
   */
  hasAccessToSummary = false;

  /**
   * Stores the current active route.
   */
  currentRoute = '';

  /**
   * Subscription for user state changes.
   */
  private userStateSub!: Subscription;

  /**
   * Subscription for router navigation events.
   */
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private userStateService: UserStateService
  ) {}

  /**
   * Initializes subscriptions for user state and route changes.
   */
  ngOnInit(): void {
    this.userStateSub = this.userStateService.hasAccessToSummary$.subscribe(
      (access) => {
        this.hasAccessToSummary = access;
      }
    );

    this.currentRoute = this.router.url;

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  /**
   * Cleans up active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.userStateSub) this.userStateSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  /**
   * Determines if the user is currently on a policy-related page.
   */
  get isOnPolicyPage(): boolean {
    return (
      this.currentRoute.includes('/privacy-policy') ||
      this.currentRoute.includes('/legal-notice')
    );
  }

  /**
   * Whether app-related links should be shown in the navbar.
   */
  get showAppLinks(): boolean {
    return this.hasAccessToSummary;
  }

  /**
   * Whether the login link should be shown in the navbar.
   */
  get showLoginLink(): boolean {
    return !this.hasAccessToSummary && !this.isOnPolicyPage;
  }

  /**
   * Navigates the user to the login page.
   * If navigation fails, the user is redirected to the home page.
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']).then((success) => {
      if (!success) {
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Closes the mobile menu and resets click state.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true;
  }
}
