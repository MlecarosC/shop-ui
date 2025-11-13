import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { validateRedirectUrl } from '../utils/security.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);

  if (authService.getIsAuthenticatedSignal()()) {
    return true;
  }

  // Validate and sanitize redirect URL to prevent open redirect attacks
  const safeRedirectUrl = validateRedirectUrl(state.url);
  localStorage.setItem('redirect_url', safeRedirectUrl);

  router.navigate(['/login']);
  return false;
};
