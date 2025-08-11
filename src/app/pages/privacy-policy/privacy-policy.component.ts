import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Komponente zur Anzeige der Datenschutzerklärung.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule,RouterLink ],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss', './privacy-policy.responsive.scss']
})
export class PrivacyPolicyComponent {

  constructor() {}
}
