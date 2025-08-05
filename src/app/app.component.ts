import { Component } from '@angular/core';
<<<<<<< HEAD
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../app/shared/header/header.component';
import { FooterComponent } from '../app/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, FooterComponent],
=======
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from '../app/shared/header/header.component';
import{FooterComponent} from '../app/shared/footer/footer.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
>>>>>>> 7002410 (header and footer with  nav)
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  template: ` <router-outlet /> `,
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}
