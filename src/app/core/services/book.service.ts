import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Book, BookCreate, BookSearch, BookSummary, BookUpdate } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getBookById(bookId: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${bookId}`)
      .pipe(catchError(this.handleError));
  }

  searchBooks(searchParams: BookSearch): Observable<any> {
    let params = new HttpParams();
    
    if (searchParams.query) params = params.set('query', searchParams.query);
    if (searchParams.categoryId) params = params.set('categoryId', searchParams.categoryId.toString());
    if (searchParams.authorId) params = params.set('authorId', searchParams.authorId.toString());
    if (searchParams.status) params = params.set('status', searchParams.status);
    if (searchParams.page !== undefined) params = params.set('page', searchParams.page.toString());
    if (searchParams.size) params = params.set('size', searchParams.size.toString());
    if (searchParams.sortBy) params = params.set('sortBy', searchParams.sortBy);
    if (searchParams.sortDirection) params = params.set('sortDirection', searchParams.sortDirection);
    
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  createBook(bookData: BookCreate): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, bookData)
      .pipe(catchError(this.handleError));
  }

  updateBook(bookId: number, bookData: BookUpdate): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${bookId}`, bookData)
      .pipe(catchError(this.handleError));
  }

  deleteBook(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bookId}`)
      .pipe(catchError(this.handleError));
  }

  uploadBookCover(bookId: number, file: File): Observable<Book> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Book>(`${this.apiUrl}/${bookId}/cover`, formData)
      .pipe(catchError(this.handleError));
  }

  getMostPopularBooks(limit: number = 10): Observable<BookSummary[]> {
    return this.http.get<BookSummary[]>(`${this.apiUrl}/popular?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error) {
      errorMessage = error.error.message || 'Error en la operación';
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado para realizar esta acción.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido a este recurso.';
          break;
        case 404:
          errorMessage = 'Libro no encontrado.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error HTTP: ${error.statusText}`;
      }
    }
    
    console.error('Error en BookService:', error);
    return throwError(() => new Error(errorMessage));
  }
}