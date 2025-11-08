import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthApiService } from '../../core/services/auth-api.service';

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

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        const redirectUrl = localStorage.getItem('redirect_url') || '/home';
        localStorage.removeItem('redirect_url');
        
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else if (error.status === 403) {
          this.errorMessage.set('Usuario o contraseña incorrectos');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Por favor, intenta de nuevo.');
        }
        
        console.error('Login error:', error);
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
