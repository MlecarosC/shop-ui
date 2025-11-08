import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../shared/services/product.service';
import { Subscription } from 'rxjs';
import { Loading } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, Loading],
  templateUrl: './productDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private subscription = new Subscription();

  product = this.productService.getProductById(0);
  isLoading = signal(true);
  minLoadingTime = 500;
  loadingStartTime = 0;

  constructor() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);
        if (isNaN(id)) {
          this.router.navigate(['/products']);
          return;
        }
        
        this.isLoading.set(true);
        this.loadingStartTime = Date.now();
        this.product = this.productService.getProductById(id);
      })
    );

    effect(() => {
      const prod = this.product();
      const elapsed = Date.now() - this.loadingStartTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsed);

      if (prod !== null && this.loadingStartTime > 0) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, remainingTime);
      }
    });
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
