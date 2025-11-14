import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersService } from '@core/services/orders.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { WCOrder, WCLineItem } from '@core/models';

/**
 * Order Confirmation Page Component
 *
 * Displays order confirmation details after successful checkout:
 * - Order number and status
 * - Order date and time
 * - Items purchased with images and details
 * - Billing and shipping addresses
 * - Payment method information
 * - Order totals (subtotal, tax, shipping, total)
 * - Success animation/icon
 * - Thank you message
 * - Order tracking instructions
 * - Action buttons (View Orders, Continue Shopping)
 * - Loading state
 * - Error handling if order not found
 *
 * @example
 * Route: /order-confirmation/:orderId
 */
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './order-confirmation.component.html'
})
export class OrderConfirmationComponent implements OnInit {
  /** Inject services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  /** Loading state signal */
  public readonly isLoading = signal<boolean>(true);

  /** Order signal */
  public readonly order = signal<WCOrder | null>(null);

  /** Error state signal */
  public readonly hasError = signal<boolean>(false);

  /** Computed: Check if user is authenticated */
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  ngOnInit(): void {
    this.loadOrder();
  }

  /**
   * Load order from route parameter
   */
  private loadOrder(): void {
    const orderIdParam = this.route.snapshot.paramMap.get('orderId');

    if (!orderIdParam) {
      this.handleError('ID de orden no proporcionado');
      return;
    }

    const orderId = parseInt(orderIdParam, 10);

    if (isNaN(orderId)) {
      this.handleError('ID de orden inválido');
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    const authToken = this.authService.authToken();

    this.ordersService.getOrderById(orderId, authToken || undefined).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.handleError(error.message || 'Error al cargar la orden');
      }
    });
  }

  /**
   * Handle error state
   *
   * @param message - Error message to display
   */
  private handleError(message: string): void {
    this.hasError.set(true);
    this.isLoading.set(false);
    this.toastService.error(message, 4000);
  }

  /**
   * Get order number
   *
   * @returns Order number or ID
   */
  getOrderNumber(): string {
    const order = this.order();
    return order?.number || order?.id.toString() || '';
  }

  /**
   * Get formatted order date
   *
   * @returns Formatted date string
   */
  getFormattedDate(): string {
    const order = this.order();
    if (!order) return '';

    const date = new Date(order.date_created);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get order status label
   *
   * @returns Localized status label
   */
  getStatusLabel(): string {
    const status = this.order()?.status;
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'on-hold': 'En Espera',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
      'failed': 'Fallido'
    };
    return statusMap[status || ''] || status || '';
  }

  /**
   * Get order status badge class
   *
   * @returns Badge CSS class
   */
  getStatusBadgeClass(): string {
    const status = this.order()?.status;
    const classMap: Record<string, string> = {
      'pending': 'badge-warning',
      'processing': 'badge-info',
      'on-hold': 'badge-warning',
      'completed': 'badge-success',
      'cancelled': 'badge-error',
      'refunded': 'badge-error',
      'failed': 'badge-error'
    };
    return classMap[status || ''] || 'badge-neutral';
  }

  /**
   * Get line item image URL
   *
   * @param item - Line item
   * @returns Image URL or placeholder
   */
  getItemImage(item: WCLineItem): string {
    return item.image?.src || 'https://via.placeholder.com/100x100?text=Producto';
  }

  /**
   * Format price for display
   *
   * @param price - Price string
   * @returns Formatted price
   */
  formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  /**
   * Get full billing address as formatted string
   *
   * @returns Formatted address
   */
  getFullBillingAddress(): string {
    const order = this.order();
    if (!order) return '';

    const billing = order.billing;
    const parts = [
      billing.address_1,
      billing.address_2,
      billing.city,
      billing.state,
      billing.postcode,
      billing.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Get full shipping address as formatted string
   *
   * @returns Formatted address
   */
  getFullShippingAddress(): string {
    const order = this.order();
    if (!order) return '';

    const shipping = order.shipping;
    const parts = [
      shipping.address_1,
      shipping.address_2,
      shipping.city,
      shipping.state,
      shipping.postcode,
      shipping.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Navigate to orders page
   */
  goToOrders(): void {
    this.router.navigate(['/account/orders']);
  }

  /**
   * Navigate to products page
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Retry loading the order
   */
  retryLoad(): void {
    this.loadOrder();
  }

  /**
   * Navigate to home
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }
}
