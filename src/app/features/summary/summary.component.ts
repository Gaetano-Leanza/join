import { Component, HostListener, OnInit } from '@angular/core';
import { Task } from '../../services/task.service';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

/**
 * @description This component displays a summary of tasks, including counts by status and priority,
 * and the next upcoming deadline. It also greets the user.
 */
@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss', './summary.responsive.scss'],
})
export class SummaryComponent implements OnInit {
  /**
   * @description Controls the visibility of the splash screen on mobile devices.
   */
  showSplash = false;
  /**
   * @description An array containing all the tasks.
   */
  tasks: Task[] = [];
  /**
   * @description The name of the currently logged-in user.
   */
  username: string = '';
  /**
   * @description Holds additional data for the logged-in user.
   */
  userData: any = null;

  /**
   * @constructor
   * @param router - The Angular Router for navigation.
   * @param taskService - The service for managing task data.
   * @param firebaseService - The service for interacting with Firebase.
   */
  constructor(
    private router: Router,
    private taskService: TaskService,
    private firebaseService: FirebaseService
  ) {}

  /**
   * @description Lifecycle hook that runs upon component initialization.
   * Fetches tasks, retrieves user data from session storage, and handles the splash screen logic.
   */
  async ngOnInit() {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.username = sessionStorage.getItem('username') || 'Guest';

    if (this.username !== 'Guest') {
      await this.loadUserData();
    }

    this.applySplashRule();
  }

  /**
   * @description Asynchronously loads user data from Firebase, first by user ID, then falling back to email.
   */
  async loadUserData() {
    try {
      const userId = sessionStorage.getItem('userId');
      const userEmail = sessionStorage.getItem('userEmail');

      if (userId) {
        this.firebaseService
          .getDocumentById('users', userId)
          .subscribe((userData) => {
            if (userData) {
              this.userData = userData;
            }
          });
      } else if (userEmail) {
        const users = await this.firebaseService
          .getCollectionData('users')
          .toPromise();
        this.userData = users?.find((user) => user['email'] === userEmail);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * @description Host listener that triggers on window resize to re-apply splash screen rules.
   */
  @HostListener('window:resize')
  onResize() {
    this.applySplashRule();
  }

  /**
   * @description Shows a splash screen on narrow viewports for a short duration, but only once per session.
   */
  private applySplashRule() {
    const isNarrow = window.innerWidth < 1361;
    const splashShown = sessionStorage.getItem('summarySplashShown');

    if (isNarrow && !splashShown) {
      this.showSplash = true;
      setTimeout(() => {
        this.showSplash = false;
        sessionStorage.setItem('summarySplashShown', 'true');
      }, 2000);
    } else if (!isNarrow) {
      this.showSplash = false;
      sessionStorage.removeItem('summarySplashShown');
    }
  }

  /**
   * @description Calculates the number of tasks with the 'toDo' progress status.
   * @returns {number} The count of 'To Do' tasks.
   */
  getToDoCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'toDo').length
      : 0;
  }

  /**
   * @description Calculates the number of tasks with the 'done' progress status.
   * @returns {number} The count of 'Done' tasks.
   */
  getDoneCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'done').length
      : 0;
  }

  /**
   * @description Calculates the number of tasks with the 'inProgress' status.
   * @returns {number} The count of 'In Progress' tasks.
   */
  getProgressTaskCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'inProgress').length
      : 0;
  }

  /**
   * @description Calculates the number of tasks with the 'awaitFeedback' status.
   * @returns {number} The count of 'Awaiting Feedback' tasks.
   */
  getAwaitingTasksCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'awaitFeedback')
          .length
      : 0;
  }

  /**
   * @description Calculates the number of tasks with 'urgent' priority.
   * @returns {number} The count of urgent tasks.
   */
  getUrgentCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.priority === 'urgent').length
      : 0;
  }

  /**
   * @description Calculates the total number of tasks.
   * @returns {number} The total task count.
   */
  getTasksCount(): number {
    return this.tasks ? this.tasks.length : 0;
  }

  /**
   * @description Finds the earliest upcoming deadline among all tasks.
   * @returns {string | null} The formatted date of the upcoming deadline, or null if there are no upcoming tasks.
   */
  getUpcomingDeadline(): string | null {
    if (!this.tasks || this.tasks.length === 0) return null;
    const now = new Date();
    const tasksWithDueDate = this.tasks.filter((task) => {
      if (!task.dueDate) return false;
      const date = new Date(task.dueDate);
      return !isNaN(date.getTime()) && date >= now;
    });
    if (tasksWithDueDate.length === 0) return null;
    const nextTask = tasksWithDueDate.reduce((prev, curr) =>
      new Date(prev.dueDate) < new Date(curr.dueDate) ? prev : curr
    );
    const date = new Date(nextTask.dueDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * @description Navigates the user to the main board page.
   */
  navigateToBoard() {
    this.router.navigate(['/board']);
  }

  /**
   * @description Returns a time-appropriate greeting.
   * @returns {string} 'Good Morning', 'Good Afternoon', or 'Good Evening'.
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    else if (hour < 18) return 'Good Afternoon';
    else return 'Good Evening';
  }
}
