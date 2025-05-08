import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Author, AuthorCreate, AuthorSummary, AuthorUpdate } from '../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/authors`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener un autor por ID
   */
  getAuthorById(authorId: number): Observable<Author> {
    return this.http.get<Author>(`${this.apiUrl}/${authorId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Buscar autores por nombre
   */
  findAuthorsByName(name: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todos los autores
   */
  getAllAuthors(): Observable<AuthorSummary[]> {
    return this.http.get<AuthorSummary[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear un nuevo autor
   */
  createAuthor(authorData: AuthorCreate): Observable<Author> {
    return this.http.post<Author>(this.apiUrl, authorData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar un autor existente
   */
  updateAuthor(authorId: number, authorData: AuthorUpdate): Observable<Author> {
    return this.http.put<Author>(`${this.apiUrl}/${authorId}`, authorData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un autor
   */
  deleteAuthor(authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${authorId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Subir imagen de autor
   */
  uploadAuthorImage(authorId: number, file: File): Observable<Author> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Author>(`${this.apiUrl}/${authorId}/image`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener autores más populares
   */
  getMostPopularAuthors(limit: number = 10): Observable<AuthorSummary[]> {
    return this.http.get<AuthorSummary[]>(`${this.apiUrl}/popular?limit=${limit}`)
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
          errorMessage = 'Autor no encontrado.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error HTTP: ${error.statusText}`;
      }
    }
    
    console.error('Error en AuthorService:', error);
    return throwError(() => new Error(errorMessage));
  }
}