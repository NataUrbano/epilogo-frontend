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

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-0">
      <!-- Header Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h1 class="h3 fw-bold mb-1">Bienvenido, {{ currentUserName }}</h1>
                  <p class="text-muted mb-0">Aquí tienes un resumen de tu plataforma</p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                  <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    {{ today | date:'EEEE, d MMMM yyyy' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats Cards Section -->
      <div class="row g-3 mb-4">
        <!-- Tarjeta de Usuarios (solo para administradores) -->
        <div class="col-sm-6 col-lg-3" *ngIf="hasAdminRole">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted small text-uppercase fw-medium mb-1">Usuarios</p>
                  <h3 class="card-title h2 fw-bold mb-0">{{ userCount }}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-people text-primary fs-4"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i *ngIf="userTrend > 0" class="bi bi-arrow-up-short text-success me-1"></i>
                <i *ngIf="userTrend < 0" class="bi bi-arrow-down-short text-danger me-1"></i>
                <span *ngIf="userTrend !== 0" [ngClass]="userTrend > 0 ? 'text-success' : 'text-danger'" class="small fw-medium">
                  {{ userTrend > 0 ? '+' : '' }}{{ userTrend }}% este mes
                </span>
                <span *ngIf="userTrend === 0" class="text-muted small">Sin cambios este mes</span>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <a routerLink="/dashboard/users" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
                <span class="small fw-medium">Ver detalles</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Tarjeta de Reservas (para administratores y bibliotecarios) -->
        <div class="col-sm-6 col-lg-3" *ngIf="hasAdminRole || hasLibrarianRole">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted small text-uppercase fw-medium mb-1">Reservas</p>
                  <h3 class="card-title h2 fw-bold mb-0">{{ reservationCount }}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-bookmark text-primary fs-4"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <span class="badge bg-danger me-2">{{ overdueReservationsCount }}</span>
                <span class="text-danger small fw-medium">Vencidas</span>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <a routerLink="/dashboard/reservations" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
                <span class="small fw-medium">Ver reservas</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Tarjeta de Categorías -->
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted small text-uppercase fw-medium mb-1">Categorías</p>
                  <h3 class="card-title h2 fw-bold mb-0">{{ categoryCount }}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-folder text-primary fs-4"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i *ngIf="categoryTrend > 0" class="bi bi-arrow-up-short text-success me-1"></i>
                <i *ngIf="categoryTrend < 0" class="bi bi-arrow-down-short text-danger me-1"></i>
                <span *ngIf="categoryTrend !== 0" [ngClass]="categoryTrend > 0 ? 'text-success' : 'text-danger'" class="small fw-medium">
                  {{ categoryTrend > 0 ? '+' : '' }}{{ categoryTrend }}% este mes
                </span>
                <span *ngIf="categoryTrend === 0" class="text-muted small">Sin cambios este mes</span>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <a routerLink="/dashboard/categories" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
                <span class="small fw-medium">Ver detalles</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Tarjeta de Libros (ejemplo adicional) -->
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted small text-uppercase fw-medium mb-1">Libros</p>
                  <h3 class="card-title h2 fw-bold mb-0">{{ bookCount }}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-book text-primary fs-4"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="bi bi-arrow-up-short text-success me-1"></i>
                <span class="text-success small fw-medium">+12% este mes</span>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <a href="#" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
                <span class="small fw-medium">Ver detalles</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
        <!-- Tarjeta de Autores -->
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted small text-uppercase fw-medium mb-1">Autores</p>
                  <h3 class="card-title h2 fw-bold mb-0">{{ authorCount }}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-person-vcard text-primary fs-4"></i>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="bi bi-arrow-up-short text-success me-1"></i>
                <span class="text-success small fw-medium">+5% este mes</span>
              </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
              <a routerLink="/dashboard/authors" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
                <span class="small fw-medium">Ver detalles</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reservaciones recientes (para administradores y bibliotecarios) -->
      <div class="row mb-4" *ngIf="hasAdminRole || hasLibrarianRole">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-semibold">Reservas recientes</h5>
              <a routerLink="/dashboard/reservations" class="btn btn-sm btn-outline-primary">
                Ver todas
              </a>
            </div>
            <div class="card-body p-0">
              <div *ngIf="isLoadingReservations" class="d-flex justify-content-center py-4">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>
              
              <div *ngIf="!isLoadingReservations && recentReservations.length === 0" class="py-4 text-center">
                <p class="text-muted mb-0">No hay reservas recientes</p>
              </div>
              
              <div *ngIf="!isLoadingReservations && recentReservations.length > 0" class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="py-2">Libro</th>
                      <th class="py-2">Usuario</th>
                      <th class="py-2">Fecha de reserva</th>
                      <th class="py-2">Estado</th>
                      <th class="py-2 text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let reservation of recentReservations" 
                        [ngClass]="{'table-danger': reservation.isOverdue && reservation.status === 'ACTIVE'}">
                      <td class="py-2">
                        <div class="d-flex align-items-center">
                          <img 
                            [src]="reservation.book.imageUrl || '/assets/images/default-book.jpg'" 
                            class="me-2 rounded"
                            width="30"
                            height="45"
                            style="object-fit: cover;"
                            alt="Portada"
                          >
                          <span class="small">{{ reservation.book.title }}</span>
                        </div>
                      </td>
                      <td class="py-2">
                        <div class="d-flex align-items-center">
                          <img 
                            [src]="reservation.user.imageUrl || '/assets/images/default-avatar.png'" 
                            class="rounded-circle me-2"
                            width="24"
                            height="24"
                            style="object-fit: cover;"
                            alt="Avatar"
                          >
                          <span class="small">{{ reservation.user.userName }}</span>
                        </div>
                      </td>
                      <td class="py-2 small">{{ reservation.reservationDate | date:'dd/MM/yyyy' }}</td>
                      <td class="py-2">
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': reservation.status === 'PENDING',
                          'bg-primary': reservation.status === 'ACTIVE',
                          'bg-success': reservation.status === 'COMPLETED',
                          'bg-secondary': reservation.status === 'CANCELLED'
                        }">
                          {{ getStatusText(reservation.status) }}
                        </span>
                      </td>
                      <td class="py-2 text-end">
                        <a routerLink="/dashboard/reservations" class="btn btn-sm btn-outline-secondary">
                          <i class="bi bi-eye"></i>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de gráficas e información -->
      <div class="row g-4 mb-4">
        <!-- Gráfico de actividad (placeholder) -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold">Actividad reciente</h5>
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn btn-primary">Mensual</button>
                  <button type="button" class="btn btn-light">Semanal</button>
                  <button type="button" class="btn btn-light">Diario</button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex flex-column align-items-center justify-content-center h-100" style="min-height: 300px;">
                <i class="bi bi-bar-chart-line text-light fs-1 mb-3" style="font-size: 3rem;"></i>
                <h5 class="text-muted">Próximamente: Gráficas de actividad</h5>
                <p class="text-muted small">Las estadísticas de actividad estarán disponibles pronto</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actividades recientes -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <h5 class="mb-0 fw-semibold">Actividades recientes</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 border-start border-4 border-primary ps-3 py-3">
                  <p class="mb-1 small">Se creó una nueva categoría <span class="fw-medium">Literatura Infantil</span></p>
                  <small class="text-muted">Hace 2 horas</small>
                </div>
                <div class="list-group-item border-0 border-start border-4 border-success ps-3 py-3">
                  <p class="mb-1 small">Se añadió un nuevo libro <span class="fw-medium">Cien años de soledad</span></p>
                  <small class="text-muted">Hace 5 horas</small>
                </div>
                <div class="list-group-item border-0 border-start border-4 border-warning ps-3 py-3">
                  <p class="mb-1 small">Usuario <span class="fw-medium">carlos_martinez</span> se registró</p>
                  <small class="text-muted">Hace 1 día</small>
                </div>
                <div class="list-group-item border-0 border-start border-4 border-info ps-3 py-3">
                  <p class="mb-1 small">Se actualizó la categoría <span class="fw-medium">Ciencia Ficción</span></p>
                  <small class="text-muted">Hace 2 días</small>
                </div>
                <div class="list-group-item border-0 border-start border-4 border-danger ps-3 py-3">
                  <p class="mb-1 small">Se añadió un nuevo autor <span class="fw-medium">Isabel Allende</span></p>
                  <small class="text-muted">Hace 3 días</small>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-top text-center py-3">
              <button class="btn btn-link btn-sm text-decoration-none text-primary fw-medium">
                Ver todas las actividades
              </button>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p class="text-muted small text-uppercase fw-medium mb-1">Libros</p>
                <h3 class="card-title h2 fw-bold mb-0">{{ bookCount }}</h3>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                <i class="bi bi-book text-primary fs-4"></i>
              </div>
            </div>
            <div class="d-flex align-items-center mt-2">
              <i class="bi bi-arrow-up-short text-success me-1"></i>
              <span class="text-success small fw-medium">+12% este mes</span>
            </div>
          </div>
          <div class="card-footer bg-white border-top py-3">
            <a routerLink="/dashboard/books" class="d-flex justify-content-between align-items-center text-decoration-none text-primary">
              <span class="small fw-medium">Ver detalles</span>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Sección de tarjetas informativas -->
      <div class="row g-4">
        <!-- Tarjeta de tareas por hacer -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-semibold">Tareas por hacer</h5>
              <span class="badge bg-primary rounded-pill">{{ pendingTasks }}</span>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="form-check bg-light rounded p-3 mb-2">
                  <input class="form-check-input" type="checkbox" id="task1">
                  <label class="form-check-label small" for="task1">
                    Actualizar descripciones de categorías
                  </label>
                </div>
                <div class="form-check bg-light rounded p-3 mb-2">
                  <input class="form-check-input" type="checkbox" id="task2">
                  <label class="form-check-label small" for="task2">
                    Revisar nuevos registros de usuarios
                  </label>
                </div>
                <div class="form-check bg-light rounded p-3">
                  <input class="form-check-input" type="checkbox" id="task3">
                  <label class="form-check-label small" for="task3">
                    Subir imágenes para libros nuevos
                  </label>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-top text-center py-3">
              <button class="btn btn-link btn-sm text-decoration-none text-primary fw-medium">
                Ver todas las tareas
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tarjeta de notificaciones del sistema -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-semibold">Notificaciones del sistema</h5>
              <span class="badge bg-danger rounded-pill">2</span>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 bg-danger bg-opacity-10 text-danger p-3">
                  <div class="d-flex">
                    <i class="bi bi-exclamation-circle me-2 mt-1"></i>
                    <div>
                      <p class="small fw-medium mb-1">Es necesario actualizar a la versión 2.0</p>
                      <p class="small mb-0">Hay importantes actualizaciones de seguridad disponibles</p>
                    </div>
                  </div>
                </div>
                <div class="list-group-item border-0 bg-warning bg-opacity-10 text-warning p-3">
                  <div class="d-flex">
                    <i class="bi bi-exclamation-triangle me-2 mt-1"></i>
                    <div>
                      <p class="small fw-medium mb-1">Copias de seguridad no configuradas</p>
                      <p class="small mb-0">Configure las copias de seguridad automáticas</p>
                    </div>
                  </div>
                </div>
                <div class="list-group-item border-0 bg-light p-3">
                  <div class="d-flex">
                    <i class="bi bi-info-circle me-2 mt-1 text-muted"></i>
                    <div>
                      <p class="small fw-medium mb-1 text-dark">Mantenimiento programado</p>
                      <p class="small mb-0 text-muted">15 de mayo, 2:00 AM - 4:00 AM (GMT-5)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bi {
      line-height: 1;
    }
    
    .card {
      transition: all 0.2s ease;
    }
    
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
    }
    
    .list-group-item {
      transition: background-color 0.2s ease;
    }
    
    .list-group-item:hover {
      background-color: rgba(0, 0, 0, 0.01);
    }
    
    @media (max-width: 767.98px) {
      .table {
        min-width: 800px;
      }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private bookService = inject(BookService);
  private authorService = inject(AuthorService);
  
  // Datos para las tarjetas
  userCount: number = 0;
  categoryCount: number = 0;
  bookCount: number = 25; // Ejemplo estático
  authorCount: number = 12; // Ejemplo estático
  
  
  // Datos de reservas
  reservationCount: number = 0;
  overdueReservationsCount: number = 0;
  recentReservations: Reservation[] = [];
  isLoadingReservations: boolean = false;
  
  // Tendencias (ejemplos estáticos, idealmente vendrían de la API)
  userTrend: number = 8;
  categoryTrend: number = 3;
  
  // Tareas pendientes (ejemplo estático)
  pendingTasks: number = 3;
  
  // Fecha actual
  today: Date = new Date();
  
  // Nombre del usuario actual
  currentUserName: string = '';
  
  get hasAdminRole(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  get hasLibrarianRole(): boolean {
    return this.authService.hasRole('ROLE_LIBRARIAN');
  }
  
  ngOnInit(): void {
    // Cargamos los datos necesarios
    this.loadDashboardData();
    
    // Obtenemos el nombre del usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = user.userName;
      }
    });
  }
  
  private loadDashboardData(): void {
    // Si el usuario es administrador, cargamos el conteo de usuarios
    if (this.hasAdminRole) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.userCount = users.length;
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
        }
      });
    }
    
    // Cargamos el conteo de categorías
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categoryCount = categories.length;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });

    // Cargamos el conteo de libros
  this.bookService.searchBooks({
    page: 0,
    size: 1
  }).subscribe({
    next: (response) => {
      this.bookCount = response.totalElements;
    },
    error: (error) => {
      console.error('Error al cargar libros:', error);
    }
  });

    // Cargamos el conteo de autores
  this.authorService.getAllAuthors().subscribe({
    next: (authors) => {
      this.authorCount = authors.length;
    },
    error: (error) => {
      console.error('Error al cargar autores:', error);
    }
  });
    
    // Si el usuario es administrador o bibliotecario, cargamos datos de reservas
    if (this.hasAdminRole || this.hasLibrarianRole) {
      this.loadReservationsData();
    }
  }

  
  
  private loadReservationsData(): void {
    this.isLoadingReservations = true;
    
    // Cargar reservas recientes
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
        console.error('Error al cargar reservas:', error);
        this.isLoadingReservations = false;
      }
    });
    
    // Cargar reservas vencidas
    this.reservationService.getOverdueReservations().subscribe({
      next: (overdueReservations) => {
        this.overdueReservationsCount = overdueReservations.length;
      },
      error: (error) => {
        console.error('Error al cargar reservas vencidas:', error);
      }
    });
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'Pendiente';
      case ReservationStatus.ACTIVE:
        return 'Activa';
      case ReservationStatus.COMPLETED:
        return 'Completada';
      case ReservationStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }
}