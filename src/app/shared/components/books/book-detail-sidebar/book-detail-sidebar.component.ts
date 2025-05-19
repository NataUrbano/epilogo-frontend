import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReservationFormComponent } from '../../reservations/reservation-form/reservation-form.component';
import { Book } from '../../../../core/models/book.model';
import { ReservationCreate } from '../../../../core/models/reservation.model';

declare var bootstrap: any;

@Component({
  selector: 'app-book-detail-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReservationFormComponent, TranslateModule],
  animations: [
    trigger('sidebarSlide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './book-detail-sidebar.component.html',
  styleUrls: ['./book-detail-sidebar.component.css']
})
export class BookDetailSidebarComponent implements OnChanges {
  @Input() bookId: number | null = null;
  @Input() book: Book | null = null;
  @Input() isAuthenticated: boolean = false;
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Input() reservationLoading: boolean = false;
  @Input() reservationError: string = '';
  @Input() reservationSuccess: boolean = false;
  
  @Output() closeRequest = new EventEmitter<void>();
  @Output() retryRequest = new EventEmitter<void>();
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  get isOpen(): boolean {
    return this.bookId !== null;
  }
  
  constructor(private translateService: TranslateService) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    // Mostrar notificaciones si cambia el estado de la reserva
    if (changes['reservationSuccess'] && this.reservationSuccess) {
      this.showNotification(
        this.translateService.instant('RESERVATION.SUCCESS_MESSAGE', { 
          book: this.book?.title || this.translateService.instant('COMMON.THIS_BOOK') 
        }),
        'success'
      );
    }
    
    if (changes['reservationError'] && this.reservationError) {
      this.showNotification(this.reservationError, 'error');
    }
  }
  
  close(): void {
    this.closeRequest.emit();
  }
  
  retryLoad(): void {
    this.retryRequest.emit();
  }
  
  onCreateReservation(data: ReservationCreate): void {
    this.createReservation.emit(data);
  }
  
  showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const toastContent = document.createElement('div');
    toastContent.className = 'd-flex';
    
    const toastBody = document.createElement('div');
    toastBody.className = 'toast-body';
    toastBody.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');
    
    toastContent.appendChild(toastBody);
    toastContent.appendChild(closeButton);
    toast.appendChild(toastContent);
    
    toastContainer.appendChild(toast);
    
    try {
      const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
      });
      bsToast.show();
      
      toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
      });
    } catch (error) {
      console.error('Error showing toast notification:', error);
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}