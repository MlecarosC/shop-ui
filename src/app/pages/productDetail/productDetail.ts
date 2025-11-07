import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './productDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  productId = signal<number | null>(null);

  product = computed(() => {
    const id = this.productId();
    if (id === null) return null;
    return this.productService.getProductById(id);
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (isNaN(id)) {
        this.router.navigate(['/products']);
        return;
      }
      this.productId.set(id);
      
      if (!this.product()) {
        this.router.navigate(['/products']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  addToCart(): void {
    // Implementar lógica del carrito aquí
    console.log(`Added course ${this.productId()} to cart`);
  }
}
