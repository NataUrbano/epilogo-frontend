import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const requiredRole = route.data['role'];

  if (!requiredRole) {
    return true;
  }

  const hasAccess = Array.isArray(requiredRole)
    ? authService.hasAnyRole(requiredRole)
    : authService.hasRole(requiredRole);

  if (hasAccess) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};


export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }
  
  return true;
};