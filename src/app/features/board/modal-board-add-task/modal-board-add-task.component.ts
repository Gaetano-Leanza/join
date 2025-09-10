import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInModal } from './modal-board-add-task.animations';
import { AddTaskComponent } from '../../add-task/add-task.component';

/**
 * @description
 * This component acts as a modal wrapper for the `AddTaskComponent` on the board view.
 * It handles the modal's presentation and closing behavior.
 */
@Component({
  selector: 'app-modal-board-add-task',
  standalone: true,
  imports: [CommonModule, AddTaskComponent],
  templateUrl: './modal-board-add-task.component.html',
  styleUrls: ['./modal-board-add-task.component.scss'],
  animations: [slideInModal],
})
export class ModalBoardAddTaskComponent {
  /**
   * @description
   * Emits an event when the modal should be closed.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * @constructor
   */
  constructor() {}
}
