import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ContactService } from '../contact-service/contact.service';
import { Contact } from '../contact-model/contact.model';

/**
 * Komponente zur Anzeige der Detailinformationen eines Kontakts.
 *
 * Die Komponente liest die Kontakt-ID aus der URL aus und lädt
 * den zugehörigen Kontakt über den ContactService.
 */
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
  `,
})
export class ContactDetailComponent {
  /**
   * Observable, das den aktuell geladenen Kontakt liefert.
   * Gibt `undefined` zurück, falls kein Kontakt gefunden wurde.
   */
  contact$: Observable<Contact | undefined> | undefined;

  /**
   * Erstellt eine neue Instanz der ContactDetailComponent.
   *
   * @param route - Zum Auslesen der URL-Parameter (insbesondere der Kontakt-ID).
   * @param contactService - Service zur Kontaktverwaltung und -abfrage.
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
