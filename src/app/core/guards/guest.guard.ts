import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Guest Guard - Protege rutas que solo deben ser accesibles por usuarios NO autenticados
 *
 * Si el usuario YA está autenticado:
 * - Redirige al home
 *
 * Casos de uso:
 * - Página de login (usuarios autenticados no necesitan login)
 * - Página de registro (usuarios autenticados ya tienen cuenta)
 * - Página de recuperación de contraseña
 *
 * Uso en rutas:
 * ```typescript
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 * ```
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario NO está autenticado, permitir acceso
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si el usuario YA está autenticado, redirigir al home
  return router.createUrlTree(['/home']);
};
