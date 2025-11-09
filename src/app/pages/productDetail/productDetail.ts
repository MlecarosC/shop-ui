import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, effect, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../shared/services/product.service';
import { CartApiService } from '../../core/services/cart-api.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ToastService } from '../../shared/services/toast.service';
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
  private cartService = inject(CartApiService);
  private authService = inject(AuthApiService);
  private toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  private subscription = new Subscription();

  product = signal<Product | null>(null);
  isLoading = signal(true);
  isLoadingCart = signal(false);
  userHasPurchased = signal(false);
  minLoadingTime = 500;
  loadingStartTime = 0;

  cart = this.cartService.getCartSignal();
  
  isInCart = computed(() => {
    const prod = this.product();
    const currentCart = this.cart();
    
    if (!prod || !currentCart?.items) return false;
    
    return currentCart.items.some(item => item.id === prod.id);
  });

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
            
            if (this.authService.getIsAuthenticatedSignal()()) {
              this.checkIfUserPurchased(prod.id);
            }
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

  private checkIfUserPurchased(productId: number): void {
    this.authService.hasUserPurchasedProduct(productId).subscribe({
      next: (hasPurchased) => {
        this.userHasPurchased.set(hasPurchased);
      },
      error: (error) => {
        console.error('Error checking purchase status:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    if (this.isInCart()) {
      this.toastService.warning('Este producto ya está en tu carrito');
      return;
    }

    if (this.userHasPurchased()) {
      this.toastService.info('Ya has comprado este curso');
      return;
    }

    this.isLoadingCart.set(true);

    this.cartService.addToCart(prod.id, 1).subscribe({
      next: () => {
        this.isLoadingCart.set(false);
        this.toastService.success('Producto añadido al carrito');
      },
      error: (error) => {
        this.isLoadingCart.set(false);
        console.error('Error adding to cart:', error);
        this.toastService.error('Error al añadir al carrito. Intenta de nuevo.');
      }
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
