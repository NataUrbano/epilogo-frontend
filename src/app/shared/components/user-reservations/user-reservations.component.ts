import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, RouterModule],
  template: `
    <div class="reservation-container">
      <!-- Filtros -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">{{ 'RESERVATIONS.MY_RESERVATIONS' | translate }}</h5>
        <div class="d-flex gap-2">
          <select 
            class="form-select form-select-sm" 
            [(ngModel)]="activeFilter" 
            (change)="applyFilter()"
          >
            <option value="all">{{ 'RESERVATIONS.ALL' | translate }}</option>
            <option value="ACTIVE">{{ 'RESERVATIONS.ACTIVE' | translate }}</option>
            <option value="PENDING">{{ 'RESERVATIONS.PENDING' | translate }}</option>
            <option value="COMPLETED">{{ 'RESERVATIONS.COMPLETED' | translate }}</option>
            <option value="CANCELLED">{{ 'RESERVATIONS.CANCELLED' | translate }}</option>
          </select>
          <button class="btn btn-sm btn-outline-primary" (click)="refreshReservations()">
            <i class="bi bi-arrow-clockwise me-1"></i>
            {{ 'RESERVATIONS.REFRESH' | translate }}
          </button>
        </div>
      </div>

      <!-- Alerta de reservaciones vencidas -->
      <div *ngIf="overdueReservations.length > 0" class="alert alert-danger mb-4">
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
          <div>
            <strong>{{ 'RESERVATIONS.OVERDUE_ALERT' | translate }}</strong>
            <p class="mb-0">{{ 'RESERVATIONS.OVERDUE_MESSAGE' | translate: {count: overdueReservations.length} }}</p>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ 'COMMON.LOADING' | translate }}</span>
        </div>
        <p class="mt-2">{{ 'RESERVATIONS.LOADING' | translate }}</p>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Sin reservaciones -->
      <div *ngIf="!isLoading && filteredReservations.length === 0" class="text-center py-5">
        <i class="bi bi-journal-x fs-1 text-muted mb-3"></i>
        <h5>{{ 'RESERVATIONS.NO_RESERVATIONS' | translate }}</h5>
        <p class="text-muted">{{ 'RESERVATIONS.NO_RESERVATIONS_MESSAGE' | translate }}</p>
        <a routerLink="/" class="btn btn-primary mt-2">
          {{ 'RESERVATIONS.BROWSE_BOOKS' | translate }}
        </a>
      </div>

      <!-- Lista de reservaciones -->
      <div *ngIf="!isLoading && filteredReservations.length > 0" class="reservation-list">
        <div *ngFor="let reservation of filteredReservations" 
             class="reservation-card mb-3" 
             [ngClass]="{
               'border-warning': isReservationNearDue(reservation),
               'border-danger': reservation.isOverdue,
               'border-success': reservation.status === 'COMPLETED',
               'border-secondary': reservation.status === 'CANCELLED'
             }">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <!-- Imagen del libro (si está disponible) -->
                <div class="col-md-2 col-sm-3 mb-3 mb-sm-0 text-center">
                  <div class="book-cover">
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
                </div>
                
                <!-- Detalles de la reservación -->
                <div class="col-md-7 col-sm-9">
                  <h5 class="card-title mb-1">
                    {{ reservation.book.title }}
                  </h5>
                  <p class="text-muted mb-2">
                    <small>{{ 'COMMON.BY' | translate }} {{ reservation.book.authorName }}</small>
                  </p>
                  
                  <!-- Badges de estado -->
                  <div class="mb-3">
                    <span class="badge"
                          [ngClass]="{
                            'bg-warning text-dark': reservation.status === 'PENDING',
                            'bg-success': reservation.status === 'ACTIVE',
                            'bg-secondary': reservation.status === 'CANCELLED',
                            'bg-primary': reservation.status === 'COMPLETED',
                            'bg-danger': reservation.isOverdue
                          }">
                      {{ reservation.isOverdue ? ('RESERVATIONS.OVERDUE' | translate) : ('RESERVATIONS.' + reservation.status | translate) }}
                    </span>
                    <span *ngIf="isReservationNearDue(reservation) && !reservation.isOverdue" class="badge bg-warning text-dark ms-1">
                      {{ 'RESERVATIONS.NEAR_DUE' | translate }}
                    </span>
                  </div>
                  
                  <!-- Fechas importantes -->
                  <div class="reservation-dates">
                    <div class="row g-2">
                      <div class="col-sm-4">
                        <small class="text-muted d-block">{{ 'RESERVATIONS.RESERVATION_DATE' | translate }}</small>
                        <span>{{ reservation.reservationDate | date:'shortDate' }}</span>
                      </div>
                      <div class="col-sm-4">
                        <small class="text-muted d-block">{{ 'RESERVATIONS.EXPECTED_RETURN' | translate }}</small>
                        <span [ngClass]="{'text-danger': reservation.isOverdue}">
                          {{ reservation.expectedReturnDate | date:'shortDate' }}
                        </span>
                      </div>
                      <div class="col-sm-4" *ngIf="reservation.actualReturnDate">
                        <small class="text-muted d-block">{{ 'RESERVATIONS.ACTUAL_RETURN' | translate }}</small>
                        <span>{{ reservation.actualReturnDate | date:'shortDate' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Acciones -->
                <div class="col-md-3 d-flex flex-column justify-content-center align-items-md-end mt-3 mt-md-0">
                  <span *ngIf="reservation.isOverdue" class="text-danger mb-2 fw-bold">
                    <i class="bi bi-clock-history me-1"></i>
                    {{ getDaysOverdue(reservation) }} {{ 'RESERVATIONS.DAYS_OVERDUE' | translate }}
                  </span>
                  <div *ngIf="!reservation.isOverdue && isReservationNearDue(reservation)" class="text-warning mb-2">
                    <i class="bi bi-clock me-1"></i>
                    {{ getDaysUntilDue(reservation) }} {{ 'RESERVATIONS.DAYS_REMAINING' | translate }}
                  </div>
                  
                  <!-- Botones de acción -->
                  <div class="d-grid gap-2 mt-2">
                    <button 
                      *ngIf="canBeCancelled(reservation)" 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="cancelReservation(reservation)"
                      [disabled]="reservation.processingCancel"
                    >
                      <span *ngIf="reservation.processingCancel" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      {{ 'RESERVATIONS.CANCEL' | translate }}
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-reservations.component.css']
})
export class UserReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  
  @Output() statsUpdate = new EventEmitter<any>();
  
  currentUser: User | null = null;
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  overdueReservations: Reservation[] = [];
  isLoading = true;
  errorMessage = '';
  activeFilter: string = 'all';
  
  // Constante para días de advertencia (próximas a vencer)
  private readonly NEAR_DUE_DAYS = 3;
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadReservations();
      }
    });
  }
  
  refreshReservations(): void {
    this.loadReservations();
  }
  
  loadReservations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (!this.currentUser) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      return;
    }
    
    this.reservationService.searchReservations({
      userId: this.currentUser.userId
    }).subscribe({
      next: (response) => {
        this.reservations = response.content || [];
        this.applyFilter();
        this.findOverdueReservations();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar las reservaciones';
        this.isLoading = false;
        console.error('Error loading reservations:', error);
      }
    });
  }
  
  applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredReservations = [...this.reservations];
    } else {
      this.filteredReservations = this.reservations.filter(
        res => res.status === this.activeFilter
      );
    }
    
    // Calcular y emitir estadísticas actualizadas
    this.calculateAndEmitStats();
  }
  
  findOverdueReservations(): void {
    this.overdueReservations = this.reservations.filter(res => res.isOverdue);
  }
  
  // Calcular estadísticas y emitirlas al componente padre
  calculateAndEmitStats(): void {
    if (!this.reservations.length) return;
    
    const stats = {
      points: this.calculatePoints(),
      activeReservations: this.reservations.filter(r => r.status === ReservationStatus.ACTIVE).length,
      completedReservations: this.reservations.filter(r => r.status === ReservationStatus.COMPLETED).length,
      overdueCount: this.overdueReservations.length
    };
    
    this.statsUpdate.emit(stats);
  }
  
  // Calcular puntos basados en reservaciones completadas (1 punto por libro devuelto a tiempo)
  calculatePoints(): number {
    return this.reservations.filter(r => 
      r.status === ReservationStatus.COMPLETED && 
      !this.wasReservationOverdue(r)
    ).length;
  }
  
  // Verificar si una reservación fue devuelta después de la fecha esperada
  wasReservationOverdue(reservation: Reservation): boolean {
    if (reservation.status !== ReservationStatus.COMPLETED || !reservation.actualReturnDate) {
      return false;
    }
    
    const returnDate = new Date(reservation.actualReturnDate);
    const dueDate = new Date(reservation.expectedReturnDate);
    return returnDate > dueDate;
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
  
  cancelReservation(reservation: Reservation): void {
    if (!this.canBeCancelled(reservation)) return;
    
    // Agregamos una propiedad temporal para mostrar el spinner
    reservation.processingCancel = true;
    
    this.reservationService.cancelReservation(reservation.reservationId).subscribe({
      next: (updatedReservation) => {
        // Actualizamos la reservación en nuestro array
        const index = this.reservations.findIndex(r => r.reservationId === reservation.reservationId);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
          this.applyFilter();
        }
        reservation.processingCancel = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cancelar la reservación';
        reservation.processingCancel = false;
        console.error('Error cancelling reservation:', error);
      }
    });
  }
}