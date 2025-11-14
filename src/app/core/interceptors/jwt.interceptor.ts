import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/**
 * JWT Interceptor - Agrega el token JWT a las peticiones HTTP
 *
 * Este interceptor:
 * - Agrega el header Authorization con el token JWT a todas las peticiones que lo requieran
 * - Solo agrega el token a peticiones a la API de WordPress/WooCommerce
 * - No interfiere con peticiones a otros dominios
 *
 * El token se obtiene del AuthService (signal)
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.authToken();

  // Si no hay token, continuar sin modificar la petición
  if (!token) {
    return next(req);
  }

  // Solo agregar el token a peticiones a la API de WordPress/WooCommerce
  // Esto evita enviar el token a APIs externas
  const isApiUrl = req.url.includes('/wp-json/');

  if (!isApiUrl) {
    return next(req);
  }

  // Clonar la petición y agregar el header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
