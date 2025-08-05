import { Routes } from '@angular/router';
import { ContactLayoutComponent } from './features/contacts/contact-layout/contact-layout.component';
import { ContactDetailComponent } from './features/contacts/contact-detail/contact-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  { path: 'contacts', component: ContactLayoutComponent },
  { path: 'contacts/:id', component: ContactDetailComponent },
];
