import { Routes } from '@angular/router';
import { ContactLayoutComponent } from './features/contacts/contact-layout/contact-layout.component';
import { ContactDetailComponent } from './features/contacts/contact-detail/contact-detail.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { InfoComponent } from './pages/info/info.component';
import { AddTaskComponent } from './features/add-task/add-task.component';
import { BoardComponent } from './features/board/board.component';

/**
 * Defines the main application routes.
 *
 * Each route is associated with a component and can include data for prerendering.
 */
export const routes: Routes = [
  // Redirects the base URL to the contacts page
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  // Route for the Add Task component
  { 
    path: 'task', 
    component: AddTaskComponent, 
    data: { prerender: true } 
  },
  // Route for the Board component
  { 
    path: 'board', 
    component: BoardComponent, 
    data: { prerender: true } 
  },
  // Route for the contacts layout
  {
    path: 'contacts',
    component: ContactLayoutComponent,
    data: { prerender: true },
  },
  // Route for the Contact Detail component
  {
    path: 'contact-detail',
    component: ContactDetailComponent,
    data: { prerender: true }
  },
  // Route for the Privacy Policy page
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: { prerender: true },
  },
  // Route for the Legal Notice page
  {
    path: 'legal-notice',
    component: LegalNoticeComponent,
    data: { prerender: true },
  },
  // Route for the Info page
  { 
    path: 'info', 
    component: InfoComponent, 
    data: { prerender: true } 
  },
];
