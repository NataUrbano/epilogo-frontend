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
  
  // User state using BehaviorSubject for compatibility with components
  // that haven't migrated to signals yet
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  // JWT tokens
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  constructor() {
    this.loadUserFromStorage();
  }

  // Load user from storage on service initialization
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

  // Register a new user
  register(userRegistration: UserRegistration): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userRegistration).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Registration error', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  // Login user
  login(userLogin: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, userLogin).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  // Handle authentication response
  private handleAuthentication(authResponse: AuthResponse): void {
    const { accessToken, refreshToken, ...userData } = authResponse;
    
    // Store tokens
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    
    // Create user object
    const user: User = {
      userId: userData.userId,
      userName: userData.userName,
      email: userData.email,
      imageUrl: userData.imageUrl,
      registerDate: new Date().toISOString(), // This should come from the backend
      roles: [], // This should come from the backend
    };
    
    // Store user data
    localStorage.setItem('user_data', JSON.stringify(user));
    
    // Update user subject
    this.currentUserSubject.next(user);
  }

  // Logout user
  logout(): void {
    // Clear storage
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('user_data');
    
    // Clear user subject
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/auth/login']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Refresh token
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(tokens => {
        localStorage.setItem(this.accessTokenKey, tokens.accessToken);
        localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
      }),
      catchError(error => {
        console.error('Token refresh error', error);
        this.logout();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  // Update user profile
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
        console.error('Profile update error', error);
        return throwError(() => new Error(error.error?.message || 'Profile update failed'));
      })
    );
  }

  // Update user profile image
  updateProfileImage(imageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', imageFile); // Cambiado de 'image' a 'file' para coincidir con el backend
    
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    // Usamos la ruta del controlador de usuarios en lugar de auth
    return this.http.post<User>(`${environment.apiUrl}/users/${currentUser.userId}/profile-image`, formData).pipe(
      tap(updatedUser => {
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Profile image update error', error);
        return throwError(() => new Error(error.error?.message || 'Profile image update failed'));
      })
    );
  }

  // Get current user information from the API
  getCurrentUserInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(user => {
        // Update the user object with the latest data from the server
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const mergedUser = { ...currentUser, ...user };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Error getting current user info', error);
        return throwError(() => new Error(error.error?.message || 'Failed to get user information'));
      })
    );
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user?.roles.includes(role);
  }
}