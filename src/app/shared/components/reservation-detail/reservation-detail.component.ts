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
  templateUrl: './reservation-detail.component.html',
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
      }
    });
  }
  
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
        this.router.navigate(['/profile'], { queryParams: { tab: 'reservations', message: 'cancelled' } });
      },
      error: (error) => {
        this.processingAction = false;
        this.errorMessage = error.message || 'Error al cancelar la reservación';
      }
    });
  }
}