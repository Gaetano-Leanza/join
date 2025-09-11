import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  /** Observable für Zugriff auf Summary/geschützte Links */
  private _hasAccessToSummary = new BehaviorSubject<boolean>(false);
  hasAccessToSummary$ = this._hasAccessToSummary.asObservable();

  /** Zugriff setzen (nach Login oder GuestLogin) */
  setAccess(value: boolean) {
    this._hasAccessToSummary.next(value);
  }
}
