import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}