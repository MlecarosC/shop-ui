import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, FooterComponent, ToastContainerComponent } from '@shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  templateUrl: './app.html'
})
export class App {}
