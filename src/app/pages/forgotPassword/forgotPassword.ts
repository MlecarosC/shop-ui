import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { PasswordResetService } from '../../core/services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgotPassword.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);
  private router = inject(Router);

  step = signal<'email' | 'code' | 'success'>('email');
  
  emailForm: FormGroup;
  codeForm: FormGroup;
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  userEmail = signal<string>('');

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    if (!/[A-Z]/.test(password)) {
      errors['noUpperCase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['noLowerCase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.get('email')?.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const email = this.emailForm.value.email;
    this.userEmail.set(email);

    this.passwordResetService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.step.set('code');
      },
      error: (error) => {
        this.isLoading.set(false);

        // Security: Don't reveal if email exists or not
        // Always show the same generic message
        this.step.set('code');
        this.errorMessage.set(null);
      }
    });
  }

  onSubmitCode(): void {
    if (this.codeForm.invalid) {
      Object.keys(this.codeForm.controls).forEach(key => {
        this.codeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { code, password } = this.codeForm.value;
    const email = this.userEmail();

    this.passwordResetService.setNewPassword(email, code, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.step.set('success');
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else if (error.error?.code === 'bad_request') {
          this.errorMessage.set('El código ingresado no es válido o ha expirado');
        } else {
          this.errorMessage.set('Error al restablecer la contraseña. Por favor, intenta de nuevo.');
        }
      }
    });
  }

  resendCode(): void {
    this.step.set('email');
    this.codeForm.reset();
    this.errorMessage.set(null);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get email() {
    return this.emailForm.get('email');
  }

  get code() {
    return this.codeForm.get('code');
  }

  get password() {
    return this.codeForm.get('password');
  }

  get confirmPassword() {
    return this.codeForm.get('confirmPassword');
  }
}