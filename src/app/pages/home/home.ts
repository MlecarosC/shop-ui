import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-home',
  imports: [Hero],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home { }
