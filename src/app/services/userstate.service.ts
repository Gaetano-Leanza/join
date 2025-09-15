import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  /**
   * BehaviorSubject that holds the current access state for the summary.
   * Initialized with `false` (no access).
   */
 private _hasAccessToSummary = new BehaviorSubject<boolean>(
    typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'
  );
  /**
   * Observable that emits the current access state for the summary.
   * Components can subscribe to this to react to access changes.
   */
  hasAccessToSummary$ = this._hasAccessToSummary.asObservable();

  /**
   * Updates the user's access state for the summary.
   *
   * @param value - `true` if the user should have access, otherwise `false`.
   */
 setAccess(value: boolean): void {
    this._hasAccessToSummary.next(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
    }
  }

  /**
   * Logs the user out by resetting their access state to `false`.
   */
  logout(): void {
    this._hasAccessToSummary.next(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'false');
    }
  }
}
