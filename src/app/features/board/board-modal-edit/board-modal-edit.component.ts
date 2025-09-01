import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../services/task.service';
import { AddTaskMobileComponent } from '../../add-task-mobile/add-task-mobile.component';

@Component({
  selector: 'app-board-modal-edit',
  imports: [CommonModule, AddTaskMobileComponent],
  templateUrl: './board-modal-edit.component.html',
  styleUrl: './board-modal-edit.component.scss'
})
export class BoardModalEditComponent {
  @Input() task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Task>();

  showEditModal = false;

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onTaskUpdated(updatedTask: Task) {
    this.saved.emit(updatedTask);
    this.closeEditModal();
  }

  onSave() {
    this.saved.emit(this.task);
    this.close.emit();
  }

  
}