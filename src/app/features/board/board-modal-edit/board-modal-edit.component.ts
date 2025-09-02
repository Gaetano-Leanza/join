import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../services/task.service';
import { AddTaskMobileComponent } from '../../add-task-mobile/add-task-mobile.component';

/**
 * @description Component for editing a task within a modal on the board.
 */
@Component({
  selector: 'app-board-modal-edit',
  imports: [CommonModule, AddTaskMobileComponent],
  templateUrl: './board-modal-edit.component.html',
  styleUrl: './board-modal-edit.component.scss'
})
export class BoardModalEditComponent {
  /**
   * @description The task object to be edited.
   */
  @Input() task!: Task;
  /**
   * @description Emits an event to close the modal.
   */
  @Output() close = new EventEmitter<void>();
  /**
   * @description Emits the updated task when changes are saved.
   */
  @Output() saved = new EventEmitter<Task>();

  /**
   * @description Controls the visibility of the edit modal.
   */
  showEditModal = false;

  /**
   * @description Opens the edit modal.
   */
  openEditModal() {
    this.showEditModal = true;
  }

  /**
   * @description Closes the edit modal.
   */
  closeEditModal() {
    this.showEditModal = false;
  }

  /**
   * @description Handles the event when a task is updated in the child component.
   * @param updatedTask The task object with updated values.
   */
  onTaskUpdated(updatedTask: Task) {
    this.saved.emit(updatedTask);
    this.closeEditModal();
  }

  /**
   * @description Saves the current task and emits the 'saved' and 'close' events.
   */
  onSave() {
    this.saved.emit(this.task);
    this.close.emit();
  }
}