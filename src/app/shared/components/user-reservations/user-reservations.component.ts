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
  templateUrl: './user-reservations.component.html',
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
    
    this.calculateAndEmitStats();
  }
  
  findOverdueReservations(): void {
    this.overdueReservations = this.reservations.filter(res => res.isOverdue);
  }
  
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
  
  calculatePoints(): number {
    return this.reservations.filter(r => 
      r.status === ReservationStatus.COMPLETED && 
      !this.wasReservationOverdue(r)
    ).length;
  }
  
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
    
    reservation.processingCancel = true;
    
    this.reservationService.cancelReservation(reservation.reservationId).subscribe({
      next: (updatedReservation) => {
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
      }
    });
  }
}