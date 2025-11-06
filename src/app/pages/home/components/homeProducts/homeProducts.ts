import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCard } from '../../../../shared/components/productCard/productCard';

@Component({
  selector: 'app-home-products',
  imports: [ProductCard],
  templateUrl: './homeProducts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProducts { }
