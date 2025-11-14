import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '@core/services/cart.service';
import { OrdersService } from '@core/services/orders.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { CustomValidators } from '@shared/validators';
import { WCCartItem, WCCreateOrderRequest, WCAddress } from '@core/models';

/**
 * Checkout Page Component
 *
 * Handles the checkout process including:
 * - Billing and shipping information form
 * - Payment method selection
 * - Order summary display
 * - Order creation and processing
 * - Terms and conditions acceptance
 *
 * @example
 * Route: /checkout (requires authentication via authGuard)
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  /** Inject services */
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  /** Checkout form */
  public checkoutForm!: FormGroup;

  /** Loading state signal */
  public readonly isProcessing = signal<boolean>(false);

  /** Cart items signal */
  public readonly cartItems = computed(() => this.cartService.cartItems());

  /** Cart totals computed signals */
  public readonly subtotal = computed(() => {
    const cart = this.cartService.cart();
    return cart?.totals?.subtotal || '0';
  });

  public readonly total = computed(() => {
    const cart = this.cartService.cart();
    return cart?.totals?.total || '0';
  });

  public readonly cartItemCount = computed(() => this.cartService.cartItemCount());

  public readonly isCartEmpty = computed(() => this.cartService.cartIsEmpty());

  /** Available countries */
  public readonly countries = [
    { code: 'CL', name: 'Chile' },
    { code: 'AR', name: 'Argentina' },
    { code: 'PE', name: 'Perú' },
    { code: 'CO', name: 'Colombia' },
    { code: 'MX', name: 'México' }
  ];

  /** Available payment methods */
  public readonly paymentMethods = [
    { id: 'mercadopago', name: 'Mercado Pago', description: 'Paga con tarjeta de crédito o débito' },
    { id: 'transbank', name: 'Transbank', description: 'Webpay Plus' },
    { id: 'facto', name: 'Facto', description: 'Transferencia bancaria' }
  ];

  /**
   * Component initialization
   * Initializes the checkout form and validates user authentication
   */
  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Debes iniciar sesión para realizar una compra', 4000);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Check cart is not empty
    if (this.isCartEmpty()) {
      this.toastService.warning('Tu carrito está vacío', 3000);
      this.router.navigate(['/products']);
      return;
    }

    this.initializeForm();
    this.prefillUserData();
  }

  /**
   * Initialize checkout form with validators
   */
  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      // Billing Information
      firstName: ['', [Validators.required, CustomValidators.latinCharacters()]],
      lastName: ['', [Validators.required, CustomValidators.latinCharacters()]],
      email: ['', [Validators.required, CustomValidators.email()]],
      phone: ['', [Validators.required, Validators.minLength(9)]],

      // Address Information
      address_1: ['', [Validators.required, Validators.minLength(5)]],
      address_2: [''],
      city: ['', [Validators.required, CustomValidators.latinCharacters()]],
      state: ['', [Validators.required]],
      country: ['CL', [Validators.required]],
      postcode: ['', [Validators.required]],

      // Payment Method
      paymentMethod: ['mercadopago', [Validators.required]],

      // Terms and Conditions
      termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  /**
   * Prefill form with current user data if available
   */
  private prefillUserData(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.checkoutForm.patchValue({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        address_1: user.billing?.address_1 || '',
        address_2: user.billing?.address_2 || '',
        city: user.billing?.city || '',
        state: user.billing?.state || '',
        country: user.billing?.country || 'CL',
        postcode: user.billing?.postcode || '',
        phone: user.billing?.phone || ''
      });
    }
  }

  /**
   * Process the order
   * Validates form, creates order, and redirects to confirmation
   */
  processOrder(): void {
    // Validate form
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.toastService.error('Por favor completa todos los campos requeridos', 4000);
      this.scrollToFirstError();
      return;
    }

    // Verify user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Debes iniciar sesión para continuar', 4000);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Verify cart is not empty
    if (this.isCartEmpty()) {
      this.toastService.error('Tu carrito está vacío', 3000);
      this.router.navigate(['/products']);
      return;
    }

    this.isProcessing.set(true);

    const formValue = this.checkoutForm.value;
    const user = this.authService.currentUser();
    const authToken = this.authService.authToken();

    // Build billing address
    const billingAddress: WCAddress = {
      first_name: formValue.firstName,
      last_name: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      address_1: formValue.address_1,
      address_2: formValue.address_2 || '',
      city: formValue.city,
      state: formValue.state,
      postcode: formValue.postcode,
      country: formValue.country
    };

    // Build shipping address (same as billing for now)
    const shippingAddress: WCAddress = { ...billingAddress };

    // Build line items from cart
    const lineItems = this.cartItems().map((item: WCCartItem) => ({
      product_id: item.id,
      quantity: item.quantity.value,
      variation_id: item.variation_id || undefined
    }));

    // Get payment method details
    const selectedPaymentMethod = this.paymentMethods.find(
      pm => pm.id === formValue.paymentMethod
    );

    // Build order request
    const orderRequest: WCCreateOrderRequest = {
      payment_method: formValue.paymentMethod,
      payment_method_title: selectedPaymentMethod?.name || formValue.paymentMethod,
      billing: billingAddress,
      shipping: shippingAddress,
      line_items: lineItems,
      customer_id: user?.id,
      set_paid: false
    };

    // Create order
    this.ordersService.createOrder(orderRequest, authToken || undefined).subscribe({
      next: (order) => {
        this.toastService.success('Pedido creado exitosamente', 3000);

        // Clear cart after successful order
        this.cartService.clearCart().subscribe({
          next: () => {
            console.log('Cart cleared successfully');
          },
          error: (error) => {
            console.error('Error clearing cart:', error);
          }
        });

        // Redirect to order confirmation page
        this.router.navigate(['/order-confirmation', order.id]);
        this.isProcessing.set(false);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.toastService.error(
          this.getSafeErrorMessage(error),
          5000
        );
        this.isProcessing.set(false);
      }
    });
  }

  /**
   * Get safe error message from error object
   *
   * @param error - Error object
   * @returns Safe error message
   */
  private getSafeErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    return 'Error al procesar el pedido. Por favor, intenta nuevamente.';
  }

  /**
   * Mark all form controls as touched to show validation errors
   *
   * @param formGroup - Form group to mark
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Scroll to first form error
   */
  private scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.form-control.error, .input-error');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Get form control error message
   *
   * @param controlName - Form control name
   * @param fieldName - Display name for field
   * @returns Error message or null
   */
  getErrorMessage(controlName: string, fieldName: string): string | null {
    const control = this.checkoutForm.get(controlName);
    return CustomValidators.getErrorMessage(control, fieldName);
  }

  /**
   * Check if form control has error and is touched
   *
   * @param controlName - Form control name
   * @returns Boolean indicating if control has visible error
   */
  hasError(controlName: string): boolean {
    const control = this.checkoutForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Format price for display
   *
   * @param price - Price string
   * @returns Formatted price
   */
  formatPrice(price: string): string {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  /**
   * Get item total price
   *
   * @param item - Cart item
   * @returns Total price for item
   */
  getItemTotal(item: WCCartItem): string {
    const price = parseFloat(item.totals.total);
    return isNaN(price) ? '0.00' : price.toFixed(2);
  }
}
