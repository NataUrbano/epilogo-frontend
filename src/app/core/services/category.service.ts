import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, CategoryCreate, CategorySummary, CategoryUpdate } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener una categoría por ID
   */
  getCategoryById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todas las categorías
   */
  getAllCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear una nueva categoría
   */
  createCategory(categoryData: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, categoryData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar una categoría existente
   */
  updateCategory(categoryId: number, categoryData: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, categoryData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar una categoría
   */
  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Subir imagen de categoría
   */
  uploadCategoryImage(categoryId: number, file: File): Observable<Category> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Category>(`${this.apiUrl}/${categoryId}/image`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener categorías más populares
   */
  getMostPopularCategories(limit: number = 10): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${this.apiUrl}/popular?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error) {
      // Error devuelto por el servidor
      errorMessage = error.error.message || 'Error en la operación';
    } else if (error.status) {
      // Errores HTTP sin cuerpo de respuesta
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado para realizar esta acción.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido a este recurso.';
          break;
        case 404:
          errorMessage = 'Categoría no encontrada.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error HTTP: ${error.statusText}`;
      }
    }
    
    console.error('Error en CategoryService:', error);
    return throwError(() => new Error(errorMessage));
  }
}