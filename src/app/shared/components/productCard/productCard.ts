import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../pages/products/models/Product';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './productCard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  // Input opcional para usar con datos específicos
  product = input<Product | null>(null);
}
