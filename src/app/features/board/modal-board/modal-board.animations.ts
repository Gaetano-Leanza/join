import { animate, style, transition, trigger } from '@angular/animations';

/**
 * @description
 * Defines a slide-in and slide-out animation for a modal component.
 * The modal slides in from the right when it enters the view and slides out to the right when it leaves.
 *
 * @usage
 * Use the trigger `[@slideInModal]` on the element you want to animate.
 */
export const slideInModal = trigger('slideInModal', [
  /**
   * Defines the animation for when the element enters the DOM.
   * It starts from being fully translated to the right and invisible,
   * then animates to its final position with full opacity.
   */
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '300ms ease-out',
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
  /**
   * Defines the animation for when the element is removed from the DOM.
   * It animates from its current position to being fully translated to the right and invisible.
   */
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ transform: 'translateX(100%)', opacity: 0 })
    ),
  ]),
]);
