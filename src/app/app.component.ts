import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/shared/header/header.component';
import { FooterComponent } from '../app/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  template: ` <router-outlet /> `,
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}