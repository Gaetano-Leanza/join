import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss', './signup.responsive.scss'],
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  privacyPolicyAccepted = false;
  isSignedUp = false;
  passwordMismatch = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false; // Neue Variable für Ladezustand

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async signup() {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;
    this.isLoading = true; // Ladezustand aktivieren

    try {
      // Benutzer in Firebase erstellen
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
      console.error('Fehler beim Erstellen des Benutzers:', error);
      // Hier könnten Sie eine Fehlermeldung anzeigen
    } finally {
      this.isLoading = false; // Ladezustand deaktivieren
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}