import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

/**
 * SECURITY WARNING: WooCommerce Interceptor
 *
 * This interceptor adds WooCommerce consumer credentials to API requests.
 * While environment files are gitignored, exposing these credentials in the frontend
 * is NOT recommended for production environments.
 *
 * RECOMMENDED APPROACH:
 * - Move all WooCommerce API calls to a backend proxy/BFF (Backend-for-Frontend)
 * - Backend should securely store credentials and make WooCommerce API calls
 * - Frontend should only communicate with your backend, never directly with WooCommerce
 *
 * This implementation may be acceptable for:
 * - Development/testing environments
 * - Read-only operations with read-only API keys
 * - Applications where WooCommerce credentials have very limited permissions
 */
export const woocommerceInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  const handleAuthError = (error: HttpErrorResponse) => {
    if (error.status === 401 || error.status === 403) {
      const errorCode = error.error?.code;
      
      const jwtErrors = [
        'jwt_auth_invalid_token',
        'jwt_auth_bad_auth_header',
        'jwt_auth_bad_iss',
        'jwt_auth_bad_request',
        'jwt_auth_expired_token'
      ];
      
      if (jwtErrors.includes(errorCode)) {
        // Clear all auth-related storage
        localStorage.clear();

        router.navigate(['/login']);
      }
    }
    return throwError(() => error);
  };
  
  if (req.url.includes('/wc/v3/')) {
    const modifiedReq = req.clone({
      setParams: {
        consumer_key: environment.woocommerce.consumerKey,
        consumer_secret: environment.woocommerce.consumerSecret
      }
    });
    
    return next(modifiedReq).pipe(
      catchError(handleAuthError)
    );
  }
  
  return next(req).pipe(
    catchError(handleAuthError)
  );
};
