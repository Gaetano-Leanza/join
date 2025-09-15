import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements AfterViewInit {
  /** Controls whether the splash screen is visible */
  showSplash = true;

  /** Reference to the splash logo element in the template */
  @ViewChild('splashLogo', { static: false })
  splashLogo?: ElementRef<HTMLElement>;

  /** Reference to the final logo element in the template (for animation target) */
  @ViewChild('finalLogo', { static: false })
  finalLogo?: ElementRef<HTMLElement>;

  /**
   * Angular lifecycle hook called after the view has been initialized
   * Starts the splash screen animation
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeAnimation();
    }, 0);
  }

  /**
   * Initializes the splash screen animation
   * Determines whether to perform a full animation or a simple fallback animation
   * @private
   */
  private initializeAnimation(): void {
    const splash = this.splashLogo?.nativeElement;

    const target = document.querySelector('#logo-move') as HTMLElement;

    if (!splash) {
      this.hideSplashScreen();
      return;
    }

    if (!target) {
      this.showSimpleAnimation(splash);
      return;
    }

    this.performFullAnimation(splash, target);
  }

  /**
   * Performs the full animation of the splash logo moving and scaling to the target logo
   * @param splash The splash logo HTMLElement to animate
   * @param target The target HTMLElement where the splash logo should move
   * @private
   */
  private performFullAnimation(splash: HTMLElement, target: HTMLElement): void {
    const splashRect = splash.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const dx = targetRect.left - splashRect.left;
    const dy = targetRect.top - splashRect.top;
    const scale = targetRect.width / splashRect.width;

    splash.animate(
      [
        { transform: 'translate(0, 0) scale(2)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: 1,
        },
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
   * Shows a simple scale animation for the splash logo when no target is present
   * @param splash The splash logo HTMLElement to animate
   * @private
   */
  private showSimpleAnimation(splash: HTMLElement): void {
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
   * Hides the splash screen after the animation completes
   * Sets `showSplash` to false after a timeout
   * @private
   */
  private hideSplashScreen(): void {
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }
}
