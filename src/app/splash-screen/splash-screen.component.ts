import { Component } from '@angular/core';

/**
 * @description A component that displays a splash screen, typically shown during application startup.
 */
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent {
  /**
   * @description A boolean flag to control the visibility of the splash screen.
   */
  showSplash = true;

  /**
   * @description Creates an instance of the SplashScreenComponent.
   */
  constructor() {}
}
