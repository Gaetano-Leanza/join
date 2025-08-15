import { Component, Output, EventEmitter } from '@angular/core';
import { slideInModal } from './modal-board.animations';

@Component({
  selector: 'app-modal-board',
  imports: [],
  templateUrl: './modal-board.component.html',
  styleUrls: ['./modal-board.component.scss'] ,
  animations: [slideInModal]
})
export class ModalBoardComponent {
  @Output() close = new EventEmitter<void>();
}