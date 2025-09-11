import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  currentUser$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    console.log('[AuthService] constructor initialized');

    // Firebase liefert hier den aktuellen User-Stream
    this.currentUser$ = authState(this.auth);

    // Reagiere auf Login/Logout
    this.currentUser$.subscribe(user => {
      console.log('[AuthService] user state changed:', user);
      this.isLoggedInSubject.next(!!user);
    });
  }

  async logout() {
    console.log('[AuthService] logout called');
    await this.auth.signOut();
    console.log('[AuthService] user signed out');
    this.router.navigate(['/login']);
  }

  getCurrentAuthState(): boolean {
    console.log('[AuthService] getCurrentAuthState:', this.isLoggedInSubject.value);
    return this.isLoggedInSubject.value;
  }
}
