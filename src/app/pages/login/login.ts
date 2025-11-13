import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { RateLimiterService } from '../../core/services/rate-limiter.service';
import { validateRedirectUrl } from '../../core/utils/security.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthApiService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private rateLimiter = inject(RateLimiterService);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    // Rate limiting: Max 5 login attempts per 15 minutes
    const maxAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    if (!this.rateLimiter.isAllowed('login', maxAttempts, windowMs)) {
      const waitTime = this.rateLimiter.getTimeUntilReset('login', maxAttempts, windowMs);
      const minutes = Math.ceil(waitTime / 60000);
      this.errorMessage.set(`Demasiados intentos. Intenta de nuevo en ${minutes} minuto(s).`);
      this.toastService.warning(`Demasiados intentos. Espera ${minutes} minuto(s).`);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        // Reset rate limiter on successful login
        this.rateLimiter.reset('login');

        this.toastService.success('¡Bienvenido! Has iniciado sesión correctamente');

        // Validate redirect URL to prevent open redirect attacks
        const storedRedirectUrl = localStorage.getItem('redirect_url');
        const redirectUrl = validateRedirectUrl(storedRedirectUrl);
        localStorage.removeItem('redirect_url');

        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 403 || error.status === 401) {
          this.errorMessage.set('Usuario o contraseña incorrectos');
        } else if (error.error?.code === 'invalid_username' || 
                   error.error?.code === 'invalid_email' ||
                   error.error?.code === 'incorrect_password') {
          this.errorMessage.set('Usuario o contraseña incorrectos');
        } else if (error.error?.message && error.error.message.includes('password')) {
          this.errorMessage.set('Usuario o contraseña incorrectos');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Por favor, intenta de nuevo.');
        }
      }
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
