import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  currentUser$: Observable<any>;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Initialisierung NACH der Dependency Injection
    this.currentUser$ = authState(this.auth);
    
    // Sofortigen Auth-Status abrufen
    this.currentUser$.subscribe(user => {
      this.isLoggedInSubject.next(!!user);
    });
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }

  // Methode zum sofortigen Abrufen des Auth-Status
  getCurrentAuthState(): boolean {
    return this.isLoggedInSubject.value;
  }
}