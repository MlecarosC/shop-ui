import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { CartApiService } from '../../../core/services/cart-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CurrencyPipe],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Navbar {
  private authService = inject(AuthApiService);
  private cartService = inject(CartApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly menuItems = [
    { label: 'Home', route: '/home' },
    { label: 'Products', route: '/products' },
    { label: 'About Us', route: '/about-us' },
    { label: 'Blog', route: '/blog' },
    { label: 'Contact', route: '/contact' },
  ];

  isAuthenticated = computed(() => this.authService.getIsAuthenticatedSignal()());
  cart = this.cartService.getCartSignal();
  removingItems = signal<Set<string>>(new Set());
  isClearing = signal(false);

  cartItemCount = computed(() => {
    return this.cart()?.item_count || 0;
  });

  isRemoving(itemKey: string): boolean {
    return this.removingItems().has(itemKey);
  }

  closeMenuDrawer(): void {
    const drawer = document.getElementById('menu-drawer') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }

  closeCartDrawer(): void {
    const drawer = document.getElementById('cart-drawer') as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }

  removeItem(itemKey: string): void {
    this.removingItems.update(items => {
      const newSet = new Set(items);
      newSet.add(itemKey);
      return newSet;
    });

    this.cartService.removeCartItem(itemKey).subscribe({
      next: () => {
        this.removingItems.update(items => {
          const newSet = new Set(items);
          newSet.delete(itemKey);
          return newSet;
        });
        this.toastService.success('Producto eliminado del carrito');
      },
      error: (error) => {
        this.removingItems.update(items => {
          const newSet = new Set(items);
          newSet.delete(itemKey);
          return newSet;
        });
        console.error('Error removing item:', error);
        this.toastService.error('Error al eliminar el producto. Intenta de nuevo.');
      }
    });
  }

  clearCart(): void {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      return;
    }

    this.isClearing.set(true);

    this.cartService.clearCart().subscribe({
      next: () => {
        this.isClearing.set(false);
        this.toastService.success('Carrito vaciado correctamente');
      },
      error: (error) => {
        this.isClearing.set(false);
        console.error('Error clearing cart:', error);
        this.toastService.error('Error al vaciar el carrito. Intenta de nuevo.');
      }
    });
  }

  goToCheckout(): void {
    this.closeCartDrawer();
    this.router.navigate(['/checkout']);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenuDrawer();

    this.toastService.info('Has cerrado sesión correctamente');
    
    this.router.navigate(['/home']);
  }
}
