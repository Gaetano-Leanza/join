import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ModalBoardComponent} from './modal-board/modal-board.component';

export interface Subtask {
  id: number;
  title: string;
  done: boolean;
}
export interface Contact {
  initials: string;
  color: string;
}
export interface Task {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  subtasks?: Subtask[];
  contacts?: Contact[];
  priority?: 'low' | 'medium' | 'high'; // Optional property for task priority
  dueDate?: string | number | Date; // Optional property for due date
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
      description: 'Build a page that recommends recipes based on selected ingredients.',
      subtasks: [
        { id: 1, title: 'Create UI layout', done: true },
        { id: 2, title: 'Connect API', done: true }
      ],
      contacts: [
        { initials: 'AM', color: '#FF8A00' },
        { initials: 'EM', color: '#1FD7C1' },
        { initials: 'MB', color: '#6E52FF' }
      ],
      priority: 'high' // Example of setting a priority
    }
  ];

  /** @property {Task[]} inprogress - Array für Tasks im Status 'In progress'. */
  inprogress: Task[] = [
    {
      id: 2,
      category: 'Technical Task',
      categoryColor: '#1FD7C1',
      title: 'Implement Authentication',
      description: 'Secure the application by implementing user authentication.',
      subtasks: [
        { id: 1, title: 'Add login form', done: true },
        { id: 2, title: 'Integrate backend', done: false }
      ],
      contacts: [
        { initials: 'JD', color: '#FF8A00' }
      ],
            priority: 'low' // Example of setting a priority

    }
  ];

    

  /** @property {Task[]} awaitfeedback - Array für Tasks im Status 'Awaiting Feedback'. */
  awaitfeedback: Task[] = [
    {
      id: 3,
      category: 'User Story',
      categoryColor: '#0038FF',
      title: 'CSS Architecture Planning',
      description: 'Define CSS naming conventions and structure...',
      subtasks: [
        { id: 1, title: 'Create UI layout', done: false},
        { id: 2, title: 'Connect API', done: false}
      ],
      contacts: [
        { initials: 'SW', color: '#2aad56ff' },
        { initials: 'MD', color: '#6aa39dff' },
        { initials: 'PL', color: '#3c326fff' }
      ],
      priority: 'medium' // Example of setting a priority
    }
  ];


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

  getDoneSubtasks(task: Task): number {
    return task.subtasks ? task.subtasks.filter(s => s.done).length : 0;
  }

  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return (this.getDoneSubtasks(task) / task.subtasks.length) * 100;
  }

  selectedTask: Task | null = null;

openTaskModal(task: Task) {
  this.selectedTask = task;
}

 
}