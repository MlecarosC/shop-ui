import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProductCard } from '../../../../shared/components/productCard/productCard';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-home-products',
  imports: [ProductCard, RouterLink],
  templateUrl: './homeProducts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProducts {
  private productService = inject(ProductService);
  
  featuredProducts = signal(this.productService.getFeaturedProducts(3));
}
