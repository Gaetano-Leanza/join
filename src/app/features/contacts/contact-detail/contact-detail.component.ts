import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="contact$ | async as contact; else noContact">
      <h2>{{ contact.name }}</h2>
      <p><strong>Email:</strong> {{ contact.email }}</p>
      <p><strong>Telefon:</strong> {{ contact.phone }}</p>
    </ng-container>
    <ng-template #noContact>
      <p>Kontakt nicht gefunden.</p>
    </ng-template>
  `
})
export class ContactDetailComponent {
  contact$: Observable<Contact | undefined> | undefined;

  constructor(private route: ActivatedRoute, private contactService: ContactService) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contact$ = this.contactService.getContactById(id);
    }
  }
}
