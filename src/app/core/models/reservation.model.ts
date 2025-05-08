import { BookSummary } from './book.model';
import { UserProfile } from './user.model';

export interface Reservation {
  processingCancel: boolean;
  reservationId: number;
  user: UserProfile;
  book: BookSummary;
  reservationDate: string;
  expectedReturnDate: string;
  status: ReservationStatus;
  actualReturnDate?: string;
  isOverdue: boolean;
}

export interface ReservationCreate {
  bookId: number;
  expectedReturnDate: string;
}

export interface ReservationUpdate {
  status?: ReservationStatus;
  actualReturnDate?: string;
}

export interface ReservationSearch {
  userId?: number;
  bookId?: number;
  status?: ReservationStatus;
  overdueOnly?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}