import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../shared/services/product.service';
import { Subscription } from 'rxjs';
import { Loading } from '../../shared/components/loading/loading';
import { Product } from '../products/models/Product';

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
  private sanitizer = inject(DomSanitizer);
  private subscription = new Subscription();

  product = signal<Product | null>(null);
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
        
        const productSignal = this.productService.getProductById(id);
        effect(() => {
          const prod = productSignal();
          if (prod !== null) {
            this.product.set(prod);
          }
        });
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

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
