import { animate, style, transition, trigger } from '@angular/animations';

/**
 * Animations-Trigger für ein Modal, das von rechts hereinschiebt und herausgleitet.
 * 
 * - Beim Einblenden (:enter) wird das Modal von rechts mit einer Translation von 100% und
 *   einer Opazität von 0 auf die Position 0 und Opazität 1 animiert.
 * - Beim Ausblenden (:leave) fährt das Modal zurück nach rechts und wird dabei ausgeblendet.
 */
export const slideInModal = trigger('slideInModal', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
  ]),
]);
