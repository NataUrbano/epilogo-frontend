  import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
  import { inject } from '@angular/core';
  import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
  import { AuthService } from './auth.service';

  let isRefreshing = false;
  const tokenRefreshSubject = new BehaviorSubject<string | null>(null);

  export const jwtInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
  ) => {
    const authService = inject(AuthService);
    const authRequest = addAuthHeader(request, authService);
    
    return next(authRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handleUnauthorizedError(error, request, next, authService);
        }
        
        return throwError(() => error);
      })
    );
  };

  function addAuthHeader(request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
    const token = authService.getAccessToken();
    
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

  function handleUnauthorizedError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService
  ): Observable<any> {
    if (request.url.includes('/auth/refresh')) {
      authService.logout();
      return throwError(() => error);
    }
    
    if (!isRefreshing) {
      isRefreshing = true;
      tokenRefreshSubject.next(null);
      
      return authService.refreshToken().pipe(
        switchMap(tokens => {
          isRefreshing = false;
          tokenRefreshSubject.next(tokens.accessToken);
          
          return next(addTokenToRequest(request, tokens.accessToken));
        }),
        catchError(refreshError => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    } else {
      return tokenRefreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next(addTokenToRequest(request, token!)))
      );
    }
  }

  function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }