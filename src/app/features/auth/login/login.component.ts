import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { SplashScreenComponent } from '../../../splash-screen/splash-screen.component';
import { UserStateService } from '../../../services/userstate.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SplashScreenComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  /**
   * The user's email input value.
   */
  email = '';

  /**
   * The user's password input value.
   */
  password = '';

  /**
   * Holds error messages related to login attempts.
   */
  errorMessage = '';

  /**
   * Controls whether the splash screen is displayed.
   */
  showSplash = true;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private userState: UserStateService
  ) {}

  /**
   * Lifecycle hook that hides the splash screen after a delay.
   */
  ngOnInit(): void {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }

  /**
   * Attempts to log the user in with the provided email and password.
   * If successful, stores user data in session storage, updates user state,
   * and navigates to the summary page.
   * If unsuccessful, sets an appropriate error message.
   */
  async login(): Promise<void> {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      const userData = await this.firebaseService.validateUser(
        this.email,
        this.password
      );

      if (userData) {
        sessionStorage.setItem('username', userData.name);
        sessionStorage.setItem('userEmail', userData.email);
        sessionStorage.setItem('userId', userData.id);

        this.userState.setAccess(true);
        this.router.navigate(['/summary']);
      } else {
        this.errorMessage =
          'Invalid login credentials. Please check your email and password.';
      }
    } catch (error) {
      this.errorMessage = 'Login error. Please try again later.';
    }
  }

  /**
   * Navigates back to the home page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Logs the user in as a guest by setting a temporary username
   * and granting access, then navigates to the summary page.
   */
  guestLogin(): void {
    sessionStorage.setItem('username', 'Guest');
    this.userState.setAccess(true);
    this.router.navigate(['/summary']);
  }
}
