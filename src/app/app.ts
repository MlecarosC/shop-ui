import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { ToastContainer } from './shared/components/toastContainer/toastContainer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ToastContainer],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('shop-ui');
}
