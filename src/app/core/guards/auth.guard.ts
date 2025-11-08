import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);
  
  if (authService.getIsAuthenticatedSignal()()) {
    return true;
  }

  localStorage.setItem('redirect_url', state.url);

  router.navigate(['/login']);
  return false;
};
