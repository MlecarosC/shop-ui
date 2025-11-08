import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WooCommerceApiService } from './woocommerce-api.service';
import { WCOrder } from '../models/woocommerce/wc-order.model';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService extends WooCommerceApiService {
  private authService = inject(AuthApiService);
  
  private userOrders = signal<WCOrder[]>([]);

  createOrder(orderData: {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: any;
    shipping: any;
    line_items: Array<{
      product_id: number;
      quantity: number;
    }>;
    shipping_lines?: any[];
    customer_id?: number;
  }): Observable<WCOrder> {
    return this.post<WCOrder>('orders', orderData);
  }

  getUserOrders(params?: {
    per_page?: number;
    page?: number;
    status?: string;
    orderby?: 'date' | 'id';
    order?: 'asc' | 'desc';
  }): Observable<WCOrder[]> {
    const userId = this.authService.getCurrentUserSignal()()?.id;
    
    let httpParams = new HttpParams();
    httpParams = httpParams.set('customer', userId?.toString() || '');
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.get<WCOrder[]>('orders', httpParams).pipe(
      tap(orders => this.userOrders.set(orders))
    );
  }

  getOrderById(orderId: number): Observable<WCOrder> {
    return this.get<WCOrder>(`orders/${orderId}`);
  }

  updateOrder(orderId: number, orderData: Partial<WCOrder>): Observable<WCOrder> {
    return this.put<WCOrder>(`orders/${orderId}`, orderData);
  }

  cancelOrder(orderId: number): Observable<WCOrder> {
    return this.updateOrder(orderId, { status: 'cancelled' });
  }

  getOrdersByStatus(status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed'): Observable<WCOrder[]> {
    return this.getUserOrders({ status });
  }

  getUserOrdersSignal() {
    return this.userOrders;
  }
}
