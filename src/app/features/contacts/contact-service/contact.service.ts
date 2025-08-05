import { Injectable } from '@angular/core';
import { Contact } from '../contact-model/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private contacts: Contact[] = [
    { id: 1, name: 'Anna Müller', email: 'anna@example.com', phone: '123456' },
    {
      id: 2,
      name: 'Bernd Schneider',
      email: 'bernd@example.com',
      phone: '789101',
    },
    {
      id: 3,
      name: 'Gaetano Leanza',
      email: 'gaetano1981@live.de',
      phone: '567816',
    },
    { id: 4, name: 'Mark Meier', email: 'mark@example.com', phone: '134556' },
    {
      id: 5,
      name: 'Hans Schmidt',
      email: 'hand@example.com',
      phone: '689501',
    },
    {
      id: 6,
      name: 'Martha Meier',
      email: 'martha@example.com',
      phone: '871615',
    },
  ];

  getContacts(): Contact[] {
    return this.contacts;
  }

  getContactById(id: number): Contact | undefined {
    return this.contacts.find((c) => c.id === id);
  }
}
