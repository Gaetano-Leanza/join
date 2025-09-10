import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * @description Component for displaying the legal notice or imprint.
 */
@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-notice.component.html',
  styleUrls: [
    './legal-notice.component.scss',
    './legal-notice.responsive.scss',
  ],
})
export class LegalNoticeComponent {
  constructor() {}
}
