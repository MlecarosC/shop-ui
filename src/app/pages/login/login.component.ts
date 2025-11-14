import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services';
import { ToastService } from '@shared/services/toast.service';
import { CustomValidators } from '@shared/validators';

/**
 * Login Component
 *
 * Provides user authentication functionality with:
 * - Reactive form with email and password validation
 * - Loading state during authentication
 * - Error handling with safe error messages
 * - Redirect after successful login
 * - Links to registration and password reset
 *
 * @example
 * ```html
 * <app-login />
 * ```
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  /** Inject services using inject() function */
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  /** Signal for loading state */
  public readonly isLoading = signal<boolean>(false);

  /** Signal for password visibility toggle */
  public readonly showPassword = signal<boolean>(false);

  /** Login form */
  public readonly loginForm: FormGroup;

  /** Redirect URL after successful login */
  private redirectUrl: string = '/home';

  constructor() {
    // Initialize form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    // Get redirect URL from query params
    this.route.queryParams.subscribe(params => {
      if (params['redirect_url']) {
        this.redirectUrl = params['redirect_url'];
      }
    });
  }

  /**
   * Handle form submission
   * Authenticates user and redirects on success
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.isLoading.set(true);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastService.success('Login successful! Welcome back.');

        // Navigate to redirect URL or home
        setTimeout(() => {
          this.router.navigate([this.redirectUrl]);
        }, 500);
      },
      error: (error) => {
        this.isLoading.set(false);

        // Safe error message - don't reveal if user exists or not
        const errorMessage = this.getSafeErrorMessage(error);
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  /**
   * Get error message for a form field
   *
   * @param fieldName - Name of the form field
   * @returns Error message or null
   */
  getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    return CustomValidators.getErrorMessage(control, this.getFieldDisplayName(fieldName));
  }

  /**
   * Check if a field has an error and has been touched
   *
   * @param fieldName - Name of the form field
   * @returns True if field has error and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get display name for a field
   *
   * @param fieldName - Form field name
   * @returns Display name
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      email: 'Email',
      password: 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Get safe error message that doesn't reveal sensitive information
   *
   * @param error - Error object
   * @returns Safe error message for display
   */
  private getSafeErrorMessage(error: any): string {
    // Don't reveal whether the email exists or not
    // Use generic message for authentication failures
    if (error.message) {
      // If it's already a safe message from the service, use it
      if (error.message.includes('Invalid credentials') ||
          error.message.includes('network error') ||
          error.message.includes('server error')) {
        return error.message;
      }
    }

    // Default safe message
    return 'Invalid email or password. Please try again.';
  }
}
