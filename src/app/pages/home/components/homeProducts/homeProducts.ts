import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCard } from '../../../../shared/components/productCard/productCard';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-products',
  imports: [ProductCard, RouterLink],
  templateUrl: './homeProducts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProducts { }
