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

}
