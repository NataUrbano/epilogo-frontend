import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationCreate } from '../../../../core/models/reservation.model';

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
  
  @Output() createReservation = new EventEmitter<ReservationCreate>();
  
  formData: ReservationCreate = {
    bookId: 0,
    expectedReturnDate: ''
  };
  
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