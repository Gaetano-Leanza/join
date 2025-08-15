import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

// Ein "Interface" beschreibt, wie ein einzelner Task aussieht.
// Das sorgt für sauberen und sicheren Code.
export interface Task {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  // Hier könnten später noch zugewiesene Kontakte, Priorität etc. hinzukommen
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  // Jetzt nutzen wir unser neues "Task"-Interface
  todo: Task[] = [
    {
      id: 1,
      category: 'User Story',
      categoryColor: '#0038FF',
      title: 'Kochwelt Page & Recipe Recommender',
      description: 'Build a page that recommends recipes based on selected ingredients.'
    }
  ];

  inprogress: Task[] = [
    {
      id: 2,
      category: 'Technical Task',
      categoryColor: '#1FD7C1',
      title: 'Implement Authentication',
      description: 'Secure the application by implementing user authentication.'
    }
  ];

  awaitfeedback: Task[] = [];

  done: Task[] = [];

  drop(event: CdkDragDrop<Task[]>) { // Hier auch den Typ anpassen
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