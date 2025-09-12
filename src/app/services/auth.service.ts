import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Subject that holds the login state of the user.
   */
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable emitting the current login state.
   * Components can subscribe to react to login or logout events.
   */
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  /**
   * Observable emitting the current Firebase user or null if logged out.
   */
  currentUser$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    /**
     * The current Firebase authentication state stream.
     */
    this.currentUser$ = authState(this.auth);

    // Update login state based on authentication changes
    this.currentUser$.subscribe(user => {
      this.isLoggedInSubject.next(!!user);
    });
  }

  /**
   * Logs the user out and navigates to the login page.
   */
  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }

  /**
   * Returns the current login state synchronously.
   *
   * @returns `true` if the user is logged in, otherwise `false`.
   */
  getCurrentAuthState(): boolean {
    return this.isLoggedInSubject.value;
  }
}
