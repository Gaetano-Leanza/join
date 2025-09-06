import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], // ✅ korrigiert (Plural!)
})
export class LoginComponent {
  /**
   * The name of the user.
   */
  name = '';

  /**
   * The email address of the user.
   */
  email = '';

  /**
   * The password for the user's account.
   */
  password = '';

  constructor(private router: Router) {}

  /**
   * Handles the user login process.
   * It logs the user's details and navigates to the home page upon completion.
   */
  login(): void {
    console.log('Name:', this.name);
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Beispiel: Nach erfolgreichem Login zur Startseite leiten
    this.router.navigate(['/']);
  }

  /**
   * Navigates the user back to the previous page (login page).
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
