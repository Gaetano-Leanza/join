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
  PlaceholderFunktion() {
    throw new Error('Method not implemented.');
  }

  // Beispiel-Daten / States
  title: string = '';
  description: string = '';

  addTask() {
    if (this.title.trim()) {
      console.log('Neue Aufgabe:', {
        title: this.title,
        description: this.description,
      });
      // Felder leeren
      this.title = '';
      this.description = '';
    } else {
      alert('Bitte gib einen Titel für die Aufgabe ein.');
    }
  }
}

function PlaceholderFunktion() {
  throw new Error('Function not implemented.');
}
