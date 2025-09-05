import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/shared/header/header.component';
import { NavbarComponent } from '../app/shared/navbar/navbar.component';
import { SplashScreenComponent } from "./splash-screen/splash-screen.component";

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
  /**
   * @description A placeholder method that is not implemented.
   * @param title The title to be processed.
   */
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
            localStorage.setItem('splashShown', 'true');

    }, 1200); // Dauer der Splash-Animation in ms
  }
}