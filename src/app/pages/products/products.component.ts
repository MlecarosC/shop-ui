import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsApiService, PaginatedProductsResponse } from '@core/services/products-api.service';
import { ToastService } from '@shared/services/toast.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { CardSkeletonComponent } from '@shared/components/card-skeleton/card-skeleton.component';
import { WCProduct, WCCategory } from '@core/models';

/**
 * Products Page Component
 *
 * Displays a paginated list of products with category filtering.
 * Features:
 * - Grid layout with responsive design
 * - Category filter dropdown
 * - Pagination controls
 * - Loading states with skeleton cards
 * - Error handling with toast notifications
 *
 * @example
 * ```html
 * <app-products />
 * ```
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    CardSkeletonComponent
  ],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  /** Inject services */
  private readonly productsApiService = inject(ProductsApiService);
  private readonly toastService = inject(ToastService);

  /** Loading state signal */
  public readonly isLoading = signal<boolean>(true);

  /** Products data signal */
  public readonly products = signal<WCProduct[]>([]);

  /** Categories data signal */
  public readonly categories = signal<WCCategory[]>([]);

  /** Pagination state signals */
  public readonly currentPage = signal<number>(1);
  public readonly totalPages = signal<number>(1);
  public readonly total = signal<number>(0);
  public readonly perPage = signal<number>(12);

  /** Selected category filter signal */
  public readonly selectedCategory = signal<number | null>(null);

  /** Computed signals */
  public readonly hasProducts = computed(() => this.products().length > 0);
  public readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  public readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  /** Skeleton array for loading state */
  public readonly skeletonArray = Array(8).fill(0);

  /**
   * Component initialization
   * Loads categories and initial products
   */
  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  /**
   * Load product categories for filter dropdown
   */
  private loadCategories(): void {
    this.productsApiService.getCategories({ hide_empty: true }).subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.error(
          'Error al cargar las categorías. Por favor, intenta nuevamente.',
          4000
        );
      }
    });
  }

  /**
   * Load products with current filters and pagination
   */
  loadProducts(): void {
    this.isLoading.set(true);

    const params = {
      page: this.currentPage(),
      per_page: this.perPage(),
      ...(this.selectedCategory() && { category: this.selectedCategory()! })
    };

    this.productsApiService.getProducts(params).subscribe({
      next: (response: PaginatedProductsResponse) => {
        this.products.set(response.products);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);

        // Scroll to top after loading new page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error(
          error.message || 'Error al cargar los productos. Por favor, intenta nuevamente.',
          4000
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Handle category filter change
   *
   * @param event - Select change event
   */
  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const categoryId = select.value ? parseInt(select.value, 10) : null;

    this.selectedCategory.set(categoryId);
    this.currentPage.set(1); // Reset to first page when changing filter
    this.loadProducts();
  }

  /**
   * Navigate to previous page
   */
  goToPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(page => page - 1);
      this.loadProducts();
    }
  }

  /**
   * Navigate to next page
   */
  goToNextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(page => page + 1);
      this.loadProducts();
    }
  }

  /**
   * Convert WCProduct to Product model for ProductCard
   * Maps WooCommerce API response to simplified Product interface
   *
   * @param wcProduct - WooCommerce product
   * @returns Simplified Product object
   */
  mapToProduct(wcProduct: WCProduct): any {
    return {
      id: wcProduct.id,
      name: wcProduct.name,
      slug: wcProduct.slug,
      permalink: wcProduct.permalink,
      type: wcProduct.type,
      description: wcProduct.description,
      shortDescription: wcProduct.short_description,
      sku: wcProduct.sku,
      price: parseFloat(wcProduct.price) || 0,
      regularPrice: parseFloat(wcProduct.regular_price) || 0,
      salePrice: parseFloat(wcProduct.sale_price) || 0,
      onSale: wcProduct.on_sale,
      purchasable: wcProduct.purchasable,
      stockStatus: wcProduct.stock_status,
      stockQuantity: wcProduct.stock_quantity,
      manageStock: wcProduct.manage_stock,
      images: wcProduct.images.map(img => ({
        id: img.id,
        src: img.src,
        name: img.name,
        alt: img.alt,
        position: img.position
      })),
      categories: wcProduct.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })),
      tags: wcProduct.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })),
      attributes: wcProduct.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        options: attr.options,
        visible: attr.visible,
        variation: attr.variation
      })),
      variations: wcProduct.variations,
      averageRating: parseFloat(wcProduct.average_rating) || 0,
      ratingCount: wcProduct.rating_count,
      featured: wcProduct.featured,
      relatedIds: wcProduct.related_ids,
      upsellIds: wcProduct.upsell_ids,
      crossSellIds: wcProduct.cross_sell_ids
    };
  }
}
