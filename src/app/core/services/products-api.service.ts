import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WCProduct, WCCategory } from '@core/models';

/**
 * Product Query Parameters
 */
export interface ProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
  tag?: number;
  featured?: boolean;
  on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating';
  order?: 'asc' | 'desc';
  status?: 'draft' | 'pending' | 'private' | 'publish';
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
}

/**
 * Paginated Products Response
 */
export interface PaginatedProductsResponse {
  products: WCProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

/**
 * Products API Service
 *
 * Handles all product-related API calls to WooCommerce.
 * Implements caching with Angular signals for better performance.
 * Provides methods for fetching products with filters, pagination, and search.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  // Cache for products with signals
  private readonly productsCache = signal<Map<string, WCProduct[]>>(new Map());
  private readonly categoriesCache = signal<WCCategory[] | null>(null);

  // Computed signal for checking if categories are loaded
  public readonly categoriesLoaded = computed(() => !!this.categoriesCache());

  constructor(private http: HttpClient) {}

  /**
   * Get products with optional filters and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Observable with paginated products response
   */
  getProducts(params: ProductQueryParams = {}): Observable<PaginatedProductsResponse> {
    const url = `${environment.woocommerce.url}/products`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    // Create cache key from params
    const cacheKey = this.getCacheKey(params);
    const cached = this.productsCache().get(cacheKey);

    // Return cached data if available and recent
    if (cached && this.isCacheValid(cacheKey)) {
      return of({
        products: cached,
        total: cached.length,
        totalPages: 1,
        currentPage: params.page || 1,
        perPage: params.per_page || 10
      });
    }

    return this.http.get<WCProduct[]>(url, {
      headers,
      params: httpParams,
      observe: 'response'
    }).pipe(
      map((response) => {
        const products = response.body || [];
        const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

        // Update cache
        const cache = this.productsCache();
        cache.set(cacheKey, products);
        this.productsCache.set(new Map(cache));

        return {
          products,
          total,
          totalPages,
          currentPage: params.page || 1,
          perPage: params.per_page || 10
        };
      }),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single product by ID
   *
   * @param productId - Product ID
   * @returns Observable with product data
   */
  getProductById(productId: number): Observable<WCProduct> {
    // Check cache first
    const cache = this.productsCache();
    for (const products of cache.values()) {
      const found = products.find(p => p.id === productId);
      if (found) {
        return of(found);
      }
    }

    const url = `${environment.woocommerce.url}/products/${productId}`;
    const headers = this.getHeaders();

    return this.http.get<WCProduct>(url, { headers }).pipe(
      tap((product) => {
        // Update cache with single product
        const cacheKey = `product_${productId}`;
        const cache = this.productsCache();
        cache.set(cacheKey, [product]);
        this.productsCache.set(new Map(cache));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get product by slug
   *
   * @param slug - Product slug
   * @returns Observable with product data
   */
  getProductBySlug(slug: string): Observable<WCProduct | null> {
    const params: ProductQueryParams = {
      slug: slug as any,
      per_page: 1
    };

    return this.getProducts(params).pipe(
      map((response) => {
        return response.products.length > 0 ? response.products[0] : null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Get all product categories
   *
   * @param params - Optional query parameters
   * @returns Observable with categories array
   */
  getCategories(params: { per_page?: number; parent?: number; hide_empty?: boolean } = {}): Observable<WCCategory[]> {
    // Return cached categories if available
    const cached = this.categoriesCache();
    if (cached && !params.parent && !params.hide_empty) {
      return of(cached);
    }

    const url = `${environment.woocommerce.url}/products/categories`;
    const headers = this.getHeaders();

    let httpParams = new HttpParams();
    httpParams = httpParams.set('per_page', (params.per_page || 100).toString());

    if (params.parent !== undefined) {
      httpParams = httpParams.set('parent', params.parent.toString());
    }

    if (params.hide_empty !== undefined) {
      httpParams = httpParams.set('hide_empty', params.hide_empty.toString());
    }

    return this.http.get<WCCategory[]>(url, { headers, params: httpParams }).pipe(
      tap((categories) => {
        // Cache categories if fetching all
        if (!params.parent && !params.hide_empty) {
          this.categoriesCache.set(categories);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get category by ID
   *
   * @param categoryId - Category ID
   * @returns Observable with category data
   */
  getCategoryById(categoryId: number): Observable<WCCategory> {
    // Check cache first
    const cached = this.categoriesCache();
    if (cached) {
      const found = cached.find(c => c.id === categoryId);
      if (found) {
        return of(found);
      }
    }

    const url = `${environment.woocommerce.url}/products/categories/${categoryId}`;
    const headers = this.getHeaders();

    return this.http.get<WCCategory>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search products by query string
   *
   * @param query - Search query
   * @param params - Additional query parameters
   * @returns Observable with paginated products response
   */
  searchProducts(query: string, params: Omit<ProductQueryParams, 'search'> = {}): Observable<PaginatedProductsResponse> {
    return this.getProducts({ ...params, search: query });
  }

  /**
   * Get featured products
   *
   * @param params - Optional query parameters
   * @returns Observable with paginated products response
   */
  getFeaturedProducts(params: Omit<ProductQueryParams, 'featured'> = {}): Observable<PaginatedProductsResponse> {
    return this.getProducts({ ...params, featured: true });
  }

  /**
   * Get products on sale
   *
   * @param params - Optional query parameters
   * @returns Observable with paginated products response
   */
  getOnSaleProducts(params: Omit<ProductQueryParams, 'on_sale'> = {}): Observable<PaginatedProductsResponse> {
    return this.getProducts({ ...params, on_sale: true });
  }

  /**
   * Get products by category
   *
   * @param categoryId - Category ID
   * @param params - Optional query parameters
   * @returns Observable with paginated products response
   */
  getProductsByCategory(categoryId: number, params: Omit<ProductQueryParams, 'category'> = {}): Observable<PaginatedProductsResponse> {
    return this.getProducts({ ...params, category: categoryId });
  }

  /**
   * Get products by tag
   *
   * @param tagId - Tag ID
   * @param params - Optional query parameters
   * @returns Observable with paginated products response
   */
  getProductsByTag(tagId: number, params: Omit<ProductQueryParams, 'tag'> = {}): Observable<PaginatedProductsResponse> {
    return this.getProducts({ ...params, tag: tagId });
  }

  /**
   * Clear products cache
   * Useful when data needs to be refreshed
   */
  clearProductsCache(): void {
    this.productsCache.set(new Map());
  }

  /**
   * Clear categories cache
   * Useful when data needs to be refreshed
   */
  clearCategoriesCache(): void {
    this.categoriesCache.set(null);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.clearProductsCache();
    this.clearCategoriesCache();
  }

  /**
   * Build HTTP params from query parameters
   *
   * @param params - Query parameters
   * @returns HttpParams object
   */
  private buildHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  /**
   * Generate cache key from query parameters
   *
   * @param params - Query parameters
   * @returns Cache key string
   */
  private getCacheKey(params: ProductQueryParams): string {
    return JSON.stringify(params);
  }

  /**
   * Check if cache is still valid
   * Cache is valid for 5 minutes
   *
   * @param cacheKey - Cache key
   * @returns Boolean indicating if cache is valid
   */
  private isCacheValid(cacheKey: string): boolean {
    // For now, always return false to fetch fresh data
    // In production, implement proper cache expiration logic
    return false;
  }

  /**
   * Get HTTP headers for WooCommerce API
   * Note: In production, this should be handled by a backend proxy
   *
   * @returns HttpHeaders object
   */
  private getHeaders(): HttpHeaders {
    // WARNING: Exposing consumer keys in frontend is NOT recommended for production
    // This should be handled by a backend proxy that adds authentication
    const auth = btoa(`${environment.woocommerce.consumerKey}:${environment.woocommerce.consumerSecret}`);

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    });
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while fetching products. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'Product not found.';
          break;
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    console.error('Products API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
