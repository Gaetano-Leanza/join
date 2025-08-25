import { Component, EventEmitter, Input, Output,OnInit} from '@angular/core';
import { Task } from '../../../services/task.service';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service'; 
import{getAvatarColor,getInitials} from '../../add-task/avatar-utils';
@Component({
  selector: 'app-modal-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-board.component.html',
  styleUrls: ['./modal-board.component.scss']
})
export class ModalBoardComponent {
  getInitials = getInitials;
  getAvatarColor = getAvatarColor;
  

@Input() task!: Task;
  @Output() close = new EventEmitter<void>();
topContacts: any;
Subtasks: any;

    constructor(private taskService: TaskService) {}
    
onDeleteTask(): void {
  if (this.task && this.task.id) {        
    this.taskService.deleteTask(this.task.id);
    this.close.emit(); // Modal schließen nach dem Löschen
  } }

 public getCategoryColor(category: string): string {
  switch (category) {
    case 'User Story':
      return ' #0038FF';     
    case 'Technical Task':
      return ' #1FD7C1';     
    default:
      return '#CCCCCC'; // Standardfarbe für unbekannte Kategorien
  }
}



}
