import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { SplashScreenComponent } from '../../../splash-screen/splash-screen.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SplashScreenComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  /** The email address entered by the user. */
  email = '';
  /** The password entered by the user. */
  password = '';
  /** A message to display in case of a login error. */
  errorMessage = '';
  /** Controls the visibility of the splash screen. */
  showSplash = true;

  /**
   * @constructor
   * @param {Router} router - The Angular Router for navigation.
   * @param {FirebaseService} firebaseService - The service for handling Firebase operations.
   */
  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  /**
   * A lifecycle hook that runs after the component has been initialized.
   * It hides the splash screen after a short delay.
   */
  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }

  /**
   * Handles the user login process.
   * It validates the user's credentials and navigates to the summary page on success.
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
        this.router.navigate(['/summary']);
      } else {
        this.errorMessage =
          'Invalid login credentials. Please check your email and password.';
      }
    } catch (error) {
      this.errorMessage = 'Login error. Please try again later.';
      console.error('Login error:', error);
    }
  }

  /**
   * Navigates the user to the root page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Logs in a guest user and navigates to the summary page.
   */
  guestLogin() {
    sessionStorage.setItem('username', 'Guest');
    this.router.navigate(['/summary']);
  }
}
