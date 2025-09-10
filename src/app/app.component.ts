import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/shared/header/header.component';
import { NavbarComponent } from '../app/shared/navbar/navbar.component';
import { filter } from 'rxjs/operators';

/**
 * @description The root component of the application.
 * It loads the Header, Navbar, and the RouterModule, and manages the visibility
 * of the main layout and splash screen.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    NavbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  /**
   * @description Controls the visibility of the splash screen.
   */
  showSplash = true;
  /**
   * @description Controls the visibility of the main layout (Navbar & Header).
   */
  showLayout = true;

  /**
   * @constructor
   * @param {Router} router - The Angular Router to subscribe to navigation events.
   */
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Hide the main layout on login and sign-up pages.
        this.showLayout = !['/', '/sign-up'].includes(event.url);
      });
  }

  /**
   * @description Lifecycle hook that runs after the component has been initialized.
   * Hides the splash screen after a delay.
   */
  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
      localStorage.setItem('splashShown', 'true');
    }, 1200);
  }

  /**
   * @description A placeholder method that is not implemented.
   * @param {any} title - The title to be processed.
   * @throws {Error} Throws an error because the method is not implemented.
   */
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}
