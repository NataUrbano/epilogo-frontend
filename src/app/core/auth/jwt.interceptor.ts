  import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
  import { inject } from '@angular/core';
  import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
  import { AuthService } from './auth.service';

  // Flag to track if token refresh is in progress
  let isRefreshing = false;
  // Subject to notify all requests when token refresh is completed
  const tokenRefreshSubject = new BehaviorSubject<string | null>(null);

  export const jwtInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
  ) => {
    const authService = inject(AuthService);
    
    // Clone request with auth header if token exists
    const authRequest = addAuthHeader(request, authService);
    
    // Process the request with error handling for 401 responses
    return next(authRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handleUnauthorizedError(error, request, next, authService);
        }
        
        return throwError(() => error);
      })
    );
  };

  // Add authorization header to request
  function addAuthHeader(request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
    const token = authService.getAccessToken();
    
    // Skip token addition for auth endpoints to avoid complications with login/register/refresh
    if (request.url.includes('/auth/login') || 
        request.url.includes('/auth/register') || 
        request.url.includes('/auth/refresh')) {
      return request;
    }
    
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return request;
  }

  // Handle 401 Unauthorized error by refreshing token
  function handleUnauthorizedError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService
  ): Observable<any> {
    // Skip token refresh for the refresh token endpoint itself
    if (request.url.includes('/auth/refresh')) {
      authService.logout();
      return throwError(() => error);
    }
    
    // If not already refreshing, start the token refresh process
    if (!isRefreshing) {
      isRefreshing = true;
      tokenRefreshSubject.next(null);
      
      return authService.refreshToken().pipe(
        switchMap(tokens => {
          isRefreshing = false;
          tokenRefreshSubject.next(tokens.accessToken);
          
          // Retry the original request with the new token
          return next(addTokenToRequest(request, tokens.accessToken));
        }),
        catchError(refreshError => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    } else {
      // If refresh is in progress, wait for new token then retry request
      return tokenRefreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next(addTokenToRequest(request, token!)))
      );
    }
  }

  // Add token to request
  function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }