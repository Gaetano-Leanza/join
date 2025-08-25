import { Component,HostListener,ElementRef} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

/**
 * Header-Komponente der Anwendung.
 * 
 * Stellt das Navigations-Header-Menü bereit und verwaltet
 * Zustände wie geöffnet/geschlossen und Klick-Interaktionen.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
isMenuOpen: any;
isClicked: any;

  /** Ob ein Button oder Element im Header angeklickt wurde */
   

  
  

   closeMenu(): void {
    this.isMenuOpen = false;
    this.isClicked = true; 
  }
toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
 @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
  /**
   * Konstruktor der Header-Komponente.
   * 
   * @param router Angular Router zur Überwachung von Navigationsereignissen.
   * Der Header schließt das Menü automatisch bei jedem Seitenwechsel,
   * außer auf speziellen Seiten wie '/privacy-policy' oder '/legal-notice'.
   */
  constructor(private router: Router,public eRef: ElementRef) {
 

    // Abonniert Router-Events und filtert NavigationEnd Events
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        
        // Menüstatus zurücksetzen, außer auf speziellen Seiten
        if (
          event.url !== '/privacy-policy' &&
          event.url !== '/legal-notice'
        ) {
          this.isClicked = false;
        }

        // Menü immer schließen bei Seitenwechsel
        this.isMenuOpen = false;
      });
  }


 

  /**
   * Prüft, ob die aktuelle Seite die Info-Seite ist.
   * 
   * @returns true, wenn die aktuelle URL '/info' ist, sonst false
   */
  isInfoPage(): boolean {
    return this.router.url === '/info';
  }
}
