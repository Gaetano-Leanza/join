import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements AfterViewInit {
  showSplash = true;

  @ViewChild('splashLogo') splashLogo!: ElementRef<HTMLElement>;
  @ViewChild('finalLogo') finalLogo!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    const splash = this.splashLogo.nativeElement;
    const target = this.finalLogo.nativeElement;

    const splashRect = splash.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const dx = targetRect.left - splashRect.left;
    const dy = targetRect.top - splashRect.top;
    const scale = targetRect.width / splashRect.width;

    splash.animate(
      [
        { transform: 'translate(0, 0) scale(2)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 1 },
      ],
      {
        duration: 1200,
        easing: 'cubic-bezier(0.5, 0.2, 0.2, 1)',
        fill: 'forwards',
      }
    );

    // Nach der Animation Splash ausblenden
    setTimeout(() => {
      this.showSplash = false;
    }, 1200);
  }
}
