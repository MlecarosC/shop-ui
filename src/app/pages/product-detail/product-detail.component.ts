import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductsApiService } from '@core/services/products-api.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { WCProduct } from '@core/models';

/**
 * Product Detail Page Component
 *
 * Displays complete product information including:
 * - Product images and gallery
 * - Name, price, and description
 * - Stock status and availability
 * - Add to cart functionality
 * - Discount badge
 * - Purchase history indicator
 * - Breadcrumb navigation
 *
 * @example
 * Route: /product/:id
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  /** Inject services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Product data signal */
  public readonly product = signal<WCProduct | null>(null);

  /** Loading state signal */
  public readonly isLoading = signal<boolean>(true);

  /** Adding to cart state signal */
  public readonly isAddingToCart = signal<boolean>(false);

  /** User purchase verification signal */
  public readonly userHasPurchased = signal<boolean>(false);

  /** Selected image index signal */
  public readonly selectedImageIndex = signal<number>(0);

  /** Computed signals */
  public readonly hasProduct = computed(() => !!this.product());
  public readonly isInStock = computed(() => this.product()?.stock_status === 'instock');
  public readonly isPurchasable = computed(() => this.product()?.purchasable && this.isInStock());
  public readonly hasDiscount = computed(() => {
    const prod = this.product();
    return prod ? prod.on_sale && parseFloat(prod.sale_price) < parseFloat(prod.regular_price) : false;
  });
  public readonly discountPercentage = computed(() => {
    const prod = this.product();
    if (!prod || !this.hasDiscount()) return 0;
    const regular = parseFloat(prod.regular_price);
    const sale = parseFloat(prod.sale_price);
    return Math.round(((regular - sale) / regular) * 100);
  });
  public readonly currentImage = computed(() => {
    const prod = this.product();
    if (!prod || !prod.images || prod.images.length === 0) {
      return 'https://via.placeholder.com/600x600?text=Sin+Imagen';
    }
    return prod.images[this.selectedImageIndex()]?.src || prod.images[0].src;
  });
  public readonly productPrice = computed(() => {
    const prod = this.product();
    if (!prod) return '0';
    return prod.on_sale ? prod.sale_price : prod.price;
  });

  /**
   * Component initialization
   * Loads product data based on route parameter
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = parseInt(params['id'], 10);
      if (productId && !isNaN(productId)) {
        this.loadProduct(productId);
      } else {
        this.toastService.error('ID de producto inválido', 3000);
        this.router.navigate(['/products']);
      }
    });
  }

  /**
   * Load product data with minimum loading time for better UX
   *
   * @param productId - Product ID to load
   */
  private loadProduct(productId: number): void {
    this.isLoading.set(true);

    // Minimum loading time of 500ms for better UX
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 500));

    Promise.all([
      this.productsApiService.getProductById(productId).toPromise(),
      minLoadTime
    ]).then(([product]) => {
      if (product) {
        this.product.set(product);
        this.checkUserPurchaseHistory(productId);
      } else {
        this.toastService.error('Producto no encontrado', 3000);
        this.router.navigate(['/products']);
      }
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading product:', error);
      this.toastService.error(
        error.message || 'Error al cargar el producto. Por favor, intenta nuevamente.',
        4000
      );
      this.isLoading.set(false);
      this.router.navigate(['/products']);
    });
  }

  /**
   * Check if authenticated user has purchased this product
   *
   * @param productId - Product ID to check
   */
  private checkUserPurchaseHistory(productId: number): void {
    if (this.authService.isAuthenticated()) {
      this.authService.hasUserPurchasedProduct(productId).subscribe({
        next: (hasPurchased) => {
          this.userHasPurchased.set(hasPurchased);
        },
        error: (error) => {
          console.error('Error checking purchase history:', error);
        }
      });
    }
  }

  /**
   * Add product to shopping cart
   */
  addToCart(): void {
    const prod = this.product();
    if (!prod || !this.isPurchasable() || this.isAddingToCart()) {
      return;
    }

    this.isAddingToCart.set(true);

    this.cartService.addToCart(prod.id, 1).subscribe({
      next: () => {
        this.toastService.success(
          `${prod.name} agregado al carrito`,
          3000
        );
        this.isAddingToCart.set(false);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.toastService.error(
          error.message || 'Error al agregar el producto al carrito. Por favor, intenta nuevamente.',
          4000
        );
        this.isAddingToCart.set(false);
      }
    });
  }

  /**
   * Change selected product image
   *
   * @param index - Image index to select
   */
  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  /**
   * Get sanitized HTML for product description
   * Ensures HTML content is safe to render
   *
   * @param html - HTML string to sanitize
   * @returns Safe HTML
   */
  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Get stock status display text
   *
   * @returns Stock status text
   */
  getStockStatusText(): string {
    const prod = this.product();
    if (!prod) return '';

    switch (prod.stock_status) {
      case 'instock':
        return 'En stock';
      case 'outofstock':
        return 'Agotado';
      case 'onbackorder':
        return 'Disponible bajo pedido';
      default:
        return 'No disponible';
    }
  }

  /**
   * Get stock status CSS class
   *
   * @returns CSS class for stock status badge
   */
  getStockStatusClass(): string {
    const prod = this.product();
    if (!prod) return 'badge-ghost';

    switch (prod.stock_status) {
      case 'instock':
        return 'badge-success';
      case 'outofstock':
        return 'badge-error';
      case 'onbackorder':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  }

  /**
   * Format price for display
   *
   * @param price - Price string
   * @returns Formatted price
   */
  formatPrice(price: string): string {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }
}
