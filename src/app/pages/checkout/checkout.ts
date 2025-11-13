import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CartApiService } from '../../core/services/cart-api.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ToastService } from '../../shared/services/toast.service';

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

  checkoutForm!: FormGroup;
  isProcessing = signal(false);
  
  cart = this.cartService.getCartSignal();
  currentUser = this.authService.getCurrentUserSignal();
  isAuthenticated = computed(() => this.authService.getIsAuthenticatedSignal()());

  canProcessOrder = computed(() => {
    return this.checkoutForm?.valid && 
           this.isAuthenticated() && 
           !this.isProcessing() &&
           (this.cart()?.items?.length || 0) > 0;
  });

  ngOnInit(): void {
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
      paymentMethod: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
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
      });
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

    this.isProcessing.set(true);

    // TODO: Aquí se integrarán los métodos de pago
    // Por ahora solo simulamos el proceso
    const paymentMethod = this.checkoutForm.get('paymentMethod')?.value;

    // Security: Do not log sensitive billing information
    // In production, send this data securely to the backend

    // Simulación de procesamiento
    setTimeout(() => {
      this.isProcessing.set(false);
      
      switch (paymentMethod) {
        case 'mercadopago':
          this.toastService.info('Redirigiendo a Mercado Pago... (Funcionalidad pendiente)');
          break;
        case 'transbank':
          this.toastService.info('Redirigiendo a Webpay... (Funcionalidad pendiente)');
          break;
        case 'facto':
          this.toastService.info('Procesando con FACTO... (Funcionalidad pendiente)');
          break;
      }

      // TODO: Aquí se redirigirá a la página de confirmación cuando esté lista
      // this.router.navigate(['/order-confirmation']);
    }, 2000);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }
}
