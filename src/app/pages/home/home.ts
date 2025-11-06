import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Hero } from './components/hero/hero';
import { HomeProducts } from './components/homeProducts/homeProducts';
import { HomeBlog } from './components/homeBlog/homeBlog';

@Component({
  selector: 'app-home',
  imports: [Hero, HomeProducts, HomeBlog],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home { }
