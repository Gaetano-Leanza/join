import { Component } from '@angular/core';
import { Task } from '../../services/task.service';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  tasks: Task[] = [];

  constructor(private router: Router,private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }
getToDoCount(): number {
  return this.tasks ? this.tasks.filter((task: Task) => task.progress === 'toDo').length : 0;
}

getDoneCount(): number {
  return this.tasks ? this.tasks.filter((task: Task) => task.progress === 'done').length : 0;
}

getProgressTaskCount(): number {
  return this.tasks ? this.tasks.filter((task: Task) => task.progress === 'inProgress').length : 0;
}


getAwaitingTasksCount(): number{
    return this.tasks ? this.tasks.filter((task: Task) => task.progress === 'awaitFeedback').length : 0;

}

getUrgentCount(): number {
  return this.tasks ? this.tasks.filter((task: Task) => task.priority === 'urgent').length : 0;
}

getTasksCount(): number {
  return this.tasks ? this.tasks.length : 0;
}

getUpcomingDeadline(): string | null {
  if (!this.tasks || this.tasks.length === 0) return null;
  // Nur Tasks mit gültigem dueDate (kein leerer String, kein null, kein undefined, und in der Zukunft)
  const now = new Date();
  const tasksWithDueDate = this.tasks.filter(task => {
    if (!task.dueDate) return false;
    const date = new Date(task.dueDate);
    return !isNaN(date.getTime()) && date >= now;
  });
  if (tasksWithDueDate.length === 0) return null;
  // Frühestes zukünftiges Datum finden
  const nextTask = tasksWithDueDate.reduce((prev, curr) =>
    new Date(prev.dueDate) < new Date(curr.dueDate) ? prev : curr
  );
  const date = new Date(nextTask.dueDate);
 // Format: October 16, 2022
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });}

  navigateToBoard() {
  this.router.navigate(['/board']);
}
}


