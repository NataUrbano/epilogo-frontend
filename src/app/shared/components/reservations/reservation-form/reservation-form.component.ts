import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReservationCreate } from '../../../../core/models/reservation.model';

declare var bootstrap: any;

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit, OnChanges {
  @Input() bookId!: number;
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';
  @Input() reservationSuccess: boolean = false;
  
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  formData: ReservationCreate = {
    bookId: 0,
    expectedReturnDate: ''
  };
  
  constructor(private translateService: TranslateService) {}
  
  get minReturnDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
  
  ngOnInit(): void {
    this.formData.bookId = this.bookId;
  }
  
  ngOnChanges(): void {
    this.formData.bookId = this.bookId;
  }
  
  onSubmit(): void {
    if (!this.formData.expectedReturnDate) {
      this.showNotification(
        this.translateService.instant('RESERVATION.DATE_REQUIRED'), 
        'warning'
      );
      return;
    }
    
    this.createReservation.emit(this.formData);
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