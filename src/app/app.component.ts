import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/shared/header/header.component';
import { NavbarComponent } from '../app/shared/navbar/navbar.component';
import { SplashScreenComponent } from "./splash-screen/splash-screen.component";
import { filter } from 'rxjs/operators';

/**
 * @description The root component of the application.
 * It loads the Header, Navbar, and the RouterModule.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    NavbarComponent,
    SplashScreenComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  showSplash = true;
  showLayout = true; // ✅ Neu: Steuert Anzeige von Navbar & Header

  constructor(private router: Router) {
    // Reagiere auf Routenwechsel
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // ✅ Layout ausblenden auf Login & Sign-up
        this.showLayout = !['/', '/sign-up'].includes(event.url);
      });
  }

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
      localStorage.setItem('splashShown', 'true');
    }, 1200); // Dauer der Splash-Animation in ms
  }

  /**
   * @description A placeholder method that is not implemented.
   * @param title The title to be processed.
   */
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}
