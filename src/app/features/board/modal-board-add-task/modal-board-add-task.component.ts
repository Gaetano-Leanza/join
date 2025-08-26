import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInModal } from './modal-board-add-task.animations';
import { AddTaskComponent } from '../../add-task/add-task.component';

@Component({
  selector: 'app-modal-board-add-task',
  imports: [CommonModule,AddTaskComponent],
  templateUrl: './modal-board-add-task.component.html',
  styleUrls: ['./modal-board-add-task.component.scss'] ,
  animations: [slideInModal]
})
export class ModalBoardAddTaskComponent {

  @Output() close = new EventEmitter<void>();
  
  }