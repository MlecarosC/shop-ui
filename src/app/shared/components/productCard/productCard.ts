import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './productCard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard { }
