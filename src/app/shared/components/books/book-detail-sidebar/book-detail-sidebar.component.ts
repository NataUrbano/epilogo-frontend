import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReservationFormComponent } from '../../reservations/reservation-form/reservation-form.component';
import { Book } from '../../../../core/models/book.model';
import { ReservationCreate } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-book-detail-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReservationFormComponent],
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
  template: `
    @if (isOpen) {
      <div 
        class="sidebar-backdrop" 
        @backdropFade 
        (click)="close()">
      </div>
      
      <div class="sidebar" @sidebarSlide>
        <div class="sidebar-header">
          <button class="close-button" (click)="close()">×</button>
          <h2 class="sidebar-title">Detalles del libro</h2>
        </div>
        
        @if (loading) {
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando detalles...</p>
          </div>
        } @else if (error) {
          <div class="error-message">
            <p>{{ error }}</p>
            <button class="retry-button" (click)="retryLoad()">Intentar nuevamente</button>
          </div>
        } @else if (book) {
          <div class="book-details">
            <div class="book-cover" 
                 [style.background-image]="book.imageUrl ? 'url(' + book.imageUrl + ')' : 'url(/assets/images/default-book.jpg)'">
            </div>
            
            <h3 class="book-title">{{ book.title }}</h3>
            
            <div class="book-info">
              <p class="author"><strong>Autor:</strong> {{ book.author.authorName || 'No especificado' }}</p>
              
              @if (book.description) {
                <p class="description">{{ book.description }}</p>
              }
              
              <p class="status" [class]="book.bookStatus.toLowerCase()">
                Estado: 
                @switch (book.bookStatus) {
                  @case ('AVAILABLE') { Disponible }
                  @case ('LOW_STOCK') { Pocas unidades }
                  @case ('UNAVAILABLE') { No disponible }
                }
              </p>
              
              <p><strong>Ejemplares disponibles:</strong> {{ book.availableAmount }} de {{ book.totalAmount }}</p>
              
              @if (book.publicationYear) {
                <p><strong>Año de publicación:</strong> {{ book.publicationYear }}</p>
              }
              
              @if (book.isbn) {
                <p><strong>ISBN:</strong> {{ book.isbn }}</p>
              }
            </div>
            
            @if (isAuthenticated && (book.bookStatus === 'AVAILABLE' || book.bookStatus === 'LOW_STOCK')) {
              <app-reservation-form
                [bookId]="book.bookId"
                [loading]="reservationLoading"
                [errorMessage]="reservationError"
                (createReservation)="onCreateReservation($event)">
              </app-reservation-form>
            } @else if (isAuthenticated && book.bookStatus === 'UNAVAILABLE') {
              <div class="unavailable-message">
                <p>Lo sentimos, este libro no está disponible para reserva en este momento.</p>
              </div>
            } @else if (!isAuthenticated) {
              <div class="login-message">
                <p>Debes iniciar sesión para reservar libros.</p>
                <a routerLink="/auth/login" class="login-button">Iniciar sesión</a>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
    
    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow-y: auto;
    }
    
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .sidebar-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.8rem;
      line-height: 1;
      cursor: pointer;
      color: #666;
    }
    
    .close-button:hover {
      color: #333;
    }
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #3498db;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 1rem;
      }
    }
    
    .error-message {
      text-align: center;
      color: #e74c3c;
      padding: 2rem;
      
      .retry-button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #2980b9;
        }
      }
    }
    
    .book-details {
      padding: 1.5rem;
    }
    
    .book-cover {
      height: 250px;
      background-size: cover;
      background-position: center;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .book-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }
    
    .book-info {
      margin-bottom: 2rem;
    }
    
    .book-info p {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
    
    .book-info .description {
      margin: 1rem 0;
      line-height: 1.6;
    }
    
    .book-info .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    .book-info .status.available {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .book-info .status.low_stock {
      background-color: #fff8e1;
      color: #f57f17;
    }
    
    .book-info .status.unavailable {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .unavailable-message {
      padding: 1rem;
      background-color: #ffebee;
      border-radius: 4px;
      color: #c62828;
      margin-top: 1.5rem;
    }
    
    .login-message {
      text-align: center;
      padding: 1.5rem;
      background-color: #e3f2fd;
      border-radius: 4px;
      margin-top: 1.5rem;
    }
    
    .login-button {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #2196f3;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .login-button:hover {
      background-color: #1976d2;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 85%;
      }
    }
  `]
})
export class BookDetailSidebarComponent implements OnChanges {
  @Input() bookId: number | null = null;
  @Input() book: Book | null = null;
  @Input() isAuthenticated: boolean = false;
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Input() reservationLoading: boolean = false;
  @Input() reservationError: string = '';
  
  @Output() closeRequest = new EventEmitter<void>();
  @Output() retryRequest = new EventEmitter<void>();
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  get isOpen(): boolean {
    return this.bookId !== null;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Cualquier lógica adicional al cambiar las propiedades
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
}