import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-board',
  imports: [],
  templateUrl: './modal-board.component.html',
  styleUrls: ['./modal-board.component.scss'] 
})
export class ModalBoardComponent {
  @Output() close = new EventEmitter<void>();
}