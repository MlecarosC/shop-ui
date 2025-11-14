import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordResetService } from '@core/services/password-reset.service';
import { ToastService } from '@shared/services/toast.service';
import { CustomValidators } from '@shared/validators';

/**
 * Password Reset Step
 * Tracks the current step in the password reset flow
 */
type ResetStep = 1 | 2 | 3;

/**
 * Forgot Password Component
 *
 * Provides password reset functionality with a three-step flow:
 * 1. Enter email address
 * 2. Enter verification code received via email
 * 3. Set new password
 *
 * Features:
 * - Multi-step form with validation
 * - Loading state for each step
 * - Safe error messages that don't reveal if email exists
 * - Password strength indicator
 * - Navigation between steps
 *
 * @example
 * ```html
 * <app-forgot-password />
 * ```
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  /** Inject services using inject() function */
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly passwordResetService = inject(PasswordResetService);
  private readonly toastService = inject(ToastService);

  /** Signal for current step */
  public readonly currentStep = signal<ResetStep>(1);

  /** Signal for loading state */
  public readonly isLoading = signal<boolean>(false);

  /** Signals for password visibility toggle */
  public readonly showPassword = signal<boolean>(false);
  public readonly showConfirmPassword = signal<boolean>(false);

  /** Email stored from step 1 */
  public readonly userEmail = signal<string>('');

  /** Step 1 Form: Email */
  public readonly emailForm: FormGroup;

  /** Step 2 Form: Verification Code */
  public readonly codeForm: FormGroup;

  /** Step 3 Form: New Password */
  public readonly passwordForm: FormGroup;

  constructor() {
    // Initialize Step 1 form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Initialize Step 2 form
    this.codeForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10)
        ]
      ]
    });

    // Initialize Step 3 form
    this.passwordForm = this.fb.group({
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
    this.passwordForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Clear any previous reset state
    this.passwordResetService.clearResetState();
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.passwordResetService.clearResetState();
  }

  /**
   * Handle Step 1: Request password reset code
   */
  onSubmitEmail(): void {
    this.emailForm.markAllAsTouched();

    if (this.emailForm.invalid) {
      this.toastService.error('Please enter a valid email address');
      return;
    }

    const email = this.emailForm.value.email;
    this.isLoading.set(true);

    this.passwordResetService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.userEmail.set(email);

        // Safe message that doesn't reveal if email exists
        this.toastService.success('If this email is registered, you will receive a reset code shortly.');

        // Move to step 2
        this.currentStep.set(2);
      },
      error: (error) => {
        this.isLoading.set(false);

        // Safe error message
        this.toastService.info('If this email is registered, you will receive a reset code shortly.');

        // Still move to step 2 for security (don't reveal if email exists)
        this.userEmail.set(email);
        this.currentStep.set(2);
      }
    });
  }

  /**
   * Handle Step 2: Validate reset code
   */
  onSubmitCode(): void {
    this.codeForm.markAllAsTouched();

    if (this.codeForm.invalid) {
      this.toastService.error('Please enter the verification code');
      return;
    }

    const code = this.codeForm.value.code;
    const email = this.userEmail();

    if (!email) {
      this.toastService.error('Session expired. Please start over.');
      this.resetToStep1();
      return;
    }

    this.isLoading.set(true);

    this.passwordResetService.validateCode(email, code).subscribe({
      next: (isValid) => {
        this.isLoading.set(false);

        if (isValid) {
          this.toastService.success('Code verified! Please enter your new password.');
          this.currentStep.set(3);
        } else {
          this.toastService.error('Invalid or expired code. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.toastService.error('Invalid or expired code. Please try again.');
      }
    });
  }

  /**
   * Handle Step 3: Set new password
   */
  onSubmitPassword(): void {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    const { password } = this.passwordForm.value;
    const code = this.codeForm.value.code;
    const email = this.userEmail();

    if (!email || !code) {
      this.toastService.error('Session expired. Please start over.');
      this.resetToStep1();
      return;
    }

    this.isLoading.set(true);

    this.passwordResetService.setNewPassword(email, code, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastService.success('Password reset successful! You can now log in with your new password.');

        // Navigate to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);

        const errorMessage = error.message || 'Failed to reset password. Please try again.';
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Go back to previous step
   */
  goToPreviousStep(): void {
    const current = this.currentStep();

    if (current === 2) {
      this.currentStep.set(1);
      this.codeForm.reset();
    } else if (current === 3) {
      this.currentStep.set(2);
      this.passwordForm.reset();
    }
  }

  /**
   * Reset to step 1 and clear all forms
   */
  resetToStep1(): void {
    this.currentStep.set(1);
    this.userEmail.set('');
    this.emailForm.reset();
    this.codeForm.reset();
    this.passwordForm.reset();
    this.passwordResetService.clearResetState();
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
   * @param form - The form group
   * @param fieldName - Name of the form field
   * @returns Error message or null
   */
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    return CustomValidators.getErrorMessage(control, this.getFieldDisplayName(fieldName));
  }

  /**
   * Check if a field has an error and has been touched
   *
   * @param form - The form group
   * @param fieldName - Name of the form field
   * @returns True if field has error and is touched
   */
  hasFieldError(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
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
      code: 'Verification code',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Get password strength indicator
   *
   * @returns Password strength level
   */
  getPasswordStrength(): 'weak' | 'medium' | 'strong' | null {
    const passwordControl = this.passwordForm.get('password');

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
