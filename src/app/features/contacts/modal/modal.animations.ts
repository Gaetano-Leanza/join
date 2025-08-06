// modal.animations.ts
import { animate, style, transition, trigger } from '@angular/animations';

export const slideInModal = trigger('slideInModal', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
  ]),
]);
