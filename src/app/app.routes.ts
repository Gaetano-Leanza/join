import { Routes } from '@angular/router';
import { ContactLayoutComponent } from './features/contacts/contact-layout/contact-layout.component';
import { ContactDetailComponent } from './features/contacts/contact-detail/contact-detail.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { InfoComponent } from './pages/info/info.component';
import { AddTaskComponent } from './features/add-task/add-task.component';
import { BoardComponent } from './features/board/board.component';

export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  { 
    path: 'task', 
    component: AddTaskComponent, 
    data: { prerender: true } 
  },
  { 
    path: 'board', 
    component: BoardComponent, 
    data: { prerender: true } 
  },
  {
    path: 'contacts',
    component: ContactLayoutComponent,
    data: { prerender: true },
  },
  // GELÖST: Keine parametrisierte Route mehr!
  {
    path: 'contact-detail',
    component: ContactDetailComponent,
    data: { prerender: true }
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: { prerender: true },
  },
  {
    path: 'legal-notice',
    component: LegalNoticeComponent,
    data: { prerender: true },
  },
  { 
    path: 'info', 
    component: InfoComponent, 
    data: { prerender: true } 
  },
];