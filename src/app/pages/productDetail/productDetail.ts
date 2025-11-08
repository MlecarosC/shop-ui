import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
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

  product = this.productService.getProductById(0);

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (isNaN(id)) {
        this.router.navigate(['/products']);
        return;
      }
      
      this.product = this.productService.getProductById(id);

      effect(() => {
        const currentProduct = this.product();
        if (currentProduct === null && id !== 0) {
          this.router.navigate(['/products']);
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  addToCart(): void {
    const prod = this.product();
    if (prod) {
      console.log(`Added course ${prod.id} to cart`);
    }
  }
}
