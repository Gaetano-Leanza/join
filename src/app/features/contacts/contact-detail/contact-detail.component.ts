import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="contact">
      <h2>{{ contact.name }}</h2>
      <p><strong>Email:</strong> {{ contact.email }}</p>
      <p><strong>Telefon:</strong> {{ contact.phone }}</p>
    </ng-container>
    <p *ngIf="!contact">Kontakt nicht gefunden.</p>
  `
})
export class ContactDetailComponent {
  contact: Contact | undefined;

  constructor(private route: ActivatedRoute, private contactService: ContactService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.contact = this.contactService.getContactById(id);
  }
}
