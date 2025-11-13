import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { WCCart, WCCartItem } from '../models/woocommerce/wc-cart.model';
import { validateCartKey } from '../utils/security.utils';

@Injectable({
  providedIn: 'root'
})
export class CartApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.cocart.url;

  private cart = signal<WCCart | null>(null);
  private cartKey = signal<string | null>(null);

  constructor() {
    const savedCartKey = localStorage.getItem('cart_key');
    if (savedCartKey && validateCartKey(savedCartKey)) {
      this.cartKey.set(savedCartKey);
      this.getCart().subscribe();
    } else if (savedCartKey) {
      // Invalid cart key, remove it
      localStorage.removeItem('cart_key');
    }
  }

  /**
   * Get HTTP headers with cart key (more secure than URL params)
   */
  private getCartHeaders(): HttpHeaders {
    const key = this.cartKey();
    let headers = new HttpHeaders();

    if (key) {
      headers = headers.set('Cart-Key', key);
    }

    return headers;
  }

  getCart(): Observable<WCCart> {
    const url = `${this.baseUrl}/cart`;
    const headers = this.getCartHeaders();

    return this.http.get<WCCart>(url, { headers }).pipe(
      tap(cart => {
        this.cart.set(cart);
        if (cart.cart_key && validateCartKey(cart.cart_key)) {
          this.cartKey.set(cart.cart_key);
          localStorage.setItem('cart_key', cart.cart_key);
        }
      })
    );
  }

  addToCart(productId: number, quantity: number = 1, variation?: any): Observable<WCCart> {
    const body: any = {
      id: productId.toString(),
      quantity: quantity.toString()
    };

    if (variation) {
      body.variation = variation;
    }

    const url = `${this.baseUrl}/cart/add-item`;
    const headers = this.getCartHeaders();

    // Debug logging
    console.log('Adding to cart:', {
      productId,
      quantity,
      currentCartKey: this.cartKey(),
      headers: headers.get('Cart-Key')
    });

    return this.http.post<WCCart>(url, body, { headers }).pipe(
      tap(cart => {
        console.log('Cart response:', {
          cartKey: cart.cart_key,
          itemCount: cart.item_count,
          items: cart.items?.length || 0
        });

        this.cart.set(cart);
        if (cart.cart_key && validateCartKey(cart.cart_key)) {
          this.cartKey.set(cart.cart_key);
          localStorage.setItem('cart_key', cart.cart_key);
          console.log('Cart key saved:', cart.cart_key);
        }
      })
    );
  }

  updateCartItem(itemKey: string, quantity: number): Observable<WCCart> {
    const url = `${this.baseUrl}/cart/item/${itemKey}`;
    const headers = this.getCartHeaders();

    return this.http.post<WCCart>(url, { quantity: quantity.toString() }, { headers }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  removeCartItem(itemKey: string): Observable<WCCart> {
    const url = `${this.baseUrl}/cart/item/${itemKey}`;
    const headers = this.getCartHeaders();

    return this.http.delete<WCCart>(url, { headers }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  clearCart(): Observable<any> {
    const url = `${this.baseUrl}/cart/clear`;
    const headers = this.getCartHeaders();

    return this.http.post(url, {}, { headers }).pipe(
      tap(() => {
        this.cart.set(null);
        this.cartKey.set(null);
        localStorage.removeItem('cart_key');
      })
    );
  }

  isProductInCart(productId: number): boolean {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items) return false;
    
    return currentCart.items.some(item => item.id === productId);
  }

  getCartItemCount(): number {
    return this.cart()?.item_count || 0;
  }

  getCartTotal(): string {
    return this.cart()?.totals.total || '0';
  }

  getCartSignal() {
    return this.cart;
  }

  getCartKeySignal() {
    return this.cartKey;
  }
}
