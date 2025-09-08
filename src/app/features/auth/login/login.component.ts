import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  name = '';
  password = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  /**
   * Handles the user login process.
   * Validates credentials and navigates to summary on success.
   */
  async login(): Promise<void> {
    // Reset error message
    this.errorMessage = '';

    // Validate inputs
    if (!this.name.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      // Validate user credentials
      const isValid = await this.firebaseService.validateUser(
        this.name,
        this.password
      );

      if (isValid) {
        // Successful login - navigate to summary
        console.log('Login successful');
        this.router.navigate(['/summary']);
      } else {
        this.errorMessage =
          'Invalid login credentials. Please check your name and password.';
      }
    } catch (error) {
      this.errorMessage = 'Login error. Please try again later.';
      console.error('Login error:', error);
    }
  }

  /**
   * Navigates the user back to the previous page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
