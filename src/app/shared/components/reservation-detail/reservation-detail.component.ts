import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div class="container py-4">
      <!-- Navegación y título -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="mb-0">{{ 'RESERVATIONS.DETAIL_TITLE' | translate }}</h3>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a routerLink="/profile">{{ 'PROFILE.MY_RESERVATIONS' | translate }}</a></li>
              <li class="breadcrumb-item active">{{ 'RESERVATIONS.RESERVATION' | translate }} #{{ reservation?.reservationId }}</li>
            </ol>
          </nav>
        </div>
        <button class="btn btn-outline-primary" routerLink="/profile">
          <i class="bi bi-arrow-left me-1"></i>
          {{ 'COMMON.BACK' | translate }}
        </button>
      </div>
      
      <!-- Estado de carga -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ 'COMMON.LOADING' | translate }}</span>
        </div>
        <p class="mt-2">{{ 'RESERVATIONS.LOADING_DETAIL' | translate }}</p>
      </div>
      
      <!-- Mensaje de error -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        {{ errorMessage }}
      </div>
      
      <!-- Sin reservación -->
      <div *ngIf="!isLoading && !reservation" class="text-center py-5">
        <i class="bi bi-journal-x fs-1 text-muted mb-3"></i>
        <h5>{{ 'RESERVATIONS.NOT_FOUND' | translate }}</h5>
        <p class="text-muted">{{ 'RESERVATIONS.NOT_FOUND_MESSAGE' | translate }}</p>
        <a routerLink="/profile" class="btn btn-primary mt-2">
          {{ 'RESERVATIONS.GO_TO_RESERVATIONS' | translate }}
        </a>
      </div>
      
      <!-- Detalles de la reservación -->
      <div *ngIf="!isLoading && reservation" class="row">
        <!-- Columna izquierda: Información del libro -->
        <div class="col-md-4 mb-4 mb-md-0">
          <div class="card shadow-sm h-100">
            <div class="card-body text-center">
              <!-- Imagen del libro -->
              <div class="book-cover mb-3">
                <img 
                  *ngIf="reservation.book.imageUrl" 
                  [src]="reservation.book.imageUrl" 
                  [alt]="reservation.book.title"
                  class="img-fluid rounded"
                />
                <div *ngIf="!reservation.book.imageUrl" class="no-cover d-flex align-items-center justify-content-center">
                  <i class="bi bi-book fs-1 text-muted"></i>
                </div>
              </div>
              
              <h5 class="card-title">{{ reservation.book.title }}</h5>
              <p class="text-muted">{{ 'COMMON.BY' | translate }} {{ reservation.book.authorName }}</p>
              
              <!-- Información adicional del libro -->
              <div class="book-details mt-3 text-start">
                <div class="mb-2">
                  <small class="text-muted">{{ 'BOOKS.STATUS' | translate }}:</small>
                  <span class="ms-2 badge" [ngClass]="{
                    'bg-success': reservation.book.bookStatus === 'AVAILABLE',
                    'bg-warning text-dark': reservation.book.bookStatus === 'LOW_STOCK',
                    'bg-danger': reservation.book.bookStatus === 'UNAVAILABLE'
                  }">
                    {{ 'BOOKS.STATUS_' + reservation.book.bookStatus | translate }}
                  </span>
                </div>
                <div class="mb-2">
                  <small class="text-muted">{{ 'BOOKS.ID' | translate }}:</small>
                  <span class="ms-2">{{ reservation.book.bookId }}</span>
                </div>
              </div>
              
              <!-- Botón para ver detalles del libro -->
              <a [routerLink]="['/books', reservation.book.bookId]" class="btn btn-primary w-100 mt-3">
                {{ 'BOOKS.VIEW_DETAILS' | translate }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Columna derecha: Detalles de la reservación -->
        <div class="col-md-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">{{ 'RESERVATIONS.DETAILS' | translate }}</h5>
            </div>
            <div class="card-body">
              <!-- Estado de la reservación -->
              <div class="reservation-status mb-4">
                <span class="badge p-2"
                      [ngClass]="{
                        'bg-warning text-dark': reservation.status === 'PENDING',
                        'bg-success': reservation.status === 'ACTIVE',
                        'bg-secondary': reservation.status === 'CANCELLED',
                        'bg-primary': reservation.status === 'COMPLETED',
                        'bg-danger': reservation.isOverdue
                      }">
                  {{ reservation.isOverdue ? ('RESERVATIONS.OVERDUE' | translate) : ('RESERVATIONS.' + reservation.status | translate) }}
                </span>
                
                <span *ngIf="isReservationNearDue(reservation) && !reservation.isOverdue" class="badge bg-warning text-dark ms-2">
                  {{ 'RESERVATIONS.NEAR_DUE' | translate }}
                </span>
                
                <span *ngIf="reservation.isOverdue" class="text-danger ms-3">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  {{ getDaysOverdue(reservation) }} {{ 'RESERVATIONS.DAYS_OVERDUE' | translate }}
                </span>
              </div>
              
              <!-- Información de la reservación -->
              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.RESERVATION_ID' | translate }}</small>
                    <strong>{{ reservation.reservationId }}</strong>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.RESERVATION_DATE' | translate }}</small>
                    <strong>{{ reservation.reservationDate | date:'mediumDate' }}</strong>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.EXPECTED_RETURN' | translate }}</small>
                    <strong [ngClass]="{'text-danger': reservation.isOverdue}">
                      {{ reservation.expectedReturnDate | date:'mediumDate' }}
                    </strong>
                    <small *ngIf="!reservation.isOverdue && isReservationNearDue(reservation)" class="text-warning d-block">
                      {{ getDaysUntilDue(reservation) }} {{ 'RESERVATIONS.DAYS_REMAINING' | translate }}
                    </small>
                  </div>
                </div>
                <div class="col-md-6 mb-3" *ngIf="reservation.actualReturnDate">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.ACTUAL_RETURN' | translate }}</small>
                    <strong>{{ reservation.actualReturnDate | date:'mediumDate' }}</strong>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.PICKUP_LOCATION' | translate }}</small>
                    <strong>{{ 'LOCATIONS.MAIN_LIBRARY' | translate }}</strong>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="reservation-info-item">
                    <small class="text-muted d-block">{{ 'RESERVATIONS.BORROWER' | translate }}</small>
                    <strong>{{ reservation.user.userName }}</strong>
                  </div>
                </div>
              </div>
              
              <!-- Acciones -->
              <div class="d-flex justify-content-end">
                <button 
                  *ngIf="canBeCancelled(reservation)" 
                  class="btn btn-danger me-2" 
                  (click)="cancelReservation(reservation.reservationId)"
                  [disabled]="processingAction"
                >
                  <span *ngIf="processingAction" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {{ 'RESERVATIONS.CANCEL' | translate }}
                </button>
                <button 
                  class="btn btn-primary" 
                  routerLink="/profile" 
                  [queryParams]="{tab: 'reservations'}"
                >
                  {{ 'COMMON.BACK_TO_LIST' | translate }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Reglas de la biblioteca -->
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">{{ 'RESERVATIONS.LIBRARY_RULES' | translate }}</h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  {{ 'RESERVATIONS.RULE_PICKUP' | translate }}
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  {{ 'RESERVATIONS.RULE_RETURN' | translate }}
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  {{ 'RESERVATIONS.RULE_CONDITION' | translate }}
                </li>
                <li class="mb-2">
                  <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  {{ 'RESERVATIONS.RULE_LATE' | translate }}
                </li>
              </ul>
              
              <div *ngIf="reservation.isOverdue" class="alert alert-danger mt-3">
                <div class="d-flex">
                  <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
                  <div>
                    <strong>{{ 'RESERVATIONS.OVERDUE_WARNING' | translate }}</strong>
                    <p class="mb-0">{{ 'RESERVATIONS.OVERDUE_INSTRUCTIONS' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservation-detail.component.css']
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  
  reservation: Reservation | null = null;
  isLoading = true;
  errorMessage = '';
  processingAction = false;
  
  // Constante para días de advertencia (próximas a vencer)
  private readonly NEAR_DUE_DAYS = 3;
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const reservationId = params.get('id');
      if (reservationId) {
        this.loadReservation(+reservationId);
      } else {
        this.errorMessage = 'ID de reservación inválido';
        this.isLoading = false;
      }
    });
  }
  
  loadReservation(reservationId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.reservationService.getReservationById(reservationId).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.isLoading = false;
        this.verifyOwnership();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar la reservación';
        this.isLoading = false;
        console.error('Error loading reservation:', error);
      }
    });
  }
  
  // Verificar que la reservación pertenece al usuario actual
  verifyOwnership(): void {
    if (!this.reservation) return;
    
    this.authService.currentUser$.subscribe(user => {
      if (user && this.reservation && user.userId !== this.reservation.user.userId) {
        this.errorMessage = 'No tienes permiso para ver esta reservación';
        this.reservation = null;
      }
    });
  }
  
  isReservationNearDue(reservation: Reservation): boolean {
    if (reservation.status !== ReservationStatus.ACTIVE || reservation.isOverdue) {
      return false;
    }
    
    const today = new Date();
    const dueDate = new Date(reservation.expectedReturnDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilDue <= this.NEAR_DUE_DAYS && daysUntilDue >= 0;
  }
  
  getDaysUntilDue(reservation: Reservation): number {
    const today = new Date();
    const dueDate = new Date(reservation.expectedReturnDate);
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  getDaysOverdue(reservation: Reservation): number {
    if (!reservation.isOverdue) return 0;
    
    const today = new Date();
    const dueDate = new Date(reservation.expectedReturnDate);
    return Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  canBeCancelled(reservation: Reservation): boolean {
    return reservation.status === ReservationStatus.PENDING || 
           reservation.status === ReservationStatus.ACTIVE;
  }
  
  cancelReservation(reservationId: number): void {
    this.processingAction = true;
    
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: (updatedReservation) => {
        this.processingAction = false;
        this.reservation = updatedReservation;
        // Mostrar mensaje de éxito o redirigir al listado
        this.router.navigate(['/profile'], { queryParams: { tab: 'reservations', message: 'cancelled' } });
      },
      error: (error) => {
        this.processingAction = false;
        this.errorMessage = error.message || 'Error al cancelar la reservación';
        console.error('Error cancelling reservation:', error);
      }
    });
  }
}