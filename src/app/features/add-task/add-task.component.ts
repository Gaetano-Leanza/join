import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
})
export class AddTaskComponent {
  isActive1 = false;
  isActive2 = false;
  isActive3 = false;

  toggleButton1() {
    this.isActive1 = !this.isActive1;
    console.log('Button 1:', this.isActive1);
  }

  toggleButton2() {
    this.isActive2 = !this.isActive2;
    console.log('Button 2:', this.isActive2);
  }

  toggleButton3() {
    this.isActive3 = !this.isActive3;
    console.log('Button 3:', this.isActive3);
  }

  title: string = '';
  description: string = '';

  addTask() {
    if (this.title.trim()) {
      console.log('Neue Aufgabe:', {
        title: this.title,
        description: this.description,
        buttonStates: {
          button1: this.isActive1,
          button2: this.isActive2,
          button3: this.isActive3,
        },
      });

      this.title = '';
      this.description = '';
      // Optional: Buttons zurücksetzen
      // this.isActive1 = false;
      // this.isActive2 = false;
      // this.isActive3 = false;
    } else {
      alert('Bitte gib einen Titel für die Aufgabe ein.');
    }
  }
}
