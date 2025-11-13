import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CartApiService } from '../../core/services/cart-api.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { GeoDataService, Country } from '../../core/services/geo-data.service';
import { PaymentService, OrderData } from '../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartApiService);
  private authService = inject(AuthApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private geoDataService = inject(GeoDataService);
  private paymentService = inject(PaymentService);

  checkoutForm!: FormGroup;
  isProcessing = signal(false);

  cart = this.cartService.getCartSignal();
  currentUser = this.authService.getCurrentUserSignal();
  isAuthenticated = computed(() => this.authService.getIsAuthenticatedSignal()());

  // Geo data
  countries: Country[] = [];

  canProcessOrder = computed(() => {
    return this.checkoutForm?.valid &&
           this.isAuthenticated() &&
           !this.isProcessing() &&
           (this.cart()?.items?.length || 0) > 0;
  });

  constructor() {
    // Watch for user authentication changes and auto-fill billing data
    effect(() => {
      const user = this.currentUser();
      if (user && this.checkoutForm) {
        this.loadUserData();
      }
    });
  }

  ngOnInit(): void {
    this.countries = this.geoDataService.getCountries();
    this.initializeForm();
    this.loadUserData();
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      country: ['', [Validators.required]],
      address_1: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]]
    });
  }


  private loadUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.checkoutForm.patchValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.billing?.phone || '',
        country: user.billing?.country || 'CL',
        address_1: user.billing?.address_1 || '',
        city: user.billing?.city || '',
        state: user.billing?.state || ''
      }, { emitEvent: false });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  processOrder(): void {
    if (!this.canProcessOrder()) {
      this.markAllFieldsAsTouched();

      if (!this.isAuthenticated()) {
        this.toastService.warning('Debes iniciar sesión para procesar el pago');
        return;
      }

      if (!this.checkoutForm.valid) {
        this.toastService.warning('Por favor completa todos los campos requeridos');
        return;
      }

      return;
    }

    const paymentMethod = this.checkoutForm.get('paymentMethod')?.value;

    this.isProcessing.set(true);

    // Prepare order data
    const orderData: OrderData = {
      billing: {
        first_name: this.checkoutForm.get('first_name')?.value,
        last_name: this.checkoutForm.get('last_name')?.value,
        email: this.checkoutForm.get('email')?.value,
        phone: this.checkoutForm.get('phone')?.value,
        country: this.checkoutForm.get('country')?.value,
        address_1: this.checkoutForm.get('address_1')?.value,
        city: this.checkoutForm.get('city')?.value,
        state: this.checkoutForm.get('state')?.value
      },
      payment_method: paymentMethod,
      payment_method_title: this.getPaymentMethodTitle(paymentMethod),
      set_paid: false
    };

    // Process payment
    this.paymentService.processPayment(paymentMethod, orderData).subscribe({
      next: (response) => {
        this.isProcessing.set(false);

        // Redirect to payment gateway
        if (response.redirect_url) {
          this.toastService.success('Redirigiendo al procesador de pagos...');

          // Redirect to external payment page
          window.location.href = response.redirect_url;
        } else {
          this.toastService.error('No se pudo obtener la URL de pago');
        }
      },
      error: (error) => {
        this.isProcessing.set(false);

        console.error('Payment processing error:', error);

        if (error.status === 400) {
          this.toastService.error('Error en los datos de pago. Verifica la información.');
        } else if (error.status === 401 || error.status === 403) {
          this.toastService.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login'], { queryParams: { returnTo: 'checkout' } });
        } else {
          this.toastService.error('Error al procesar el pago. Por favor, intenta de nuevo.');
        }
      }
    });
  }

  private getPaymentMethodTitle(method: string): string {
    const titles: Record<string, string> = {
      mercadopago: 'Mercado Pago',
      transbank: 'Transbank Webpay Plus',
      facto: 'FACTO'
    };
    return titles[method] || method;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }
}
