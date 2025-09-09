import { Component, HostListener } from '@angular/core';
import { Task } from '../../services/task.service';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss', './summary.responsive.scss'],
})
export class SummaryComponent {
  showSplash = false;
  tasks: Task[] = [];
  username: string = '';
  userData: any = null;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private firebaseService: FirebaseService
  ) {}

async ngOnInit() {
  this.taskService.getTasks().subscribe(tasks => {
    this.tasks = tasks;
  });
  
  // Benutzernamen aus Session Storage holen
  this.username = sessionStorage.getItem('username') || 'Guest';
  
  // Optional: Weitere Benutzerdaten laden falls vorhanden
  if (this.username !== 'Guest') {
    await this.loadUserData();
  }
  
  this.applySplashRule();
}

// Optimierte Methode zum Laden von Benutzerdaten
async loadUserData() {
  try {
    const userId = sessionStorage.getItem('userId');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (userId) {
      // Direkt über User ID abrufen (effizienter)
      this.firebaseService.getDocumentById('users', userId).subscribe(userData => {
        if (userData) {
          this.userData = userData;
          console.log('User data loaded:', this.userData);
        }
      });
    } else if (userEmail) {
      // Falls keine ID vorhanden, über Email suchen
      const users = await this.firebaseService
        .getCollectionData('users')
        .toPromise();
      this.userData = users?.find((user) => user['email'] === userEmail);
      
      if (this.userData) {
        console.log('User data loaded:', this.userData);
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

  @HostListener('window:resize')
  onResize() {
    this.applySplashRule(); // prüfe auch beim Resize
  }
  private applySplashRule() {
    const isNarrow = window.innerWidth < 1361;
    const splashShown = sessionStorage.getItem('summarySplashShown');

    if (isNarrow && !splashShown) {
      // Splash kurz zeigen
      this.showSplash = true;
      setTimeout(() => {
        this.showSplash = false;
        sessionStorage.setItem('summarySplashShown', 'true'); // nur einmal pro Tab
      }, 2000);
    } else if (!isNarrow) {
      // Bei breiter Ansicht Splash nie anzeigen
      this.showSplash = false;
      // Optional: Flag zurücksetzen, damit er beim nächsten Wechsel auf <1360 wieder erscheint
      sessionStorage.removeItem('summarySplashShown');
    }
  }

  getToDoCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'toDo').length
      : 0;
  }

  getDoneCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'done').length
      : 0;
  }

  getProgressTaskCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'inProgress').length
      : 0;
  }

  getAwaitingTasksCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.progress === 'awaitFeedback')
          .length
      : 0;
  }

  getUrgentCount(): number {
    return this.tasks
      ? this.tasks.filter((task: Task) => task.priority === 'urgent').length
      : 0;
  }

  getTasksCount(): number {
    return this.tasks ? this.tasks.length : 0;
  }

  getUpcomingDeadline(): string | null {
    if (!this.tasks || this.tasks.length === 0) return null;
    // Nur Tasks mit gültigem dueDate (kein leerer String, kein null, kein undefined, und in der Zukunft)
    const now = new Date();
    const tasksWithDueDate = this.tasks.filter((task) => {
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  navigateToBoard() {
    this.router.navigate(['/board']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    else if (hour < 18) return 'Good Afternoon';
    else return 'Good Evening';
  }
}
