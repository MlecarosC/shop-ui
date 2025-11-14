import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  WCCart,
  WCAddToCartRequest,
  WCUpdateCartItemRequest,
  WCRemoveCartItemRequest,
  WCCartItem
} from '@core/models';

/**
 * Cart Service
 *
 * Handles shopping cart operations using CoCart API.
 * Manages cart state with Angular signals for reactive updates.
 * Handles cart_key for anonymous users and authenticated users.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Storage key for cart_key
  private readonly CART_KEY_STORAGE = 'cocart_cart_key';

  // Signals for reactive cart state
  public readonly cart = signal<WCCart | null>(null);
  public readonly cartKey = signal<string | null>(this.getStoredCartKey());

  // Computed signals for cart information
  public readonly cartItemCount = computed(() => {
    const currentCart = this.cart();
    return currentCart?.item_count || 0;
  });

  public readonly cartTotal = computed(() => {
    const currentCart = this.cart();
    return currentCart?.totals?.total || '0';
  });

  public readonly cartIsEmpty = computed(() => {
    return this.cartItemCount() === 0;
  });

  public readonly cartItems = computed(() => {
    const currentCart = this.cart();
    return currentCart?.items || [];
  });

  constructor(private http: HttpClient) {
    // Effect to sync cart_key changes with localStorage
    effect(() => {
      const key = this.cartKey();
      if (key) {
        localStorage.setItem(this.CART_KEY_STORAGE, key);
      } else {
        localStorage.removeItem(this.CART_KEY_STORAGE);
      }
    });

    // Initialize cart on service creation
    this.initializeCart();
  }

  /**
   * Initialize cart by fetching current cart data
   */
  private initializeCart(): void {
    this.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (error) => {
        console.error('Error initializing cart:', error);
      }
    });
  }

  /**
   * Get current shopping cart
   *
   * @returns Observable with cart data
   */
  getCart(): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart`;
    const headers = this.getHeaders();

    return this.http.get<WCCart>(url, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
        // Store cart_key if not already stored
        if (cart.cart_key && !this.cartKey()) {
          this.cartKey.set(cart.cart_key);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Add product to cart
   *
   * @param productId - Product ID to add
   * @param quantity - Quantity to add (default: 1)
   * @param variationId - Variation ID if applicable
   * @returns Observable with updated cart
   */
  addToCart(productId: number, quantity: number = 1, variationId?: number): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/add-item`;
    const headers = this.getHeaders();

    const body: WCAddToCartRequest = {
      id: productId.toString(),
      quantity: quantity.toString(),
      return_cart: true
    };

    if (variationId) {
      body.variation = [{ id: variationId }] as any;
    }

    return this.http.post<WCCart>(url, body, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
        if (cart.cart_key) {
          this.cartKey.set(cart.cart_key);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update cart item quantity
   *
   * @param itemKey - Cart item key
   * @param quantity - New quantity
   * @returns Observable with updated cart
   */
  updateCartItem(itemKey: string, quantity: number): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/item/${itemKey}`;
    const headers = this.getHeaders();

    const body: WCUpdateCartItemRequest = {
      quantity,
      return_cart: true
    };

    return this.http.post<WCCart>(url, body, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Remove item from cart
   *
   * @param itemKey - Cart item key to remove
   * @returns Observable with updated cart
   */
  removeCartItem(itemKey: string): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/item/${itemKey}`;
    const headers = this.getHeaders();

    const params = {
      return_cart: 'true'
    };

    return this.http.delete<WCCart>(url, { headers, params }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Clear entire cart
   *
   * @returns Observable with empty cart
   */
  clearCart(): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/clear`;
    const headers = this.getHeaders();

    return this.http.post<WCCart>(url, {}, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Check if product is in cart
   *
   * @param productId - Product ID to check
   * @returns Boolean indicating if product is in cart
   */
  isProductInCart(productId: number): boolean {
    const items = this.cartItems();
    return items.some(item => item.id === productId);
  }

  /**
   * Get cart item by product ID
   *
   * @param productId - Product ID
   * @returns Cart item or null
   */
  getCartItemByProductId(productId: number): WCCartItem | null {
    const items = this.cartItems();
    return items.find(item => item.id === productId) || null;
  }

  /**
   * Get quantity of product in cart
   *
   * @param productId - Product ID
   * @returns Quantity in cart (0 if not in cart)
   */
  getProductQuantityInCart(productId: number): number {
    const item = this.getCartItemByProductId(productId);
    return item?.quantity.value || 0;
  }

  /**
   * Increase product quantity in cart
   *
   * @param itemKey - Cart item key
   * @returns Observable with updated cart
   */
  increaseQuantity(itemKey: string): Observable<WCCart> {
    const items = this.cartItems();
    const item = items.find(i => i.item_key === itemKey);

    if (!item) {
      return throwError(() => new Error('Item not found in cart'));
    }

    return this.updateCartItem(itemKey, item.quantity.value + 1);
  }

  /**
   * Decrease product quantity in cart
   * Removes item if quantity becomes 0
   *
   * @param itemKey - Cart item key
   * @returns Observable with updated cart
   */
  decreaseQuantity(itemKey: string): Observable<WCCart> {
    const items = this.cartItems();
    const item = items.find(i => i.item_key === itemKey);

    if (!item) {
      return throwError(() => new Error('Item not found in cart'));
    }

    const newQuantity = item.quantity.value - 1;

    if (newQuantity <= 0) {
      return this.removeCartItem(itemKey);
    }

    return this.updateCartItem(itemKey, newQuantity);
  }

  /**
   * Apply coupon code to cart
   *
   * @param couponCode - Coupon code to apply
   * @returns Observable with updated cart
   */
  applyCoupon(couponCode: string): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/apply-coupon`;
    const headers = this.getHeaders();

    const body = {
      coupon_code: couponCode,
      return_cart: true
    };

    return this.http.post<WCCart>(url, body, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Remove coupon from cart
   *
   * @param couponCode - Coupon code to remove
   * @returns Observable with updated cart
   */
  removeCoupon(couponCode: string): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/remove-coupon`;
    const headers = this.getHeaders();

    const params = {
      coupon: couponCode,
      return_cart: 'true'
    };

    return this.http.delete<WCCart>(url, { headers, params }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get cart totals
   *
   * @returns Observable with cart totals
   */
  getCartTotals(): Observable<any> {
    const url = `${environment.cocart.url}/cart/totals`;
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calculate shipping
   *
   * @param countryCode - Country code (e.g., 'US', 'CL')
   * @param state - State code
   * @param postcode - Postal code
   * @returns Observable with updated cart including shipping
   */
  calculateShipping(countryCode: string, state?: string, postcode?: string): Observable<WCCart> {
    const url = `${environment.cocart.url}/cart/calculate-shipping`;
    const headers = this.getHeaders();

    const body: any = {
      country: countryCode,
      return_cart: true
    };

    if (state) {
      body.state = state;
    }

    if (postcode) {
      body.postcode = postcode;
    }

    return this.http.post<WCCart>(url, body, { headers }).pipe(
      tap((cart) => {
        this.cart.set(cart);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get stored cart_key from localStorage
   *
   * @returns Stored cart_key or null
   */
  private getStoredCartKey(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.CART_KEY_STORAGE);
    }
    return null;
  }

  /**
   * Get HTTP headers for CoCart API
   * Includes cart_key for session management
   *
   * @returns HttpHeaders object
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const key = this.cartKey();
    if (key) {
      headers = headers.set('Cart-Key', key);
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred with your cart. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid cart operation.';
          break;
        case 404:
          errorMessage = 'Cart item not found.';
          break;
        case 409:
          errorMessage = 'Product is out of stock or quantity not available.';
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

    console.error('Cart Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
