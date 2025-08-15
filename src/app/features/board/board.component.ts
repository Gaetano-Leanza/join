import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ModalBoardComponent} from './modal-board/modal-board.component';
/**
 * @interface Task
 * Definiert die Struktur für ein einzelnes Task-Objekt.
 */
export interface Task {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag,ModalBoardComponent,CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {

showModal = false;

  /** @property {Task[]} todo - Array für Tasks im Status 'To do'. */
  todo: Task[] = [
    {
      id: 1,
      category: 'User Story',
      categoryColor: '#0038FF',
      title: 'Kochwelt Page & Recipe Recommender',
      description: 'Build a page that recommends recipes based on selected ingredients.'
    }
  ];

  /** @property {Task[]} inprogress - Array für Tasks im Status 'In progress'. */
  inprogress: Task[] = [
    {
      id: 2,
      category: 'Technical Task',
      categoryColor: '#1FD7C1',
      title: 'Implement Authentication',
      description: 'Secure the application by implementing user authentication.'
    }
  ];

  /** @property {Task[]} awaitfeedback - Array für Tasks im Status 'Awaiting Feedback'. */
  awaitfeedback: Task[] = [];

  /** @property {Task[]} done - Array für Tasks im Status 'Done'. */
  done: Task[] = [];

  /**
   * Behandelt das `drop`-Ereignis für die Drag-and-Drop-Funktionalität.
   * Verschiebt ein Element entweder innerhalb seiner eigenen Liste oder transferiert es in eine neue Liste.
   * @param {CdkDragDrop<Task[]>} event - Das Drop-Ereignis, das vom Angular CDK ausgelöst wird.
   */
  drop(event: CdkDragDrop<Task[]>) {
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