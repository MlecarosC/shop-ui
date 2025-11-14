import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, AuthService } from '@core/services';

/**
 * Navbar Component
 *
 * Componente de navegación principal que incluye:
 * - Logo y enlaces de navegación
 * - Contador de items en el carrito
 * - Autenticación de usuario (login/logout)
 * - Menú responsive con hamburger menu para mobile
 *
 * @example
 * ```html
 * <app-navbar />
 * ```
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  /** Inject services using inject() function */
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  /** Signal para controlar el estado del menú mobile */
  public readonly isMobileMenuOpen = signal<boolean>(false);

  /** Computed signals desde los servicios */
  public readonly cartItemCount = this.cartService.cartItemCount;
  public readonly isAuthenticated = this.authService.isAuthenticated;
  public readonly currentUser = this.authService.currentUser;

  /**
   * Toggle del menú mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  /**
   * Cerrar el menú mobile
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
