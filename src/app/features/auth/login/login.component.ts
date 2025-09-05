import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


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
   * Creates an instance of the SignupComponent.
   * @param {Router} router - The Angular Router service for navigation.
   */
  constructor(private router: Router) {}

  /**
   * Handles the user signup process.
   * It logs the user's details and navigates to the login page upon completion.
   * @returns {void}
   */
  login() {
    // Your registration logic goes here
    console.log('Name:', this.name);
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    // Navigate to the login page after successful signup
    this.router.navigate(['/']);
  }

  /**
   * Navigates the user back to the previous page (login page).
   * @returns {void}
   */
  goBack() {
    this.router.navigate(['/']);
  }
}



