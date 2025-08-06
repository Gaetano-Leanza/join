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
        <ng-content></ng-content>
      </div>
    </div>
  `,
  animations: [slideInModal],
  styleUrls: ['./modal.component.scss'], // <-- Verweis auf ausgelagerte Datei
})

export class ModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  handleBackdropClick() {
    this.closed.emit();
  }
}
