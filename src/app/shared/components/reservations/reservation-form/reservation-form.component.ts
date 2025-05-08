import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationCreate } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reservation-form-container">
      <h3 class="form-title">Reservar este libro</h3>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="returnDate">Fecha de devolución:</label>
          <input 
            type="date" 
            id="returnDate" 
            [(ngModel)]="formData.expectedReturnDate" 
            name="returnDate" 
            [min]="minReturnDate" 
            required>
        </div>
        
        <button 
          type="submit" 
          class="reserve-button" 
          [disabled]="!formData.expectedReturnDate || loading">
          {{ loading ? 'Procesando...' : 'Reservar ahora' }}
        </button>
        
        @if (errorMessage) {
          <p class="error-message">{{ errorMessage }}</p>
        }
      </form>
    </div>
  `,
  styles: [`
    .reservation-form-container {
      padding: 1.5rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      margin-top: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .form-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.15);
    }
    
    .reserve-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
    
    .reserve-button:hover:not(:disabled) {
      background-color: #303f9f;
    }
    
    .reserve-button:disabled {
      background-color: #c5cae9;
      cursor: not-allowed;
    }
    
    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
      font-size: 0.9rem;
    }
  `]
})
export class ReservationFormComponent {
  @Input() bookId!: number;
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';
  
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  formData: ReservationCreate = {
    bookId: 0,
    expectedReturnDate: ''
  };
  
  // Getter para la fecha mínima de devolución (1 día después de hoy)
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
      return;
    }
    
    this.createReservation.emit(this.formData);
  }
}