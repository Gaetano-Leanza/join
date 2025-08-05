import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Contact } from '../contact-model/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  getContactById(id: number): Contact | undefined {
    throw new Error('Method not implemented.');
  }
  constructor(private firestore: Firestore) {}

  getContacts(): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    const contactsQuery = query(contactsRef, orderBy('name'));
    return collectionData(contactsQuery, { idField: 'id' }) as Observable<
      Contact[]
    >;
  }
}
