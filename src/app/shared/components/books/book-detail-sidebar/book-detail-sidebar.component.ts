import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationFormComponent } from '../../reservations/reservation-form/reservation-form.component';
import { Book } from '../../../../core/models/book.model';
import { ReservationCreate } from '../../../../core/models/reservation.model';

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
  
  @Output() closeRequest = new EventEmitter<void>();
  @Output() retryRequest = new EventEmitter<void>();
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  get isOpen(): boolean {
    return this.bookId !== null;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
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