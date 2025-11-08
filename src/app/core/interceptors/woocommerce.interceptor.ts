import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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
        console.log('Token JWT inválido o expirado, cerrando sesión...');
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        localStorage.removeItem('cart_key');
        
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
