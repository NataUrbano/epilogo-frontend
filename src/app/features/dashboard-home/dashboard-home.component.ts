import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { BookService } from '../../core/services/book.service';
import { ReservationStatus, Reservation } from '../../core/models/reservation.model';
import { AuthorService } from '../../core/services/author.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private bookService = inject(BookService);
  private authorService = inject(AuthorService);
  private translateService = inject(TranslateService);
  
  userCount: number = 0;
  categoryCount: number = 0;
  bookCount: number = 25;
  authorCount: number = 12;
  
  reservationCount: number = 0;
  overdueReservationsCount: number = 0;
  recentReservations: Reservation[] = [];
  isLoadingReservations: boolean = false;
  
  userTrend: number = 8;
  categoryTrend: number = 3;
  
  pendingTasks: number = 3;
  
  today: Date = new Date();
  
  currentUserName: string = '';
  
  get hasAdminRole(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  get hasLibrarianRole(): boolean {
    return this.authService.hasRole('ROLE_LIBRARIAN');
  }
  
  ngOnInit(): void {
    this.loadDashboardData();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = user.userName;
      }
    });
  }
  
  private loadDashboardData(): void {
    if (this.hasAdminRole) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.userCount = users.length;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
    }
    
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categoryCount = categories.length;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    this.bookService.searchBooks({
      page: 0,
      size: 1
    }).subscribe({
      next: (response) => {
        this.bookCount = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading books:', error);
      }
    });

    this.authorService.getAllAuthors().subscribe({
      next: (authors) => {
        this.authorCount = authors.length;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
      }
    });
    
    if (this.hasAdminRole || this.hasLibrarianRole) {
      this.loadReservationsData();
    }
  }
  
  private loadReservationsData(): void {
    this.isLoadingReservations = true;
    
    this.reservationService.searchReservations({
      page: 0,
      size: 5
    }).subscribe({
      next: (response) => {
        this.reservationCount = response.totalElements;
        this.recentReservations = response.content;
        this.isLoadingReservations = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.isLoadingReservations = false;
      }
    });
    
    this.reservationService.getOverdueReservations().subscribe({
      next: (overdueReservations) => {
        this.overdueReservationsCount = overdueReservations.length;
      },
      error: (error) => {
        console.error('Error loading overdue reservations:', error);
      }
    });
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return this.translateService.instant('RESERVATIONS.STATUS_PENDING');
      case ReservationStatus.ACTIVE:
        return this.translateService.instant('RESERVATIONS.STATUS_ACTIVE');
      case ReservationStatus.COMPLETED:
        return this.translateService.instant('RESERVATIONS.STATUS_COMPLETED');
      case ReservationStatus.CANCELLED:
        return this.translateService.instant('RESERVATIONS.STATUS_CANCELLED');
      default:
        return status;
    }
  }
}