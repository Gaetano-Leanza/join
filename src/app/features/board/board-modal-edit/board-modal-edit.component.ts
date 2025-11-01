import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../services/task.service';
import { AddTaskMobileComponent } from '../../add-task-mobile/add-task-mobile.component';

/**
 * A modal component used for editing a task on the main board.
 * It serves as a container for the mobile task editing form.
 */
@Component({
  selector: 'app-board-modal-edit',
  standalone: true,
  imports: [CommonModule, AddTaskMobileComponent],
  templateUrl: './board-modal-edit.component.html',
  styleUrls: ['./board-modal-edit.component.scss'],
})
export class BoardModalEditComponent {
  /**
   * The task object to be edited.
   */
  @Input() task!: Task;
  /**
   * Emits an event when the edit modal should be closed.
   */
  @Output() close = new EventEmitter<void>();
  /**
   * Emits the updated task object after changes have been saved.
   */
  @Output() saved = new EventEmitter<Task>();

  /**
   * Controls the visibility of the edit modal dialog.
   */
  showEditModal = false;

  /**
   * Opens the edit modal.
   */
  openEditModal() {
    this.showEditModal = true;
  }

  /**
   * Closes the edit modal.
   */
  closeEditModal() {
    this.showEditModal = false;
  }

  /**
   * Handles the task update event from the child component.
   * @param {Task} updatedTask The task object containing the new values.
   */
  onTaskUpdated(updatedTask: Task) {
    this.saved.emit(updatedTask);
    this.closeEditModal();
  }

  /**
   * Saves the task and emits the corresponding events to the parent component.
   */
  onSave() {
    this.saved.emit(this.task);
    this.close.emit();
  }
}