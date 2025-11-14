import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  WCOrder,
  WCCreateOrderRequest,
  WCUpdateOrderRequest,
  WCOrderStatus,
  WCOrderNote,
  WCCreateOrderNoteRequest
} from '@core/models';

/**
 * Order Query Parameters
 */
export interface OrderQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  status?: WCOrderStatus | WCOrderStatus[];
  customer?: number;
  product?: number;
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug';
  order?: 'asc' | 'desc';
}

/**
 * Paginated Orders Response
 */
export interface PaginatedOrdersResponse {
  orders: WCOrder[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

/**
 * Orders Service
 *
 * Handles all order-related API calls to WooCommerce.
 * Uses secure custom endpoint for order creation to protect API keys.
 * Provides methods for creating, retrieving, updating, and managing orders.
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  // Signal to track user's recent orders
  public readonly userOrders = signal<WCOrder[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Create a new order using secure custom endpoint
   * This endpoint handles WooCommerce authentication on the backend
   *
   * @param orderData - Order creation data
   * @param authToken - JWT authentication token
   * @returns Observable with created order
   */
  createOrder(orderData: WCCreateOrderRequest, authToken?: string): Observable<WCOrder> {
    // Use custom secure endpoint that handles WooCommerce keys on backend
    const url = `${environment.custom.url}/orders/create`;
    const headers = this.getAuthHeaders(authToken);

    return this.http.post<WCOrder>(url, orderData, { headers }).pipe(
      tap((order) => {
        // Add new order to user orders signal
        const currentOrders = this.userOrders();
        this.userOrders.set([order, ...currentOrders]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get orders for current user
   *
   * @param params - Query parameters for filtering and pagination
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getUserOrders(params: OrderQueryParams = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    const url = `${environment.woocommerce.url}/orders`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getAuthHeaders(authToken);

    return this.http.get<WCOrder[]>(url, {
      headers,
      params: httpParams,
      observe: 'response'
    }).pipe(
      map((response) => {
        const orders = response.body || [];
        const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

        // Update user orders signal
        this.userOrders.set(orders);

        return {
          orders,
          total,
          totalPages,
          currentPage: params.page || 1,
          perPage: params.per_page || 10
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single order by ID
   *
   * @param orderId - Order ID
   * @param authToken - JWT authentication token
   * @returns Observable with order data
   */
  getOrderById(orderId: number, authToken?: string): Observable<WCOrder> {
    const url = `${environment.woocommerce.url}/orders/${orderId}`;
    const headers = this.getAuthHeaders(authToken);

    return this.http.get<WCOrder>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing order
   * Note: Only certain fields can be updated after order creation
   *
   * @param orderId - Order ID to update
   * @param updateData - Order update data
   * @param authToken - JWT authentication token
   * @returns Observable with updated order
   */
  updateOrder(orderId: number, updateData: WCUpdateOrderRequest, authToken?: string): Observable<WCOrder> {
    const url = `${environment.woocommerce.url}/orders/${orderId}`;
    const headers = this.getAuthHeaders(authToken);

    return this.http.put<WCOrder>(url, updateData, { headers }).pipe(
      tap((updatedOrder) => {
        // Update order in user orders signal
        const currentOrders = this.userOrders();
        const index = currentOrders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          const newOrders = [...currentOrders];
          newOrders[index] = updatedOrder;
          this.userOrders.set(newOrders);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cancel an order
   *
   * @param orderId - Order ID to cancel
   * @param authToken - JWT authentication token
   * @returns Observable with cancelled order
   */
  cancelOrder(orderId: number, authToken?: string): Observable<WCOrder> {
    return this.updateOrder(orderId, { status: 'cancelled' }, authToken);
  }

  /**
   * Get orders by status
   *
   * @param status - Order status or array of statuses
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getOrdersByStatus(
    status: WCOrderStatus | WCOrderStatus[],
    params: Omit<OrderQueryParams, 'status'> = {},
    authToken?: string
  ): Observable<PaginatedOrdersResponse> {
    return this.getUserOrders({ ...params, status }, authToken);
  }

  /**
   * Get pending orders for current user
   *
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getPendingOrders(params: Omit<OrderQueryParams, 'status'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getOrdersByStatus('pending', params, authToken);
  }

  /**
   * Get processing orders for current user
   *
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getProcessingOrders(params: Omit<OrderQueryParams, 'status'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getOrdersByStatus('processing', params, authToken);
  }

  /**
   * Get completed orders for current user
   *
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getCompletedOrders(params: Omit<OrderQueryParams, 'status'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getOrdersByStatus('completed', params, authToken);
  }

  /**
   * Get order notes
   *
   * @param orderId - Order ID
   * @param authToken - JWT authentication token
   * @returns Observable with order notes array
   */
  getOrderNotes(orderId: number, authToken?: string): Observable<WCOrderNote[]> {
    const url = `${environment.woocommerce.url}/orders/${orderId}/notes`;
    const headers = this.getAuthHeaders(authToken);

    return this.http.get<WCOrderNote[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add note to order
   *
   * @param orderId - Order ID
   * @param noteData - Note data
   * @param authToken - JWT authentication token
   * @returns Observable with created note
   */
  addOrderNote(orderId: number, noteData: WCCreateOrderNoteRequest, authToken?: string): Observable<WCOrderNote> {
    const url = `${environment.woocommerce.url}/orders/${orderId}/notes`;
    const headers = this.getAuthHeaders(authToken);

    return this.http.post<WCOrderNote>(url, noteData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete order note
   *
   * @param orderId - Order ID
   * @param noteId - Note ID
   * @param authToken - JWT authentication token
   * @returns Observable with deletion result
   */
  deleteOrderNote(orderId: number, noteId: number, authToken?: string): Observable<any> {
    const url = `${environment.woocommerce.url}/orders/${orderId}/notes/${noteId}`;
    const headers = this.getAuthHeaders(authToken);

    const params = new HttpParams().set('force', 'true');

    return this.http.delete(url, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search orders by query string
   *
   * @param query - Search query
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  searchOrders(query: string, params: Omit<OrderQueryParams, 'search'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getUserOrders({ ...params, search: query }, authToken);
  }

  /**
   * Get orders by customer ID
   *
   * @param customerId - Customer ID
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getOrdersByCustomer(customerId: number, params: Omit<OrderQueryParams, 'customer'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getUserOrders({ ...params, customer: customerId }, authToken);
  }

  /**
   * Get orders containing a specific product
   *
   * @param productId - Product ID
   * @param params - Additional query parameters
   * @param authToken - JWT authentication token
   * @returns Observable with paginated orders response
   */
  getOrdersByProduct(productId: number, params: Omit<OrderQueryParams, 'product'> = {}, authToken?: string): Observable<PaginatedOrdersResponse> {
    return this.getUserOrders({ ...params, product: productId }, authToken);
  }

  /**
   * Clear user orders cache
   */
  clearOrdersCache(): void {
    this.userOrders.set([]);
  }

  /**
   * Build HTTP params from query parameters
   *
   * @param params - Query parameters
   * @returns HttpParams object
   */
  private buildHttpParams(params: OrderQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array values (like multiple statuses)
          httpParams = httpParams.set(key, value.join(','));
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });

    return httpParams;
  }

  /**
   * Get HTTP headers with authentication
   *
   * @param authToken - Optional JWT token (overrides stored token)
   * @returns HttpHeaders object
   */
  private getAuthHeaders(authToken?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
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
    let errorMessage = 'An error occurred with your order. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid order data.';
          break;
        case 401:
          errorMessage = 'You must be logged in to perform this action.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this order.';
          break;
        case 404:
          errorMessage = 'Order not found.';
          break;
        case 409:
          errorMessage = 'Unable to process order. Some items may be out of stock.';
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

    console.error('Orders Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
