import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="container-fluid px-0">
      <!-- Header & Search/Filter -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="h3 fw-bold mb-0">Gestión de Reservas</h1>
            </div>
            <div class="col-lg-6">
              <div class="d-flex justify-content-lg-end mt-3 mt-lg-0">
                <div class="position-relative me-2 flex-grow-1" style="max-width: 300px;">
                  <input 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    (input)="applyFilters()"
                    placeholder="Buscar por título o usuario..." 
                    class="form-control"
                  >
                  <button 
                    *ngIf="searchTerm" 
                    (click)="clearSearch()"
                    class="btn-close position-absolute top-50 end-0 translate-middle-y me-2 small"
                    type="button"
                    aria-label="Clear"
                  ></button>
                </div>
                <div class="dropdown ms-2">
                  <button class="btn btn-outline-primary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    Filtros
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end p-3" style="width: 250px;" aria-labelledby="filterDropdown">
                    <li>
                      <div class="mb-3">
                        <label class="form-label fw-medium">Estado</label>
                        <select class="form-select" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                          <option value="">Todos</option>
                          <option value="PENDING">Pendiente</option>
                          <option value="ACTIVE">Activa</option>
                          <option value="COMPLETED">Completada</option>
                          <option value="CANCELLED">Cancelada</option>
                        </select>
                      </div>
                    </li>
                    <li>
                      <div class="mb-3">
                        <label class="form-label fw-medium">Período</label>
                        <div class="d-flex gap-2">
                          <input 
                            type="date" 
                            class="form-control form-control-sm"
                            [(ngModel)]="startDate"
                            (change)="applyFilters()"
                          >
                          <input 
                            type="date" 
                            class="form-control form-control-sm"
                            [(ngModel)]="endDate"
                            (change)="applyFilters()"
                          >
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="overdueSwitch" 
                          [(ngModel)]="overdueOnly"
                          (change)="applyFilters()"
                        >
                        <label class="form-check-label" for="overdueSwitch">
                          Solo vencidas
                        </label>
                      </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button class="btn btn-outline-secondary btn-sm w-100" (click)="resetFilters()">
                        Limpiar filtros
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading spinner -->
      <div *ngIf="isLoading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!isLoading && filteredReservations.length === 0" class="card border-0 shadow-sm">
        <div class="card-body py-5 text-center">
          <div class="mb-3">
            <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
          </div>
          <h5 class="text-muted">No se encontraron reservas</h5>
          <p class="text-muted mb-0" *ngIf="hasFilters()">Prueba a cambiar los filtros de búsqueda</p>
        </div>
      </div>
      
      <!-- Reservations table -->
      <div *ngIf="!isLoading && filteredReservations.length > 0" class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="py-3">Libro</th>
                  <th class="py-3">Usuario</th>
                  <th class="py-3">Fecha de reserva</th>
                  <th class="py-3">Fecha de devolución</th>
                  <th class="py-3">Estado</th>
                  <th class="py-3 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reservation of filteredReservations" 
                    [ngClass]="{'table-danger': reservation.isOverdue && reservation.status === 'ACTIVE'}">
                  <td class="py-3">
                    <div class="d-flex align-items-center">
                      <img [src]="reservation.book.imageUrl || '/assets/images/default-book.jpg'"
                        class="me-3 rounded"
                        width="40"
                        height="60"
                        style="object-fit: cover;"
                        alt="Portada"
                      >
                      <div>
                        <p class="mb-0 fw-medium">{{ reservation.book.title }}</p>
                        <small class="text-muted">{{ reservation.book.authorName }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="py-3">
                    <div class="d-flex align-items-center">
                      <img 
                        [src]="reservation.user.imageUrl || '/assets/images/default-avatar.png'" 
                        class="rounded-circle me-2"
                        width="32"
                        height="32"
                        style="object-fit: cover;"
                        alt="Avatar"
                      >
                      <span>{{ reservation.user.userName }}</span>
                    </div>
                  </td>
                  <td class="py-3">{{ reservation.reservationDate | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3">
                    <div>
                      <p class="mb-0">{{ reservation.expectedReturnDate | date:'dd/MM/yyyy' }}</p>
                      <span *ngIf="reservation.isOverdue && reservation.status === 'ACTIVE'" class="badge bg-danger">Vencida</span>
                    </div>
                  </td>
                  <td class="py-3">
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': reservation.status === 'PENDING',
                      'bg-primary': reservation.status === 'ACTIVE',
                      'bg-success': reservation.status === 'COMPLETED',
                      'bg-secondary': reservation.status === 'CANCELLED'
                    }">
                      {{ getStatusText(reservation.status) }}
                    </span>
                  </td>
                  <td class="py-3 text-end">
                    <div class="btn-group">
                      <button 
                        *ngIf="reservation.status === 'PENDING'" 
                        (click)="activateReservation(reservation)"
                        class="btn btn-sm btn-outline-primary"
                        title="Activar"
                        [disabled]="reservation.processingCancel"
                      >
                        <i class="bi bi-check-circle"></i>
                      </button>
                      
                      <button 
                        *ngIf="reservation.status === 'ACTIVE'" 
                        (click)="openCompleteModal(reservation)"
                        class="btn btn-sm btn-outline-success"
                        title="Completar"
                        [disabled]="reservation.processingCancel"
                      >
                        <i class="bi bi-check-square"></i>
                      </button>
                      
                      <button 
                        *ngIf="reservation.status === 'PENDING' || reservation.status === 'ACTIVE'" 
                        (click)="openCancelModal(reservation)"
                        class="btn btn-sm btn-outline-danger"
                        title="Cancelar"
                        [disabled]="reservation.processingCancel"
                      >
                        <i class="bi bi-x-circle"></i>
                      </button>
                      
                      <button 
                        (click)="openDetailsModal(reservation)"
                        class="btn btn-sm btn-outline-secondary"
                        title="Ver detalles"
                      >
                        <i class="bi bi-info-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center">
          <div class="small text-muted">
            Mostrando {{ filteredReservations.length }} de {{ totalReservations }} reservas
          </div>
          <nav aria-label="Paginación de reservas" *ngIf="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage === 0">
                <button class="page-link" (click)="changePage(currentPage - 1)" aria-label="Anterior">
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              <ng-container *ngFor="let page of getPaginationRange()">
                <li class="page-item" [class.active]="page === currentPage">
                  <button class="page-link" (click)="changePage(page)">{{ page + 1 }}</button>
                </li>
              </ng-container>
              <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
                <button class="page-link" (click)="changePage(currentPage + 1)" aria-label="Siguiente">
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- Modal para completar reserva -->
      <div class="modal fade" [class.show]="showCompleteModal" [style.display]="showCompleteModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showCompleteModal" [attr.aria-hidden]="!showCompleteModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Completar Reserva</h5>
              <button type="button" class="btn-close" (click)="showCompleteModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedReservation">
              <p>Confirme la devolución del libro <strong>{{ selectedReservation.book.title }}</strong> por parte del usuario <strong>{{ selectedReservation.user.userName }}</strong>.</p>
              
              <div class="mb-3">
                <label for="returnDate" class="form-label">Fecha de devolución</label>
                <input 
                  type="date" 
                  id="returnDate"
                  class="form-control" 
                  [(ngModel)]="actualReturnDate"
                >
              </div>
              
              <div *ngIf="selectedReservation.isOverdue" class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Esta reserva está vencida. La fecha de devolución esperada era {{ selectedReservation.expectedReturnDate | date:'dd/MM/yyyy' }}.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showCompleteModal = false">Cancelar</button>
              <button type="button" class="btn btn-success" (click)="completeReservation()">Confirmar devolución</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showCompleteModal" [class.show]="showCompleteModal"></div>
      
      <!-- Modal para cancelar reserva -->
      <div class="modal fade" [class.show]="showCancelModal" [style.display]="showCancelModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showCancelModal" [attr.aria-hidden]="!showCancelModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger">Cancelar Reserva</h5>
              <button type="button" class="btn-close" (click)="showCancelModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedReservation">
              <p>¿Está seguro de que desea cancelar la reserva del libro <strong>{{ selectedReservation.book.title }}</strong> realizada por <strong>{{ selectedReservation.user.userName }}</strong>?</p>
              <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showCancelModal = false">Volver</button>
              <button type="button" class="btn btn-danger" (click)="cancelReservation()">Cancelar reserva</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showCancelModal" [class.show]="showCancelModal"></div>
      
      <!-- Modal para detalles de reserva -->
      <div class="modal fade" [class.show]="showDetailsModal" [style.display]="showDetailsModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showDetailsModal" [attr.aria-hidden]="!showDetailsModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles de Reserva</h5>
              <button type="button" class="btn-close" (click)="showDetailsModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedReservation">
              <div class="row">
                <div class="col-md-4 mb-3 mb-md-0">
                  <img 
                    [src]="selectedReservation.book.imageUrl || '/assets/images/default-book.jpg'" 
                    class="img-fluid rounded"
                    style="max-height: 200px; width: 100%; object-fit: cover;"
                    alt="Portada"
                  >
                </div>
                <div class="col-md-8">
                  <h5 class="mb-1">{{ selectedReservation.book.title }}</h5>
                  <p class="text-muted mb-3">{{ selectedReservation.book.authorName }}</p>
                  
                  <div class="mb-2">
                    <small class="text-muted d-block">ID de reserva</small>
                    <p class="mb-0">#{{ selectedReservation.reservationId }}</p>
                  </div>
                  
                  <div class="mb-2">
                    <small class="text-muted d-block">Estado</small>
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': selectedReservation.status === 'PENDING',
                      'bg-primary': selectedReservation.status === 'ACTIVE',
                      'bg-success': selectedReservation.status === 'COMPLETED',
                      'bg-secondary': selectedReservation.status === 'CANCELLED'
                    }">
                      {{ getStatusText(selectedReservation.status) }}
                    </span>
                  </div>
                  
                  <div class="mb-2">
                    <small class="text-muted d-block">Usuario</small>
                    <div class="d-flex align-items-center">
                      <img 
                        [src]="selectedReservation.user.imageUrl || '/assets/images/default-avatar.png'" 
                        class="rounded-circle me-2"
                        width="24"
                        height="24"
                        style="object-fit: cover;"
                        alt="Avatar"
                      >
                      <span>{{ selectedReservation.user.userName }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <hr>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <small class="text-muted d-block">Fecha de reserva</small>
                  <p class="mb-0">{{ selectedReservation.reservationDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">Fecha esperada de devolución</small>
                  <p class="mb-0">{{ selectedReservation.expectedReturnDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="col-md-6" *ngIf="selectedReservation.actualReturnDate">
                  <small class="text-muted d-block">Fecha real de devolución</small>
                  <p class="mb-0">{{ selectedReservation.actualReturnDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="col-md-6" *ngIf="selectedReservation.isOverdue && selectedReservation.status === 'ACTIVE'">
                  <small class="text-muted d-block">Estado de devolución</small>
                  <span class="badge bg-danger">Vencida</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showDetailsModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showDetailsModal" [class.show]="showDetailsModal"></div>
    </div>
  `,
  styles: [`
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-backdrop {
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
    }
    
    .badge {
      font-weight: 500;
    }
    
    .table th {
      font-weight: 500;
      font-size: 0.85rem;
      text-transform: uppercase;
      color: #6c757d;
    }
    
    .table td {
      vertical-align: middle;
    }
    
    .dropdown-menu {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    }
    
    /* Responsive improvements */
    @media (max-width: 767.98px) {
      .table {
        min-width: 900px;
      }
      
      .btn-group .btn {
        padding: 0.25rem 0.5rem;
      }
    }
  `]
})
export class ReservationsListComponent implements OnInit {
  private reservationService = inject(ReservationService);
  
  // Datos de reservas
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  isLoading: boolean = true;
  
  // Filtros
  searchTerm: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';
  overdueOnly: boolean = false;
  
  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalReservations: number = 0;
  
  // Modales
  showCompleteModal: boolean = false;
  showCancelModal: boolean = false;
  showDetailsModal: boolean = false;
  selectedReservation: Reservation | null = null;
  actualReturnDate: string = '';
  
  ngOnInit(): void {
    this.loadReservations();
    
    // Suscribirse a actualizaciones de reservas
    this.reservationService.reservationsUpdated$.subscribe(() => {
      this.loadReservations();
    });
  }
  
  loadReservations(): void {
    this.isLoading = true;
    
    const filters = {
      status: this.selectedStatus as ReservationStatus | undefined,
      startDate: this.startDate,
      endDate: this.endDate,
      overdueOnly: this.overdueOnly,
      page: this.currentPage,
      size: this.pageSize
    };
    
    this.reservationService.searchReservations(filters).subscribe({
      next: (response) => {
        this.reservations = response.content.map((reservation: Reservation) => ({
          ...reservation,
          processingCancel: false
        }));
        this.totalReservations = response.totalElements;
        this.totalPages = response.totalPages;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredReservations = [...this.reservations];
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredReservations = this.reservations.filter(reservation => 
      reservation.book.title.toLowerCase().includes(search) ||
      reservation.user.userName.toLowerCase().includes(search)
    );
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.overdueOnly = false;
    this.currentPage = 0;
    this.loadReservations();
  }
  
  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedStatus || this.startDate || this.endDate || this.overdueOnly);
  }
  
  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.loadReservations();
  }
  
  getPaginationRange(): number[] {
    const pages = [];
    const totalButtons = 5; // Número máximo de botones a mostrar
    
    if (this.totalPages <= totalButtons) {
      // Si hay menos páginas que totalButtons, mostrar todas
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calcular el rango para mostrar siempre 5 botones o menos
      const halfButtons = Math.floor(totalButtons / 2);
      let startPage = Math.max(0, this.currentPage - halfButtons);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + halfButtons);
      
      // Ajustar si estamos al inicio o al final
      if (startPage === 0) {
        endPage = Math.min(totalButtons - 1, this.totalPages - 1);
      } else if (endPage === this.totalPages - 1) {
        startPage = Math.max(0, this.totalPages - totalButtons);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
  
  openCompleteModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    // Establecer fecha de devolución por defecto como hoy
    this.actualReturnDate = new Date().toISOString().substring(0, 10);
    this.showCompleteModal = true;
  }
  
  openCancelModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showCancelModal = true;
  }
  
  openDetailsModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDetailsModal = true;
  }
  
  activateReservation(reservation: Reservation): void {
    if (!reservation || reservation.processingCancel) return;
    
    // Establecer bandera para evitar doble clic
    this.setReservationProcessing(reservation.reservationId, true);
    
    this.reservationService.activateReservation(reservation.reservationId).subscribe({
      next: () => {
        // La actualización se maneja a través del observable reservationsUpdated$
        this.setReservationProcessing(reservation.reservationId, false);
      },
      error: (error) => {
        console.error('Error al activar la reserva:', error);
        this.setReservationProcessing(reservation.reservationId, false);
        alert('Error al activar la reserva: ' + error.message);
      }
    });
  }
  
  completeReservation(): void {
    if (!this.selectedReservation || !this.actualReturnDate) {
      alert('Por favor, seleccione una fecha de devolución');
      return;
    }
    
    // Establecer bandera para evitar doble clic
    this.setReservationProcessing(this.selectedReservation.reservationId, true);
    
    this.reservationService.completeReservation(
      this.selectedReservation.reservationId,
      this.actualReturnDate
    ).subscribe({
      next: () => {
        // La actualización se maneja a través del observable reservationsUpdated$
        this.showCompleteModal = false;
        this.selectedReservation = null;
      },
      error: (error) => {
        console.error('Error al completar la reserva:', error);
        this.setReservationProcessing(this.selectedReservation!.reservationId, false);
        alert('Error al completar la reserva: ' + error.message);
      }
    });
  }
  
  cancelReservation(): void {
    if (!this.selectedReservation) return;
    
    // Establecer bandera para evitar doble clic
    this.setReservationProcessing(this.selectedReservation.reservationId, true);
    
    this.reservationService.cancelReservation(this.selectedReservation.reservationId).subscribe({
      next: () => {
        // La actualización se maneja a través del observable reservationsUpdated$
        this.showCancelModal = false;
        this.selectedReservation = null;
      },
      error: (error) => {
        console.error('Error al cancelar la reserva:', error);
        this.setReservationProcessing(this.selectedReservation!.reservationId, false);
        alert('Error al cancelar la reserva: ' + error.message);
      }
    });
  }
  
  private setReservationProcessing(reservationId: number, isProcessing: boolean): void {
    // Actualizar el estado de procesamiento para una reserva específica
    this.reservations = this.reservations.map(r => 
      r.reservationId === reservationId ? {...r, processingCancel: isProcessing} : r
    );
    this.filteredReservations = this.filteredReservations.map(r => 
      r.reservationId === reservationId ? {...r, processingCancel: isProcessing} : r
    );
  }
}