import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

/**
 * @Component
 * @description
 * Component for the user registration (signup) page.
 * Allows new users to create an account.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss', './signup.responsive.scss'],
})
export class SignupComponent {
  /** @type {string} The user's full name. */
  name = '';
  /** @type {string} The user's email address. */
  email = '';
  /** @type {string} The user's chosen password. */
  password = '';
  /** @type {string} The confirmation of the user's password. */
  confirmPassword = '';
  /** @type {boolean} Indicates whether the user has accepted the privacy policy. */
  privacyPolicyAccepted = false;
  /** @type {boolean} A flag to indicate if the signup was successful. */
  isSignedUp = false;
  /** @type {boolean} A flag to indicate if the password and confirmation password do not match. */
  passwordMismatch = false;
  /** @type {boolean} Toggles the visibility of the password input field. */
  showPassword = false;
  /** @type {boolean} Toggles the visibility of the confirm password input field. */
  showConfirmPassword = false;
  /** @type {boolean} A flag to indicate if a loading process (e.g., API call) is active. */
  isLoading = false;

  /**
   * @constructor
   * @param {Router} router - The Angular Router service for navigation.
   * @param {FirebaseService} firebaseService - The service for communicating with Firebase.
   */
  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  /**
   * Toggles the visibility of the password or confirm password field.
   * @param {'password' | 'confirmPassword'} field - The input field to toggle.
   * @returns {void}
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Handles the user signup process.
   * It validates the password, creates a new user in Firebase,
   * and navigates to the home page upon successful registration.
   * @async
   * @returns {Promise<void>}
   */
  async signup() {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;
    this.isLoading = true;

    try {
      await this.firebaseService.addDocument('users', {
        name: this.name,
        email: this.email,
        password: this.password,
      });

      this.isSignedUp = true;
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } catch (error) {
      console.error('Error creating user:', error);
      // You could display an error message to the user here.
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navigates the user back to the home page.
   * @returns {void}
   */
  goBack() {
    this.router.navigate(['/']);
  }
}