import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Component for the user sign-up page.
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
  /**
   * The name of the user.
   * @type {string}
   */
  name = '';

  /**
   * The email address of the user.
   * @type {string}
   */
  email = '';

  /**
   * The password for the user's account.
   * @type {string}
   */
  password = '';

  /**
   * The confirmation of the password for validation.
   * @type {string}
   */
  confirmPassword = '';

  /**
   * Tracks the state of the privacy policy checkbox.
   * @type {boolean}
   */
  privacyPolicyAccepted = false;

  /**
   * Flag to control the visibility of the success message.
   * @type {boolean}
   */
  isSignedUp = false;

  /**
   * Flag to show a password mismatch error.
   * @type {boolean}
   */
  passwordMismatch = false;

  /**
   * Flag to control the visibility of the password field.
   * @type {boolean}
   */
  showPassword = false;

  /**
   * Flag to control the visibility of the confirm password field.
   * @type {boolean}
   */
  showConfirmPassword = false;

  /**
   * Creates an instance of the SignupComponent.
   * @param {Router} router - The Angular Router service for navigation.
   */
  constructor(private router: Router) {}

  /**
   * Toggles the visibility of the specified password field.
   * @param {'password' | 'confirmPassword'} field - The password field to toggle.
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
   * It validates the password confirmation, shows an error or success message,
   * and navigates to the login page upon completion.
   * @returns {void}
   */
  signup() {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;
    this.isSignedUp = true;

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  /**
   * Navigates the user back to the previous page (login page).
   * @returns {void}
   */
  goBack() {
    this.router.navigate(['/']);
  }
}

