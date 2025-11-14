import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '@core/models';
import { CartService } from '@core/services';
import { ToastService } from '@shared/services/toast.service';

/**
 * Product Card Component
 *
 * Tarjeta de producto que muestra:
 * - Imagen del producto
 * - Nombre y precio
 * - Estado de stock
 * - Botón para agregar al carrito
 * - Link al detalle del producto
 *
 * @example
 * ```html
 * <app-product-card [product]="product" />
 * ```
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  /** Producto a mostrar (requerido) */
  @Input({ required: true }) product!: Product;

  /** Inject services */
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  /** Signal para controlar el estado de carga al agregar al carrito */
  public readonly isAddingToCart = signal<boolean>(false);

  /**
   * Obtiene la imagen principal del producto o una imagen por defecto
   */
  get productImage(): string {
    return this.product.images && this.product.images.length > 0
      ? this.product.images[0].src
      : 'https://via.placeholder.com/300x300?text=Sin+Imagen';
  }

  /**
   * Verifica si el producto tiene descuento
   */
  get hasDiscount(): boolean {
    return this.product.onSale && this.product.salePrice < this.product.regularPrice;
  }

  /**
   * Calcula el porcentaje de descuento
   */
  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return Math.round(
      ((this.product.regularPrice - this.product.salePrice) / this.product.regularPrice) * 100
    );
  }

  /**
   * Verifica si el producto está en stock
   */
  get isInStock(): boolean {
    return this.product.stockStatus === 'instock';
  }

  /**
   * Verifica si el producto se puede comprar
   */
  get isPurchasable(): boolean {
    return this.product.purchasable && this.isInStock;
  }

  /**
   * Agrega el producto al carrito
   */
  addToCart(): void {
    if (!this.isPurchasable || this.isAddingToCart()) {
      return;
    }

    this.isAddingToCart.set(true);

    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.toastService.success(
          `${this.product.name} agregado al carrito`,
          3000
        );
        this.isAddingToCart.set(false);
      },
      error: (error) => {
        this.toastService.error(
          error.message || 'Error al agregar el producto al carrito',
          4000
        );
        this.isAddingToCart.set(false);
      }
    });
  }
}
