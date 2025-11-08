import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { WCCart, WCCartItem } from '../models/woocommerce/wc-cart.model';

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
    if (savedCartKey) {
      this.cartKey.set(savedCartKey);
      this.getCart().subscribe();
    }
  }

  getCart(): Observable<WCCart> {
    const key = this.cartKey();
    const url = key ? `${this.baseUrl}/cart?cart_key=${key}` : `${this.baseUrl}/cart`;
    
    return this.http.get<WCCart>(url).pipe(
      tap(cart => {
        this.cart.set(cart);
        if (cart.cart_key) {
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

    const key = this.cartKey();
    const url = key ? `${this.baseUrl}/cart/add-item?cart_key=${key}` : `${this.baseUrl}/cart/add-item`;

    return this.http.post<WCCart>(url, body).pipe(
      tap(cart => {
        this.cart.set(cart);
        if (cart.cart_key) {
          this.cartKey.set(cart.cart_key);
          localStorage.setItem('cart_key', cart.cart_key);
        }
      })
    );
  }

  updateCartItem(itemKey: string, quantity: number): Observable<WCCart> {
    const key = this.cartKey();
    const url = `${this.baseUrl}/cart/item/${itemKey}?cart_key=${key}`;
    
    return this.http.post<WCCart>(url, { quantity: quantity.toString() }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  removeCartItem(itemKey: string): Observable<WCCart> {
    const key = this.cartKey();
    const url = `${this.baseUrl}/cart/item/${itemKey}?cart_key=${key}`;
    
    return this.http.delete<WCCart>(url).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  clearCart(): Observable<any> {
    const key = this.cartKey();
    const url = `${this.baseUrl}/cart/clear?cart_key=${key}`;
    
    return this.http.post(url, {}).pipe(
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
