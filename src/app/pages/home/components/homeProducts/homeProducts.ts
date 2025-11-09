import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { ProductCard } from '../../../../shared/components/productCard/productCard';
import { CardSkeleton } from '../../../../shared/components/cardSkeleton/cardSkeleton';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-home-products',
  imports: [ProductCard, CardSkeleton, RouterLink],
  templateUrl: './homeProducts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProducts {
  private productService = inject(ProductService);
  
  featuredProducts = this.productService.getFeaturedProducts(2);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const products = this.featuredProducts();
      if (products && products.length > 0) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 300);
      }
    });
  }
}
