import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Si no hay token, redirigir directamente
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  
  // Verificar si el token es válido haciendo una petición al backend
  return authService.getCurrentUserInfo().pipe(
    map(() => true), // Si la petición es exitosa, el token es válido
    catchError(() => {
      // Si falla, el token expiró - hacer logout y redirigir
      authService.logout();
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay token, redirigir directamente
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }

  // Verificar validez del token y roles
  return authService.getCurrentUserInfo().pipe(
    map(() => {
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
    }),
    catchError(() => {
      // Si falla, el token expiró - hacer logout y redirigir
      authService.logout();
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
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