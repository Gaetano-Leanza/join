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
  @ViewChild('splashLogo') splashLogo!: ElementRef<HTMLElement>;

  /**
   * Reference to the final logo element in the layout.
   * Used as the animation's target position and size.
   */
  @ViewChild('finalLogo') finalLogo!: ElementRef<HTMLElement>;

  /**
   * Lifecycle hook that runs after the view has been fully initialized.
   * Calculates position/size differences between the splash and final logos
   * and animates the transition using the Web Animations API.
   *
   * @returns {void}
   */
  ngAfterViewInit(): void {
    const splash = this.splashLogo.nativeElement;
    const target = this.finalLogo.nativeElement;

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
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }
}
