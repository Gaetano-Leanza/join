import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTaskComponent } from '../../add-task/add-task.component';
import { Task } from '../../../services/task.service';

@Component({
  selector: 'app-board-modal-edit',
  imports: [AddTaskComponent,CommonModule],
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

onSave() {
    this.saved.emit(this.task);
    this.close.emit();
  }

}
