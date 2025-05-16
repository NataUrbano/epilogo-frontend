import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Guard for protected routes - only authenticated users can access
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to login page with return URL
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

// Guard for role-based authorization
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  
  // Get required role from route data
  const requiredRole = route.data['role'];
  
  // If no role is required, allow access
  if (!requiredRole) {
    return true;
  }

  // Si es un array, usa hasAnyRole; si es string, usa hasRole
  if (Array.isArray(requiredRole)) {
    if (authService.hasAnyRole(requiredRole)) {
      return true;
    }
  } else {
    if (authService.hasRole(requiredRole)) {
      return true;
    }
  }
  
  // Check if user has the required role
  if (authService.hasRole(requiredRole)) {
    return true;
  }
  
  // Redirect to unauthorized page
  router.navigate(['/unauthorized']);
  return false;
};

// Guard for public routes - redirect authenticated users to home
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }
  
  return true;
};