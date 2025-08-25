import { Component,EventEmitter,Input,Output } from '@angular/core';
import { Task} from '../../../services/task.service';  
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-modal-edit',
  imports: [CommonModule ],
  
  templateUrl: './board-modal-edit.component.html',
  styleUrl: './board-modal-edit.component.scss'
})
export class BoardModalEditComponent {
  taskService: any;
showEditModal = true;



  @Input() task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();

  editedTask!: Task;

  ngOnInit() {
    // Deep copy, damit Original nicht sofort verändert wird
    this.editedTask = { ...this.task };
  }

  onSave() {
    this.save.emit(this.editedTask);
  }

  onClose() {
    this.close.emit();
  } 
  closeEditModal() {
  this.showEditModal = false;
}
 saveEdit() {
  
  this.taskService.updateTask(this.task.id, this.task);
  this.closeEditModal();
}

}
