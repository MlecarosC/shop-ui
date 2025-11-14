import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

/**
 * Error Interceptor - Maneja errores HTTP globalmente
 *
 * Este interceptor:
 * - Captura errores HTTP de todas las peticiones
 * - Maneja errores de autenticación (401, 403)
 * - Cierra sesión automáticamente si el token expira
 * - Proporciona mensajes de error seguros (sin exponer detalles internos)
 * - Redirige al login cuando es necesario
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error. Por favor, intenta nuevamente.';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        console.error('Error del cliente:', error.error.message);
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else {
        // Error del lado del servidor
        const status = error.status;
        const errorCode = error.error?.code;

        switch (status) {
          case 401:
            // No autorizado - Token inválido o expirado
            if (isJWTError(errorCode)) {
              console.warn('Token JWT inválido o expirado');
              authService.logout();
              router.navigate(['/login']);
              errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            } else {
              errorMessage = 'Las credenciales ingresadas no son correctas.';
            }
            break;

          case 403:
            // Prohibido - Sin permisos
            console.warn('Acceso prohibido:', errorCode);
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;

          case 404:
            // No encontrado
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;

          case 422:
            // Error de validación
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Los datos ingresados no son válidos.';
            }
            break;

          case 429:
            // Demasiadas peticiones
            errorMessage = 'Demasiadas peticiones. Por favor, espera un momento.';
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            // Errores del servidor
            errorMessage = 'El servidor no está disponible. Por favor, intenta más tarde.';
            break;

          default:
            // Otros errores
            if (error.error?.message) {
              // Si el backend proporciona un mensaje, usarlo (pero sanitizado)
              errorMessage = sanitizeErrorMessage(error.error.message);
            }
        }

        // Log del error completo en consola para debugging (solo en desarrollo)
        if (typeof window !== 'undefined' && !window.location.hostname.includes('reblives.com')) {
          console.error('Error HTTP:', {
            status,
            statusText: error.statusText,
            errorCode,
            url: error.url,
            message: error.error?.message
          });
        }
      }

      // Retornar un observable con el error
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error
      }));
    })
  );
};

/**
 * Verifica si el código de error es relacionado con JWT
 */
function isJWTError(code: string | undefined): boolean {
  if (!code) return false;

  const jwtErrorCodes = [
    'jwt_auth_invalid_token',
    'jwt_auth_bad_auth_header',
    'jwt_auth_bad_iss',
    'jwt_auth_bad_request',
    'jwt_auth_expired_token',
    'jwt_auth_no_auth_header'
  ];

  return jwtErrorCodes.includes(code);
}

/**
 * Sanitiza mensajes de error para evitar exponer información sensible
 */
function sanitizeErrorMessage(message: string): string {
  // Remover rutas de archivos del servidor
  message = message.replace(/\/[^\s]+\.(php|js|py|java)/gi, '[archivo del servidor]');

  // Remover información de base de datos
  message = message.replace(/SQL|Database|Query|Table|Column/gi, '[información de base de datos]');

  // Remover stack traces
  message = message.replace(/at\s+[\w.]+\s+\([^)]+\)/gi, '');

  // Limitar longitud del mensaje
  if (message.length > 200) {
    message = message.substring(0, 200) + '...';
  }

  return message.trim();
}
