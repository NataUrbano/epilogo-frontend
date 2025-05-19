import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './app-reservations-list.component.html',
  styleUrls: ['./app-reservations-list.component.css']
})
export class ReservationsListComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private translateService = inject(TranslateService);
  
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  isLoading: boolean = true;
  
  searchTerm: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';
  overdueOnly: boolean = false;
  
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalReservations: number = 0;
  
  showCompleteModal: boolean = false;
  showCancelModal: boolean = false;
  showDetailsModal: boolean = false;
  selectedReservation: Reservation | null = null;
  actualReturnDate: string = '';
  
  ngOnInit(): void {
    this.loadReservations();
    
    this.reservationService.reservationsUpdated$.subscribe(() => {
      this.loadReservations();
    });
  }
  
  loadReservations(): void {
    this.isLoading = true;
    
    const filters = {
      status: this.selectedStatus as ReservationStatus | undefined,
      startDate: this.startDate,
      endDate: this.endDate,
      overdueOnly: this.overdueOnly,
      page: this.currentPage,
      size: this.pageSize
    };
    
    this.reservationService.searchReservations(filters).subscribe({
      next: (response) => {
        this.reservations = response.content.map((reservation: Reservation) => ({
          ...reservation,
          processingCancel: false
        }));
        this.totalReservations = response.totalElements;
        this.totalPages = response.totalPages;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredReservations = [...this.reservations];
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredReservations = this.reservations.filter(reservation => 
      reservation.book.title.toLowerCase().includes(search) ||
      reservation.user.userName.toLowerCase().includes(search)
    );
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.overdueOnly = false;
    this.currentPage = 0;
    this.loadReservations();
  }
  
  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedStatus || this.startDate || this.endDate || this.overdueOnly);
  }
  
  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.loadReservations();
  }
  
  getPaginationRange(): number[] {
    const pages = [];
    const totalButtons = 5;
    
    if (this.totalPages <= totalButtons) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfButtons = Math.floor(totalButtons / 2);
      let startPage = Math.max(0, this.currentPage - halfButtons);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + halfButtons);
      
      if (startPage === 0) {
        endPage = Math.min(totalButtons - 1, this.totalPages - 1);
      } else if (endPage === this.totalPages - 1) {
        startPage = Math.max(0, this.totalPages - totalButtons);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  getStatusText(status: string): string {
    return this.translateService.instant(`RESERVATIONS.STATUS.${status}`);
  }
  
  openCompleteModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.actualReturnDate = new Date().toISOString().substring(0, 10);
    this.showCompleteModal = true;
  }
  
  openCancelModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showCancelModal = true;
  }
  
  openDetailsModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDetailsModal = true;
  }
  
  activateReservation(reservation: Reservation): void {
    if (!reservation || reservation.processingCancel) return;
    
    this.setReservationProcessing(reservation.reservationId, true);
    
    this.reservationService.activateReservation(reservation.reservationId).subscribe({
      next: () => {
        this.setReservationProcessing(reservation.reservationId, false);
      },
      error: (error) => {
        this.setReservationProcessing(reservation.reservationId, false);
        alert(this.translateService.instant('RESERVATIONS.ERRORS.ACTIVATE_ERROR'));
      }
    });
  }
  
  completeReservation(): void {
    if (!this.selectedReservation || !this.actualReturnDate) {
      alert(this.translateService.instant('RESERVATIONS.VALIDATION.SELECT_RETURN_DATE'));
      return;
    }
    
    this.setReservationProcessing(this.selectedReservation.reservationId, true);
    
    this.reservationService.completeReservation(
      this.selectedReservation.reservationId,
      this.actualReturnDate
    ).subscribe({
      next: () => {
        this.showCompleteModal = false;
        this.selectedReservation = null;
      },
      error: (error) => {
        this.setReservationProcessing(this.selectedReservation!.reservationId, false);
        alert(this.translateService.instant('RESERVATIONS.ERRORS.COMPLETE_ERROR'));
      }
    });
  }
  
  cancelReservation(): void {
    if (!this.selectedReservation) return;
    
    this.setReservationProcessing(this.selectedReservation.reservationId, true);
    
    this.reservationService.cancelReservation(this.selectedReservation.reservationId).subscribe({
      next: () => {
        this.showCancelModal = false;
        this.selectedReservation = null;
      },
      error: (error) => {
        this.setReservationProcessing(this.selectedReservation!.reservationId, false);
        alert(this.translateService.instant('RESERVATIONS.ERRORS.CANCEL_ERROR'));
      }
    });
  }
  
  private setReservationProcessing(reservationId: number, isProcessing: boolean): void {
    this.reservations = this.reservations.map(r => 
      r.reservationId === reservationId ? {...r, processingCancel: isProcessing} : r
    );
    this.filteredReservations = this.filteredReservations.map(r => 
      r.reservationId === reservationId ? {...r, processingCancel: isProcessing} : r
    );
  }
}