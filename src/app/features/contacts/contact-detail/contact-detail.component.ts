import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

/**
 * @description Component for displaying the detailed information of a contact.
 *
 * This component reads the contact ID from the URL and loads the
 * corresponding contact using the ContactService.
 */
@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="contact$ | async as contact; else noContact">
      <h2>{{ contact.name }}</h2>
      <p><strong>Email:</strong> {{ contact.email }}</p>
      <p><strong>Phone:</strong> {{ contact.phone }}</p>
    </ng-container>
    <ng-template #noContact>
      <p>Contact not found.</p>
    </ng-template>
  `,
})
export class ContactDetailComponent {
  /**
   * @description Observable that provides the currently loaded contact.
   * Returns `undefined` if no contact is found.
   */
  contact$: Observable<Contact | undefined> | undefined;

  /**
   * @description Creates a new instance of the ContactDetailComponent.
   * @param route - For reading URL parameters (specifically the contact ID).
   * @param contactService - Service for contact management and retrieval.
   */
  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contact$ = this.contactService.getContactById(id);
    }
  }
}