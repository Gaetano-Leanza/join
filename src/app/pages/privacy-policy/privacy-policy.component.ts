import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * @description Component for displaying the privacy policy.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrls: [
    './privacy-policy.component.scss',
    './privacy-policy.responsive.scss',
  ],
})
export class PrivacyPolicyComponent {
  constructor() {}
}
