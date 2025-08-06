import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInModal } from './modal.animations';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="visible" (click)="handleBackdropClick()">
      <div class="modal-content" [@slideInModal] (click)="$event.stopPropagation()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  animations: [slideInModal],
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }

    .modal-content {
      background: white;
      width: 80vw;
      height: 50vh;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
      padding: 1rem;
    }
  `]
})
export class ModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  handleBackdropClick() {
    this.closed.emit();
  }
}
