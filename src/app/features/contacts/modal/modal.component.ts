import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInModal } from './modal.animations';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [slideInModal],
})

export class ModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  handleBackdropClick() {
    this.closed.emit();
  }
}
