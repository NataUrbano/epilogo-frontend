import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  User, 
  UserUpdate, 
  UserUpdateAdmin, 
  UserRolesUpdate, 
  UserStatusUpdate 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar perfil de usuario
   */
  updateUser(userId: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Subir imagen de perfil
   */
  uploadProfileImage(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<User>(`${this.apiUrl}/${userId}/profile-image`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar roles de un usuario (solo para administradores)
   */
  updateUserRoles(userId: number, roles: string[]): Observable<User> {
    const request: UserRolesUpdate = { roles };
    return this.http.put<User>(`${this.apiUrl}/${userId}/roles`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cambiar estado de un usuario (activar/desactivar)
   */
  updateUserStatus(userId: number, isActive: boolean): Observable<User> {
    const request: UserStatusUpdate = { isActive };
    return this.http.put<User>(`${this.apiUrl}/${userId}/status`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar usuario completo (admin)
   */
  updateUserAdmin(userId: number, userData: UserUpdateAdmin): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/admin`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un usuario (solo admin)
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Error en UserService:', error);
    return throwError(() => new Error(errorMessage));
  }
}