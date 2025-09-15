import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

/**
 * @component SplashScreenComponent
 * @description
 * Displays an animated splash screen that transitions a logo
 * from a centered position to its final location in the layout.
 *
 * The splash screen fades out after the animation completes.
 */
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements AfterViewInit {
  /**
   * Controls visibility of the splash screen.
   * @default true
   */
  showSplash = true;

  /**
   * Reference to the splash logo element.
   * Used as the animation's starting point.
   */
  @ViewChild('splashLogo', { static: false }) splashLogo?: ElementRef<HTMLElement>;

  /**
   * Reference to the final logo element in the layout.
   * Used as the animation's target position and size.
   */
  @ViewChild('finalLogo', { static: false }) finalLogo?: ElementRef<HTMLElement>;

  /**
   * Lifecycle hook that runs after the view has been fully initialized.
   * Calculates position/size differences between the splash and final logos
   * and animates the transition using the Web Animations API.
   *
   * @returns {void}
   */
  ngAfterViewInit(): void {
    // Kurze Verzögerung um sicherzustellen, dass das DOM vollständig gerendert ist
    setTimeout(() => {
      this.initializeAnimation();
    }, 0);
  }

  /**
   * Initialisiert die Animation nachdem sichergestellt wurde, dass das DOM bereit ist
   */
  private initializeAnimation(): void {
    // Defensive Programmierung: Prüfen ob alle benötigten Elemente verfügbar sind
    const splash = this.splashLogo?.nativeElement;
    
    // Versuche das finale Logo über document.querySelector zu finden
    const target = document.querySelector('#logo-move') as HTMLElement;

    if (!splash) {
      this.hideSplashScreen();
      return;
    }

    if (!target) {
      this.showSimpleAnimation(splash);
      return;
    }

    // Beide Elemente sind verfügbar - normale Animation ausführen
    this.performFullAnimation(splash, target);
  }

  /**
   * Führt die vollständige Animation zwischen splash und target Element aus
   * @param splash - Das Splash Logo Element
   * @param target - Das Ziel Logo Element
   */
  private performFullAnimation(splash: HTMLElement, target: HTMLElement): void {
    // Get bounding rectangles for both elements
    const splashRect = splash.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Calculate translation distances and scaling ratio
    const dx = targetRect.left - splashRect.left;
    const dy = targetRect.top - splashRect.top;
    const scale = targetRect.width / splashRect.width;

    // Animate splash logo from center to target position/scale
    splash.animate(
      [
        { transform: 'translate(0, 0) scale(2)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 1 },
      ],
      {
        duration: 1200,
        easing: 'cubic-bezier(0.5, 0.2, 0.2, 1)', // Smooth easing curve
        fill: 'forwards', // Retain end state after animation
      }
    );

    // Hide splash screen after animation completes
    this.hideSplashScreen();
  }

  /**
   * Führt eine einfache Fade-Animation aus, falls das Ziel-Element nicht verfügbar ist
   * @param splash - Das Splash Logo Element
   */
  private showSimpleAnimation(splash: HTMLElement): void {
    // Einfache Fade-out Animation
    splash.animate(
      [
        { transform: 'scale(2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      {
        duration: 1200,
        easing: 'cubic-bezier(0.5, 0.2, 0.2, 1)',
        fill: 'forwards',
      }
    );

    this.hideSplashScreen();
  }

  /**
   * Versteckt den Splash Screen nach der Animation
   */
  private hideSplashScreen(): void {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }
}