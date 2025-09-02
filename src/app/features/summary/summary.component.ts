import { Component } from '@angular/core';
import { Task } from '../../services/task.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-summary',
  imports: [],
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

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

getTasksCount(): number {
  return this.tasks ? this.tasks.length : 0;
}
}


