import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
/**
 * @title Drag&Drop connected sorting
 */


@Component({
  selector: 'app-board',
  standalone:true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})

export class BoardComponent {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
inprogress= ['In work', 'coding', 'music listening', 'eating'];
  done = ['Get up', 'Sleeping', 'Lerning', 'Check e-mail', 'Walk dog'];
awaitfeedback= ['Dancing', 'Shopping', 'Take a shower', 'Reading', 'Walk cat'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}