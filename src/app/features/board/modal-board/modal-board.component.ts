import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subtask, Task } from '../../../services/task.service';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { getAvatarColor, getInitials } from '../../add-task/avatar-utils';
import { BoardModalEditComponent } from '../board-modal-edit/board-modal-edit.component';
import { slideInModal } from './modal-board.animations';

/**
 * @Component ModalBoardComponent
 * Displays the details of a single task in a modal view on the board.
 * It allows for actions like deleting, editing, and updating subtask status.
 */
@Component({
  selector: 'app-modal-board',
  standalone: true,
  imports: [CommonModule, BoardModalEditComponent],
  templateUrl: './modal-board.component.html',
  styleUrls: ['./modal-board.component.scss'],
  animations: [slideInModal],
})
export class ModalBoardComponent {
  /** Reference to the getInitials utility function for template access. */
  getInitials = getInitials;
  /** Reference to the getAvatarColor utility function for template access. */
  getAvatarColor = getAvatarColor;

  /** The task data to be displayed in the modal. */
  @Input() task!: Task;
  /** Emits an event to close the modal. */
  @Output() close = new EventEmitter<void>();

  /** @deprecated This property appears to be unused. */
  topContacts: any;
  /** @deprecated This property appears to be unused. */
  Subtasks: any;

  /** Controls the visibility of the nested edit modal. */
  showEditModal = false;

  /**
   * @constructor
   * @param {TaskService} taskService - Service for task-related operations.
   */
  constructor(private taskService: TaskService) {}

  /**
   * Deletes the current task and closes the modal.
   */
  onDeleteTask(): void {
    if (this.task && this.task.id) {
      this.taskService.deleteTask(this.task.id);
      this.close.emit();
    }
  }

  /**
   * Opens the edit view for the current task.
   */
  openEditModal() {
    this.showEditModal = true;
  }

  /**
   * Closes the edit view and the main modal.
   */
  closeEditModal() {
    this.showEditModal = false;
    this.close.emit();
  }

  /**
   * Toggles the 'done' status of a subtask and updates it in the database.
   * @param {Subtask} subtask - The subtask to be updated.
   */
  toggleSubtaskDone(subtask: Subtask) {
    subtask.done = !subtask.done;
    if (this.task && this.task.id) {
      const updateData: Partial<Task> = { subtasks: this.task.subtasks };
      this.taskService.updateTask(this.task.id, updateData);
    }
  }

  /**
   * Returns a specific color based on the task's category.
   * @param {string} category - The category of the task.
   * @returns {string} The hex color code for the category.
   */
  public getCategoryColor(category: string): string {
    switch (category) {
      case 'User Story':
        return ' #0038FF';
      case 'Technical Task':
        return ' #1FD7C1';
      default:
        return '#CCCCCC';
    }
  }
}
