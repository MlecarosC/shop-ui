import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);
  
  if (!authService.getIsAuthenticatedSignal()()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
