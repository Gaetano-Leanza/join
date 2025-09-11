import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  /** Observable für Zugriff auf geschützte Links */
  private _hasAccessToSummary = new BehaviorSubject<boolean>(false);
  hasAccessToSummary$ = this._hasAccessToSummary.asObservable();

  /** Zugriff setzen (nach Login oder GuestLogin) */
  setAccess(value: boolean) {
    this._hasAccessToSummary.next(value);
  }

  /** Logout: Zugriff auf geschützte Links entfernen */
  logout() {
    console.log('[UserStateService] logout aufgerufen');
    this._hasAccessToSummary.next(false); // Navbar bekommt sofort update
  }
}
