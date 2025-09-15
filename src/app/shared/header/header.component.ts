import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getInitials } from '../../../app/features/add-task/avatar-utils';
import { UserStateService } from '../../services/userstate.service';
import { Subscription } from 'rxjs';

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
  isMenuOpen = false;
  username: string = 'G';
  isLoggedIn: boolean = false; // Login-Status
  private userStateSub!: Subscription; // Subscription für Auth-Status

  constructor(private router: Router, public userState: UserStateService) {}

  ngOnInit() {
    this.username = sessionStorage.getItem('username') || 'Guest';

    // Beobachte Login-Status
    this.userStateSub = this.userState.hasAccessToSummary$.subscribe(
      (status) => {
        this.isLoggedIn = status;
      }
    );
  }

  ngOnDestroy() {
    if (this.userStateSub) {
      this.userStateSub.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  isInfoPage(): boolean {
    return this.router.url === '/info';
  }

  getInitials(): string {
    const username = sessionStorage.getItem('username') || '';
    return getInitials(username);
  }

  logout(): void {
    this.userState.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
