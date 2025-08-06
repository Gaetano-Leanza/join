import { Routes } from '@angular/router';
import { ContactLayoutComponent } from './features/contacts/contact-layout/contact-layout.component';
import { ContactDetailComponent } from './features/contacts/contact-detail/contact-detail.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { InfoComponent } from './pages/info/info.component';

export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  { path: 'contacts', component: ContactLayoutComponent },
  { path: 'contacts/:id', component: ContactDetailComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'legal-notice', component: LegalNoticeComponent },
  { path: 'info', component: InfoComponent },
];
