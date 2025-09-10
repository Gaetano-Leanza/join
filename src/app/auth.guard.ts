import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * @description A route guard that checks if a user is authenticated.
 * It prevents access to certain routes if the user is not logged in.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   * @constructor
   * @param {Router} router - The Angular Router for navigation.
   */
  constructor(private router: Router) {}

  /**
   * @description Determines if a route can be activated.
   * Checks for a username in sessionStorage. If it exists, access is granted.
   * Otherwise, the user is redirected to the login page.
   * @returns {boolean} True if the route can be activated, otherwise false.
   */
  canActivate(): boolean {
    const username = sessionStorage.getItem('username');
    if (username) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
