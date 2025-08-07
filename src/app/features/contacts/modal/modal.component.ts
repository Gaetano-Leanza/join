import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInModal } from './modal.animations';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="visible" (click)="handleBackdropClick()">
      <div
        class="modal-content"
        [@slideInModal]
        (click)="$event.stopPropagation()"
      >
        <div class="content-container">
          <div class="left-panel">
            <ng-content select=".left-content"></ng-content>
            <img src="/img/Capa 2.svg" alt="join-logo" />
          </div>
          <div class="right-panel">
            <ng-content select=".right-content"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [slideInModal],
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  handleBackdropClick() {
    this.closed.emit();
  }
}
