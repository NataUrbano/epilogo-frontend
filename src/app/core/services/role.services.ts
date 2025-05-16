import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Role {
  roleId: number;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los roles disponibles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un rol por ID
   */
  getRoleById(roleId: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${roleId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un rol por nombre
   */
  getRoleByName(roleName: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/name/${roleName}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todos los nombres de roles disponibles
   */
  getAllRoleNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/names`)
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
    
    console.error('Error en RoleService:', error);
    return throwError(() => new Error(errorMessage));
  }
}