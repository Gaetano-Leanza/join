import { Routes } from '@angular/router';
import { ContactLayoutComponent } from './features/contacts/contact-layout/contact-layout.component';
import { ContactDetailComponent } from './features/contacts/contact-detail/contact-detail.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { InfoComponent } from './pages/info/info.component';
import { AddTaskComponent } from './features/add-task/add-task.component';
import { BoardComponent } from './features/board/board.component';
import { SummaryComponent } from './features/summary/summary.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';

/**
 * @description Defines the main application routes.
 *
 * Each route is associated with a component and can include data for prerendering.
 */
export const routes: Routes = [
  // The login page is now the default route
  { path: '', component: LoginComponent },
  // Route for the sign-up page
  { path: 'sign-up', component: SignupComponent },

  // Route for the Add Task component
  {
    path: 'task',
    component: AddTaskComponent,
    data: { prerender: true },
    canActivate: [AuthGuard],
  },
  // Route for the Board component
  {
    path: 'board',
    component: BoardComponent,
    data: { prerender: true },
    canActivate: [AuthGuard],
  },
  // Route for the contacts layout
  {
    path: 'contacts',
    component: ContactLayoutComponent,
    data: { prerender: true },
    canActivate: [AuthGuard],
  },
  // Route for the Contact Detail component
  {
    path: 'contact-detail',
    component: ContactDetailComponent,
    data: { prerender: true },
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
    data: { prerender: true },
  },

  {
    path: 'summary',
    component: SummaryComponent,
    data: { prerender: true },
    canActivate: [AuthGuard],
  },

  {
    path: 'app-signup',
    component: SignupComponent,
    data: { prerender: true },
  },
];
