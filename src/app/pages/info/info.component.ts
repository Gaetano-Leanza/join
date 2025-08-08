import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Info-Komponente zeigt eine Informationsseite an.
 * 
 * Bietet eine Zurück-Funktion zur Navigation zur vorherigen Seite.
 */
@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss', './info.responsive.scss']
})
export class InfoComponent {

  /**
   * @param location Angular Location Service zur Navigation im Verlauf.
   */
  constructor(private location: Location) {}

  /**
   * Navigiert zur vorherigen Seite im Browser-Verlauf.
   */
  goBack(): void {
    this.location.back();
  }
}
