import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { BookService } from '../../../core/services/book.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { RandomCategoriesComponent } from '../../../shared/components/random-categories/random-categories.component';
import { BookListComponent } from '../../../shared/components/book-list/book-list.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { WelcomeCarouselComponent } from '../../../shared/components/welcome-carousel/welcome-carousel.component';
import { Book } from '../../../core/models/book.model';
import { ReservationCreate } from '../../../core/models/reservation.model';
import { BookDetailSidebarComponent } from '../../../shared/components/books/book-detail-sidebar/book-detail-sidebar.component';
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RandomCategoriesComponent, 
    BookListComponent, 
    SearchBarComponent,
    WelcomeCarouselComponent,
    BookDetailSidebarComponent
  ],
  template: `
    <!-- Carousel para todos los usuarios -->
    <app-welcome-carousel [userName]="userName"></app-welcome-carousel>

    <div class="container mx-auto px-4 py-6">
      <div class="mx-auto max-w-4xl text-center">
        
        
        
      </div>
      
      <!-- Content section -->
      <div class="mt-12">
        <!-- Search Bar -->
        <div class="mb-8 mx-auto max-w-2xl">
          <app-search-bar 
            placeholder="Buscar libros..." 
            [allowEmptySearch]="true"
            (search)="onSearch($event)">
          </app-search-bar>
        </div>

        <!-- Categories -->
        <div class="mb-8">
          <app-random-categories
            (categorySelected)="onCategorySelected($event)">
          </app-random-categories>
        </div>

        <!-- Books List -->
        <div>
          <app-book-list
            [selectedCategoryId]="selectedCategoryId"
            [searchQuery]="searchQuery"
            (bookSelected)="onBookSelected($event)">
          </app-book-list>
        </div>
      </div>
    </div>

    <!-- Sidebar para detalles del libro -->
    <app-book-detail-sidebar
      [bookId]="selectedBookId"
      [book]="selectedBook"
      [isAuthenticated]="isAuthenticated"
      [loading]="bookLoading"
      [error]="bookError"
      [reservationLoading]="reservationLoading"
      [reservationError]="reservationError"
      (closeRequest)="closeSidebar()"
      (retryRequest)="retryLoadBook()"
      (createReservation)="createReservation($event)">
    </app-book-detail-sidebar>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  
  // Propiedades para autenticación
  isAuthenticated = false;
  userName = '';
  
  // Propiedades para filtrado
  selectedCategoryId: number | null = null;
  searchQuery: string = '';
  
  // Propiedades para el sidebar de detalles
  selectedBookId: number | null = null;
  selectedBook: Book | null = null;
  bookLoading = false;
  bookError = '';
  reservationLoading = false;
  reservationError = '';
  
  constructor(
    private bookService: BookService,
    private reservationService: ReservationService
  ) {}
  
  ngOnInit(): void {
    // Inicializar isAuthenticated
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Suscribirse a los cambios del usuario
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.userName = user?.userName || '';
    });
  }

  // Método para manejar la selección de categoría
  onCategorySelected(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    // Al seleccionar una categoría, limpiamos la búsqueda anterior
    this.searchQuery = '';
  }

  // Método para manejar la búsqueda
  onSearch(query: string): void {
    this.searchQuery = query;
    // Al hacer una búsqueda, limpiamos el filtro de categoría
    this.selectedCategoryId = null;
  }
  
  // Método para manejar la selección de un libro
  onBookSelected(bookId: number): void {
    this.selectedBookId = bookId;
    this.loadBookDetails(bookId);
  }
  
  // Cargar detalles del libro
  loadBookDetails(bookId: number): void {
    this.bookLoading = true;
    this.bookError = '';
    this.reservationError = '';
    
    this.bookService.getBookById(bookId).subscribe({
      next: (book) => {
        this.selectedBook = book;
        this.bookLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles del libro:', err);
        this.bookLoading = false;
        this.bookError = 'No se pudieron cargar los detalles del libro.';
      }
    });
  }
  
  // Reintentar cargar el libro
  retryLoadBook(): void {
    if (this.selectedBookId) {
      this.loadBookDetails(this.selectedBookId);
    }
  }
  
  // Cerrar el sidebar
  closeSidebar(): void {
    this.selectedBookId = null;
    this.selectedBook = null;
    this.bookError = '';
    this.reservationError = '';
  }
  
  // Crear una reserva
  // Crear una reserva
createReservation(data: ReservationCreate): void {
  if (!this.isAuthenticated) {
    this.reservationError = 'Debes iniciar sesión para hacer una reserva.';
    return;
  }
  
  this.reservationLoading = true;
  this.reservationError = '';
  
  this.reservationService.createReservation(data).subscribe({
    next: (reservation) => {
      // Éxito en la reserva
      this.reservationLoading = false;
      
      // Mostrar notificación usando Bootstrap toasts
      this.showNotification('¡Reserva creada con éxito!', 'success');
      
      this.closeSidebar();
      this.retryLoadBook();
    },
    error: (err) => {
      this.reservationLoading = false;
      this.reservationError = err.message || 'Error al crear la reserva. Intente nuevamente.';
      
      // Mostrar notificación de error
      this.showNotification(this.reservationError, 'error');
    }
  });
}

// Método para mostrar notificaciones
private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
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