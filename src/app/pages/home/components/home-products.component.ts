import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductsApiService } from '@core/services/products-api.service';
import { ToastService } from '@shared/services/toast.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { CardSkeletonComponent } from '@shared/components/card-skeleton/card-skeleton.component';
import { Product } from '@core/models';

/**
 * Home Products Component
 *
 * Muestra una sección de productos destacados en la página de inicio.
 * - Carga los productos destacados/más vendidos del backend
 * - Grid responsive de ProductCard
 * - Loading state con CardSkeleton
 * - Botón para ver todos los productos
 *
 * @example
 * ```html
 * <app-home-products />
 * ```
 */
@Component({
  selector: 'app-home-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    CardSkeletonComponent
  ],
  templateUrl: './home-products.component.html'
})
export class HomeProductsComponent implements OnInit {
  /** Inyección de servicios */
  private readonly productsApiService = inject(ProductsApiService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  /** Signal para el estado de carga */
  public readonly isLoading = signal<boolean>(true);

  /** Signal para los productos destacados */
  public readonly featuredProducts = signal<Product[]>([]);

  /** Array para los skeleton loaders (8 items) */
  public readonly skeletonArray = Array(8).fill(0);

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  /**
   * Carga los productos destacados desde el backend
   */
  private loadFeaturedProducts(): void {
    this.isLoading.set(true);

    this.productsApiService.getFeaturedProducts({ per_page: 8 }).subscribe({
      next: (response) => {
        this.featuredProducts.set(response.products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.toastService.error(
          'No se pudieron cargar los productos destacados',
          4000
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navega a la página de productos
   */
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
