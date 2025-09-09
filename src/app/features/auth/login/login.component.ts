import { Component } from '@angular/core';
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
export class LoginComponent {
  email = '';  // Geändert von 'name' zu 'email' für bessere Klarheit
  password = '';
  errorMessage = '';
  showSplash = true;
  
  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200); // Dauer der Splash-Animation in ms
  }

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
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      // Validate user credentials - validateUser gibt jetzt das User-Objekt zurück
      const userData = await this.firebaseService.validateUser(
        this.email,
        this.password
      );

      if (userData) {
        // Successful login - speichere sowohl Name als auch Email
        sessionStorage.setItem('username', userData.name); // Name für Anzeige
        sessionStorage.setItem('userEmail', userData.email); // Email für weitere Referenz
        sessionStorage.setItem('userId', userData.id); // User ID für weitere Operationen
        
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
   * Navigates the user back to the previous page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  guestLogin() {
    sessionStorage.setItem('username', 'Guest');
    this.router.navigate(['/summary']);
  }
}