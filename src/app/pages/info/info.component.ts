import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * @description The Info component displays an informational page.
 *
 * It provides a "go back" function for navigating to the previous page.
 */
@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss', './info.responsive.scss'],
})
export class InfoComponent {
  /**
   * @description Creates an instance of the InfoComponent.
   * @param location The Angular Location service for navigation history.
   */
  constructor(private location: Location) {}
  /**
   * @description Navigates to the previous page in the browser history.
   */

  goBack(): void {
    this.location.back();
  }
}
