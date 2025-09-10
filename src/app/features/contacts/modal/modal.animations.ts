import { animate, style, transition, trigger } from '@angular/animations';

/**
 * @description Animation trigger for a modal that slides in and out from the right.
 *
 * - On entering (:enter), the modal is animated from a position of 100% translation
 * and 0 opacity to position 0 and 1 opacity.
 * - On leaving (:leave), the modal slides back to the right and fades out.
 */
export const slideInModal = trigger('slideInModal', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '300ms ease-out',
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ transform: 'translateX(100%)', opacity: 0 })
    ),
  ]),
]);

/**
 * @description Animation trigger for a fading in and out info message.
 * * - On entering (:enter), the message fades in from opacity 0 and slides up.
 * - On leaving (:leave), the message fades out and slides down.
 */
export const fadeInOutInfo = trigger('fadeInOutInfo', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(40px)' }),
    animate(
      '2000ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '2000ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 0, transform: 'translateY(40px)' })
    ),
  ]),
]);
