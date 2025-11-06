import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Hero } from './components/hero/hero';
import { HomeProducts } from './components/homeProducts/homeProducts';
import { HomeBlog } from './components/homeBlog/homeBlog';
import { LogoCarousel } from './components/logoCarousel/logoCarousel';

@Component({
  selector: 'app-home',
  imports: [Hero, HomeProducts, LogoCarousel, HomeBlog],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home { }
