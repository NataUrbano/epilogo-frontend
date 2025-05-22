import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { 
  AuthResponse, 
  TokenResponse, 
  User, 
  UserLogin, 
  UserRegistration, 
  UserUpdate 
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from storage', error);
        this.logout();
      }
    }
  }

  register(userRegistration: UserRegistration): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userRegistration).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  login(userLogin: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, userLogin).pipe(
      tap(response => {
        this.handleAuthentication(response)
        this.getCurrentUserInfo().subscribe();
      }),
      catchError(error => {
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  private handleAuthentication(authResponse: AuthResponse): void {
    const { accessToken, refreshToken, ...userData } = authResponse;
    
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    
    const user: User = {
      userId: userData.userId,
      userName: userData.userName,
      email: userData.email,
      imageUrl: userData.imageUrl,
      registerDate: new Date().toISOString(),
      roles: userData.roles || [],
      isActive: true
    };
    
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('user_data');
    
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Email o contraseña incorrecta'));
    }
    
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(tokens => {
        localStorage.setItem(this.accessTokenKey, tokens.accessToken);
        localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
      }),
      catchError(error => {
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        this.logout();
        return throwError(() => new Error(message));
      })
    );
  }

  updateProfile(userUpdate: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userUpdate).pipe(
      tap(updatedUser => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  updateProfileImage(imageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    return this.http.post<User>(`${environment.apiUrl}/users/${currentUser.userId}/profile-image`, formData).pipe(
      tap(updatedUser => {
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  getCurrentUserInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(user => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const mergedUser = { ...currentUser, ...user };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        if (error.status === 401) {
          this.logout();
        }
        console.error('Registration error', error);
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.roles) {
      return false;
    }
    
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.some(r => 
      r === normalizedRole || 
      r === role || 
      r === normalizedRole.replace('ROLE_', '')
    );
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  private extractErrorMessage(error: any): string {
  if (error?.error?.message) {
    return error.error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado. Por favor, contacte al administrador.';
}

}