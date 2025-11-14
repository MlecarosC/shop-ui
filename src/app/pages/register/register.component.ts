import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services';
import { ToastService } from '@shared/services/toast.service';
import { CustomValidators } from '@shared/validators';
import { WCRegistrationRequest } from '@core/models';

/**
 * Register Component
 *
 * Provides user registration functionality with:
 * - Reactive form with comprehensive validation
 * - First name, last name, email, password, and confirm password fields
 * - Custom validators for Latin characters and password strength
 * - Loading state during registration
 * - Error handling with safe error messages
 * - Auto-login after successful registration
 * - Link to login page
 *
 * @example
 * ```html
 * <app-register />
 * ```
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  /** Inject services using inject() function */
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  /** Signal for loading state */
  public readonly isLoading = signal<boolean>(false);

  /** Signals for password visibility toggle */
  public readonly showPassword = signal<boolean>(false);
  public readonly showConfirmPassword = signal<boolean>(false);

  /** Registration form */
  public readonly registerForm: FormGroup;

  constructor() {
    // Initialize form with validators
    this.registerForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.latinCharacters()
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.latinCharacters()
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          CustomValidators.passwordStrength()
        ]
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          CustomValidators.matchPassword('password')
        ]
      ]
    });

    // Re-validate confirmPassword when password changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Redirect if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Handle form submission
   * Registers user and auto-login on success
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.registerForm.value;

    // Create username from email (before @ symbol)
    const username = formValue.email.split('@')[0];

    // Prepare registration data
    const registrationData: WCRegistrationRequest = {
      username: username,
      email: formValue.email,
      password: formValue.password,
      first_name: formValue.firstName,
      last_name: formValue.lastName
    };

    this.isLoading.set(true);

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastService.success('Registration successful! Welcome to our store.');

        // The AuthService automatically logs in the user after registration
        // Navigate to home after a short delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading.set(false);

        // Safe error message
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
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  /**
   * Get error message for a form field
   *
   * @param fieldName - Name of the form field
   * @returns Error message or null
   */
  getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    return CustomValidators.getErrorMessage(control, this.getFieldDisplayName(fieldName));
  }

  /**
   * Check if a field has an error and has been touched
   *
   * @param fieldName - Name of the form field
   * @returns True if field has error and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
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
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
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
    const errorMessage = error.message || '';

    // Check for common registration errors
    if (errorMessage.includes('email') || errorMessage.includes('exists')) {
      return 'This email is already registered. Please try logging in or use a different email.';
    }

    if (errorMessage.includes('username')) {
      return 'An account with this information already exists. Please try logging in.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'A network error occurred. Please check your connection and try again.';
    }

    if (errorMessage.includes('server')) {
      return 'A server error occurred. Please try again later.';
    }

    // Default safe message
    return 'Registration failed. Please check your information and try again.';
  }

  /**
   * Get password strength indicator
   *
   * @returns Password strength level
   */
  getPasswordStrength(): 'weak' | 'medium' | 'strong' | null {
    const passwordControl = this.registerForm.get('password');

    if (!passwordControl?.value) {
      return null;
    }

    const value = passwordControl.value;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    let strengthScore = 0;
    if (value.length >= 8) strengthScore++;
    if (value.length >= 12) strengthScore++;
    if (hasUppercase) strengthScore++;
    if (hasLowercase) strengthScore++;
    if (hasNumber) strengthScore++;
    if (hasSpecialChar) strengthScore++;

    if (strengthScore <= 2) return 'weak';
    if (strengthScore <= 4) return 'medium';
    return 'strong';
  }
}
