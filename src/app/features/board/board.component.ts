import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ModalBoardComponent } from './modal-board/modal-board.component';

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
  status: 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
  subtasks?: Subtask[];
  contacts?: Contact[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string | number | Date;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    ModalBoardComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  /** @property {boolean} showModal - Controls the visibility of the "Add Task" modal. */
  showModal = false;

  /** @property {Task[]} todo - Array for tasks displayed in the 'To do' column in the template. */
  todo: Task[] = [];

  /** @property {Task[]} inprogress - Array for tasks displayed in the 'In progress' column in the template. */
  inprogress: Task[] = [];

  /** @property {Task[]} awaitfeedback - Array for tasks displayed in the 'Awaiting Feedback' column in the template. */
  awaitfeedback: Task[] = [];

  /** @property {Task[]} done - Array for tasks displayed in the 'Done' column in the template. */
  done: Task[] = [];

  /** @property {Task | null} selectedTask - Holds the currently selected task for display in the detail modal. */
  selectedTask: Task | null = null;
  
  /** @property {string} searchTerm - Is bound via ngModel to the search input in the HTML and holds the current search term. */
  searchTerm: string = '';

  /** @property {Task[]} allTasks - A master list that always holds all tasks unchanged for filtering purposes. */
  private allTasks: Task[] = [];
noTasksMessage: string = "";
  /**
   * Initializes the component. Loads the initial tasks into the master list and distributes them to the columns.
   */
  ngOnInit(): void {
    this.initializeAllTasks();
    this.distributeTasks(this.allTasks);
  }

  /**
   * Populates the `allTasks` master list with initial task data and assigns the correct status to each task.
   */
  private initializeAllTasks(): void {
    const initialTodo: Omit<Task, 'status'>[] = [
      {
        id: 1, category: 'User Story', categoryColor: '#0038FF', title: 'Kochwelt Page & Recipe Recommender',
        description: 'Build a page that recommends recipes based on selected ingredients.',
        subtasks: [{ id: 1, title: 'Create UI layout', done: true }, { id: 2, title: 'Connect API', done: true }],
        contacts: [{ initials: 'AM', color: '#FF8A00' }, { initials: 'EM', color: '#1FD7C1' }, { initials: 'MB', color: '#6E52FF' }],
        priority: 'high'
      }
    ];

    const initialInprogress: Omit<Task, 'status'>[] = [
      {
        id: 2, category: 'Technical Task', categoryColor: '#1FD7C1', title: 'Implement Authentication',
        description: 'Secure the application by implementing user authentication.',
        subtasks: [{ id: 1, title: 'Add login form', done: true }, { id: 2, title: 'Integrate backend', done: false }],
        contacts: [{ initials: 'JD', color: '#FF8A00' }],
        priority: 'low'
      }
    ];

    const initialAwaitfeedback: Omit<Task, 'status'>[] = [
      {
        id: 3, category: 'User Story', categoryColor: '#0038FF', title: 'CSS Architecture Planning',
        description: 'Define CSS naming conventions and structure.',
        subtasks: [{ id: 1, title: 'Create UI layout', done: false }, { id: 2, title: 'Connect API', done: false }],
        contacts: [{ initials: 'SW', color: '#2aad56ff' }, { initials: 'MD', color: '#6aa39dff' }, { initials: 'PL', color: '#3c326fff' }],
        priority: 'medium'
      }
    ];

    this.allTasks = [
      ...initialTodo.map(task => ({ ...task, status: 'todo' as const })),
      ...initialInprogress.map(task => ({ ...task, status: 'inprogress' as const })),
      ...initialAwaitfeedback.map(task => ({ ...task, status: 'awaitfeedback' as const }))
    ];
  }

  /**
   * Filters tasks based on the `searchTerm` in real-time and distributes the results to the columns.
   * Triggered on every input in the search field.
   */
  filterTasks(): void {
    const search = this.searchTerm.toLowerCase().trim();

    if (!search) {
    this.distributeTasks(this.allTasks);
    return;
  }

    const filteredTasks = this.allTasks.filter(task =>
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search)
    );

    this.distributeTasks(filteredTasks);

    this.noTasksMessage = filteredTasks.length === 0
    ? "No results found."
    : "";
  }

  /**
   * Distributes a given list of tasks into the four status arrays (todo, inprogress, etc.) for correct display in the template.
   * @param {Task[]} tasks - The list of tasks to be distributed.
   */
  private distributeTasks(tasks: Task[]): void {
    this.todo = tasks.filter(t => t.status === 'todo');
    this.inprogress = tasks.filter(t => t.status === 'inprogress');
    this.awaitfeedback = tasks.filter(t => t.status === 'awaitfeedback');
    this.done = tasks.filter(t => t.status === 'done');
  }

  /**
   * Handles the `drop` event for the drag-and-drop functionality.
   * Updates a task's status when it is moved to a new column.
   * @param {CdkDragDrop<Task[]>} event - The drop event triggered by the Angular CDK.
   */
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
      task.status = newStatus;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
  
  /**
   * Calculates the number of completed subtasks for a given task.
   * @param {Task} task - The task for which to count the completed subtasks.
   * @returns {number} The number of completed subtasks.
   */
  getDoneSubtasks(task: Task): number {
    return task.subtasks ? task.subtasks.filter(s => s.done).length : 0;
  }

  /**
   * Calculates the progress of subtasks as a percentage.
   * @param {Task} task - The task for which the progress is to be calculated.
   * @returns {number} The progress percentage (0-100).
   */
  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return (this.getDoneSubtasks(task) / task.subtasks.length) * 100;
  }
  
  /**
   * Opens the modal to display the task details.
   * @param {Task} task - The task to be displayed in the modal.
   */
  openTaskModal(task: Task) {
    this.selectedTask = task;
  }
}