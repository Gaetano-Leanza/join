import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../services/task.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-modal-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-board.component.html',
  styleUrls: ['./modal-board.component.scss']
})
export class ModalBoardComponent {
@Input() task!: Task;
  @Output() close = new EventEmitter<void>();


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
