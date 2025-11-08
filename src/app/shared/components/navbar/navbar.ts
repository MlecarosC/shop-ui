import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private authService = inject(AuthApiService);
  private router = inject(Router);

  readonly menuItems = [
    { label: 'Home', route: '/home' },
    { label: 'Products', route: '/products' },
    { label: 'About Us', route: '/about-us' },
    { label: 'Blog', route: '/blog' },
  ];

  isAuthenticated = computed(() => this.authService.getIsAuthenticatedSignal()());

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

  logout(): void {
    this.authService.logout();
    this.closeMenuDrawer();
    this.router.navigate(['/home']);
  }
}
