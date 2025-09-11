import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { SplashScreenComponent } from '../../../splash-screen/splash-screen.component';
import { UserStateService } from '../../../services/userstate.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SplashScreenComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  showSplash = true;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private userState: UserStateService // <-- hinzugefügt
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }

  async login(): Promise<void> {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    try {
      const userData = await this.firebaseService.validateUser(
        this.email,
        this.password
      );

      if (userData) {
        // SessionStorage setzen
        sessionStorage.setItem('username', userData.name);
        sessionStorage.setItem('userEmail', userData.email);
        sessionStorage.setItem('userId', userData.id);

        // UserStateService benachrichtigen
        this.userState.setAccess(true);

        // Navigation
        this.router.navigate(['/summary']);
      } else {
        this.errorMessage =
          'Invalid login credentials. Please check your email and password.';
      }
    } catch (error) {
      this.errorMessage = 'Login error. Please try again later.';
      console.error('Login error:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  guestLogin() {
    // GuestLogin in SessionStorage
    sessionStorage.setItem('username', 'Guest');

    // UserStateService benachrichtigen
    this.userState.setAccess(true);

    // Navigation
    this.router.navigate(['/summary']);
  }
}
