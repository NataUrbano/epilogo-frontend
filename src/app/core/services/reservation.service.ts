import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Reservation, 
  ReservationCreate, 
  ReservationSearch, 
  ReservationStatus, 
  ReservationUpdate 
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;
  
  private reservationsUpdatedSubject = new BehaviorSubject<boolean>(false);
  reservationsUpdated$ = this.reservationsUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  createReservation(reservationData: ReservationCreate): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservationData)
      .pipe(
        tap(() => this.notifyReservationsUpdated()),
        catchError(this.handleError)
      );
  }

  getReservationById(reservationId: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${reservationId}`)
      .pipe(catchError(this.handleError));
  }

  updateReservation(reservationId: number, updateData: ReservationUpdate): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}`, updateData)
      .pipe(
        tap(() => this.notifyReservationsUpdated()),
        catchError(this.handleError)
      );
  }

  searchReservations(searchParams: ReservationSearch): Observable<any> {
    let params = new HttpParams();
    
    const page = searchParams.page !== undefined ? searchParams.page : 0;
    const size = searchParams.size || 10;
    
    if (searchParams.userId) params = params.set('userId', searchParams.userId.toString());
    if (searchParams.bookId) params = params.set('bookId', searchParams.bookId.toString());
    if (searchParams.status) params = params.set('status', searchParams.status);
    if (searchParams.overdueOnly) params = params.set('overdueOnly', searchParams.overdueOnly.toString());
    if (searchParams.startDate) params = params.set('startDate', searchParams.startDate);
    if (searchParams.endDate) params = params.set('endDate', searchParams.endDate);
    
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getOverdueReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/overdue`)
      .pipe(catchError(this.handleError));
  }

  getUserOverdueReservations(userId: number): Observable<Reservation[]> {
    return this.searchReservations({
      userId: userId,
      overdueOnly: true
    }).pipe(
      tap((response) => {
        return response.content || [];
      }),
      catchError(this.handleError)
    );
  }

  getUserActiveReservations(userId: number): Observable<Reservation[]> {
    return this.searchReservations({
      userId: userId,
      status: ReservationStatus.ACTIVE
    }).pipe(
      tap((response) => {
        return response.content || [];
      }),
      catchError(this.handleError)
    );
  }

  cancelReservation(reservationId: number): Observable<Reservation> {
    return this.updateReservation(reservationId, { status: ReservationStatus.CANCELLED })
      .pipe(
        tap(() => this.notifyReservationsUpdated()),
        catchError(this.handleError)
      );
  }

  activateReservation(reservationId: number): Observable<Reservation> {
    return this.updateReservation(reservationId, { status: ReservationStatus.ACTIVE })
      .pipe(
        tap(() => this.notifyReservationsUpdated()),
        catchError(this.handleError)
      );
  }

  completeReservation(reservationId: number, actualReturnDate: string): Observable<Reservation> {
    return this.updateReservation(reservationId, { 
      status: ReservationStatus.COMPLETED,
      actualReturnDate
    }).pipe(
      tap(() => this.notifyReservationsUpdated()),
      catchError(this.handleError)
    );
  }
  
  getUserReservationStats(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/${userId}`)
      .pipe(catchError(this.handleError));
  }
  
  private notifyReservationsUpdated(): void {
    this.reservationsUpdatedSubject.next(true);
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
          errorMessage = 'Reservación no encontrada.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error HTTP: ${error.statusText}`;
      }
    }
    
    console.error('Error en ReservationService:', error);
    return throwError(() => new Error(errorMessage));
  }
}