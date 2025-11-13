import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface OrderData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    address_1: string;
    city: string;
    state: string;
  };
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
}

export interface OrderResponse {
  id: number;
  order_key: string;
  status: string;
  total: string;
  payment_url?: string;
  redirect_url?: string;
}

export interface MercadoPagoResponse {
  id: string;
  init_point: string; // URL to redirect user to Mercado Pago checkout
  sandbox_init_point?: string;
}

export interface TransbankResponse {
  token: string;
  url: string; // URL to redirect user to Webpay
}

/**
 * Payment Service
 *
 * Handles payment processing for Mercado Pago and Transbank
 * integrations with WooCommerce.
 *
 * REQUIREMENTS:
 * - WooCommerce Mercado Pago plugin installed and configured
 * - WooCommerce Transbank Webpay Plus plugin installed and configured
 * - Custom REST API endpoints in WordPress to handle payment creation
 *
 * FLOW:
 * 1. Create WooCommerce order
 * 2. Initiate payment with chosen gateway
 * 3. Redirect user to payment provider (Mercado Pago or Transbank)
 * 4. User completes payment
 * 5. Provider redirects back to your site
 * 6. WordPress plugin updates order status
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = environment.woocommerce.url;
  private apiUrl = environment.apiUrl;

  /**
   * Create a WooCommerce order
   *
   * @param orderData Order billing and payment data
   * @returns Observable with order response
   */
  createOrder(orderData: OrderData): Observable<OrderResponse> {
    const url = `${this.baseUrl}/orders`;
    return this.http.post<OrderResponse>(url, orderData);
  }

  /**
   * Initiate Mercado Pago payment
   *
   * This method assumes you have a custom WordPress endpoint that:
   * 1. Creates a Mercado Pago preference
   * 2. Returns the checkout URL
   *
   * Endpoint example: /wp-json/wc/v3/mercadopago/create-preference
   *
   * @param orderId WooCommerce order ID
   * @returns Observable with Mercado Pago response
   */
  createMercadoPagoPayment(orderId: number): Observable<MercadoPagoResponse> {
    const url = `${this.apiUrl}/wc/v3/mercadopago/create-preference`;

    return this.http.post<MercadoPagoResponse>(url, {
      order_id: orderId
    });
  }

  /**
   * Initiate Transbank Webpay payment
   *
   * This method assumes you have a custom WordPress endpoint that:
   * 1. Creates a Transbank Webpay transaction
   * 2. Returns the token and URL for redirection
   *
   * Endpoint example: /wp-json/wc/v3/transbank/create-transaction
   *
   * @param orderId WooCommerce order ID
   * @returns Observable with Transbank response
   */
  createTransbankPayment(orderId: number): Observable<TransbankResponse> {
    const url = `${this.apiUrl}/wc/v3/transbank/create-transaction`;

    return this.http.post<TransbankResponse>(url, {
      order_id: orderId
    });
  }

  /**
   * Process payment based on selected method
   *
   * @param paymentMethod 'mercadopago' or 'transbank'
   * @param orderData Order data
   * @returns Observable with redirect URL
   */
  processPayment(paymentMethod: string, orderData: OrderData): Observable<{ redirect_url: string }> {
    // First create the order
    return new Observable(observer => {
      this.createOrder(orderData).subscribe({
        next: (order) => {
          // Order created, now initiate payment
          if (paymentMethod === 'mercadopago') {
            this.createMercadoPagoPayment(order.id).subscribe({
              next: (mpResponse) => {
                observer.next({ redirect_url: mpResponse.init_point });
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          } else if (paymentMethod === 'transbank') {
            this.createTransbankPayment(order.id).subscribe({
              next: (tbResponse) => {
                observer.next({ redirect_url: tbResponse.url });
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          } else {
            observer.error(new Error('Invalid payment method'));
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
