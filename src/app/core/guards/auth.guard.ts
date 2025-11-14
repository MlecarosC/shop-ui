import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Auth Guard - Protege rutas que requieren autenticación
 *
 * Si el usuario no está autenticado:
 * - Guarda la URL solicitada en localStorage
 * - Redirige al login
 * - Después del login, el usuario será redirigido a la URL original
 *
 * Uso en rutas:
 * ```typescript
 * {
 *   path: 'profile',
 *   component: ProfileComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado usando el signal
  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL solicitada para redirigir después del login
  localStorage.setItem('redirect_url', state.url);

  // Redirigir al login
  return router.createUrlTree(['/login']);
};
