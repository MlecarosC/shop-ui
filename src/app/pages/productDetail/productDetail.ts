import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../shared/services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './productDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private subscription = new Subscription();

  product = this.productService.getProductById(0);

  constructor() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);
        if (isNaN(id)) {
          this.router.navigate(['/products']);
          return;
        }
        
        this.product = this.productService.getProductById(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
