import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthApiService } from '../../core/services/auth-api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthApiService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2), this.nameValidator]],
      last_name: ['', [Validators.required, Validators.minLength(2), this.nameValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    
    if (!nameRegex.test(control.value)) {
      return { invalidName: true };
    }
    
    return null;
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

  generateUsername(email: string): string {
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseUsername}${randomSuffix}`;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, first_name, last_name } = this.registerForm.value;
    const username = this.generateUsername(email);

    this.authService.register({ username, email, password, first_name, last_name }).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.toastService.success('¡Cuenta creada exitosamente! Bienvenido');
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.error?.code === 'registration-error-username-exists') {
          const newUsername = this.generateUsername(email);
          this.retryWithNewUsername(newUsername, email, password, first_name, last_name);
        } else if (error.error?.code === 'registration-error-email-exists') {
          this.errorMessage.set('Este email ya está registrado. ¿Deseas iniciar sesión?');
        } else if (error.error?.message) {
          const cleanMessage = error.error.message
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          this.errorMessage.set(cleanMessage);
        } else {
          this.errorMessage.set('Error al registrar. Por favor, intenta de nuevo.');
        }
        
        console.error('Register error:', error);
      }
    });
  }

  retryWithNewUsername(username: string, email: string, password: string, first_name: string, last_name: string): void {
    this.authService.register({ username, email, password, first_name, last_name }).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.toastService.success('¡Cuenta creada exitosamente! Bienvenido');
        
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar. Por favor, intenta de nuevo.');
        console.error('Retry register error:', error);
      }
    });
  }

  get email() {
    return this.registerForm.get('email');
  }

  get first_name() {
    return this.registerForm.get('first_name');
  }

  get last_name() {
    return this.registerForm.get('last_name');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
