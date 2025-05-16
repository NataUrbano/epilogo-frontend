import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid dashboard-container p-0">
      <div class="row g-0 h-100">
        <!-- Sidebar -->
        <div 
          [ngClass]="{'d-none': sidebarCollapsed && isMobile, 
                      'col-auto sidebar-expanded': !sidebarCollapsed, 
                      'col-auto sidebar-collapsed': sidebarCollapsed && !isMobile}" 
          class="sidebar text-white shadow">
          
          <div class="sidebar-header d-flex align-items-center justify-content-between py-3 px-3">
            <h1 class="h5 fw-bold mb-0" [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Epilogo Admin</h1>
            <span *ngIf="sidebarCollapsed && !isMobile" class="h3 mb-0">E</span>
            <button (click)="toggleSidebar()" class="btn-close-white btn-sm d-md-none" type="button" aria-label="Close sidebar">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <hr class="border-light opacity-25 mx-3">
          
          <div class="sidebar-body px-2">
            <ul class="nav nav-pills flex-column mb-auto">
              <li class="nav-item mb-1">
                <a 
                  routerLink="/dashboard" 
                  routerLinkActive="active" 
                  [routerLinkActiveOptions]="{exact: true}"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-speedometer2 me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Dashboard</span>
                </a>
              </li>
              
              <!-- New Books Management Link -->
              <li class="nav-item mb-1">
                <a 
                  routerLink="/dashboard/books" 
                  routerLinkActive="active"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-book me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Libros</span>
                </a>
              </li>
              <!-- Authors Management Link (New) -->
              <li class="nav-item mb-1">
                <a 
                  routerLink="/dashboard/authors" 
                  routerLinkActive="active"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-person-vcard me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Autores</span>
                </a>
              </li>
              
              <li class="nav-item mb-1" *ngIf="hasAdminRole || hasLibrarianRole">
                <a 
                  routerLink="/dashboard/reservations" 
                  routerLinkActive="active"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-bookmark me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Reservas</span>
                </a>
              </li>
              
              <li class="nav-item mb-1" *ngIf="hasAdminRole">
                <a 
                  routerLink="/dashboard/users" 
                  routerLinkActive="active"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-people me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Usuarios</span>
                </a>
              </li>
              
              <li class="nav-item mb-1">
                <a 
                  routerLink="/dashboard/categories" 
                  routerLinkActive="active"
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-folder me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Categorías</span>
                </a>
              </li>
            </ul>
          </div>
          
          <hr class="border-light opacity-25 mx-3">
          
          <div class="sidebar-footer px-3 pb-3">
            <ul class="nav nav-pills flex-column">
              <li class="nav-item mb-1">
                <a 
                  routerLink="/" 
                  class="nav-link text-white d-flex align-items-center"
                >
                  <i class="bi bi-house me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Volver al sitio</span>
                </a>
              </li>
              
              <li class="nav-item">
                <button 
                  (click)="logout()" 
                  class="nav-link text-white w-100 text-start d-flex align-items-center"
                >
                  <i class="bi bi-box-arrow-right me-2"></i>
                  <span [ngClass]="{'d-none': sidebarCollapsed && !isMobile}">Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Main Content Area -->
        <div class="col dashboard-content p-0 d-flex flex-column min-vh-100">
          <!-- Topbar -->
          <nav class="navbar navbar-expand navbar-light bg-white shadow-sm py-2 px-3">
            <div class="container-fluid">
              <div class="d-flex align-items-center">
                <button class="btn btn-sm d-none d-md-block me-3" (click)="toggleSidebar()">
                  <i class="bi" [ngClass]="sidebarCollapsed ? 'bi-list' : 'bi-x'"></i>
                </button>
                <button class="btn btn-sm d-md-none me-3" (click)="toggleSidebar()">
                  <i class="bi bi-list"></i>
                </button>
                <span class="navbar-brand mb-0 h1">Panel de Administración</span>
              </div>
              
              <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="d-none d-md-block me-2">{{ currentUser?.userName }}</span>
                    <img 
                      [src]="currentUser?.imageUrl || '/assets/images/default-avatar.png'" 
                      alt="Avatar"
                      class="rounded-circle"
                      style="width: 32px; height: 32px; object-fit: cover;"
                    >
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="#">Mi perfil</a></li>
                    <li><a class="dropdown-item" href="#">Configuración</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" (click)="logout()">Cerrar sesión</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>
          
          <!-- Content -->
          <main class="flex-grow-1 overflow-auto bg-light p-3 p-md-4">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
    }
    
    .sidebar {
      transition: all 0.3s ease;
      z-index: 1;
      min-height: 100vh;
      background-color: var(--primary);
    }
    
    .sidebar-expanded {
      width: 240px;
    }
    
    .sidebar-collapsed {
      width: 70px;
    }
    
    .sidebar .nav-link {
      border-radius: 0.5rem;
      padding: 0.675rem 1rem;
      margin: 0.2rem 0;
      white-space: nowrap;
    }
    
    .sidebar .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .sidebar .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .dashboard-content {
      transition: margin-left 0.3s ease;
    }
    
    @media (max-width: 767.98px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 240px;
        z-index: 1030;
      }
      
      .dashboard-content {
        margin-left: 0 !important;
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  
  sidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  currentUser: User | null = null;
  
  ngOnInit(): void {
    // Detectar si estamos en dispositivo móvil
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    // Inicializar el sidebar colapsado en móvil
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
    
    // Nos suscribimos al observable del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // También obtenemos la información actualizada del usuario
    this.authService.getCurrentUserInfo();
  }
  
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }
  
  // Comprobamos si el usuario tiene rol de administrador para mostrar ciertas opciones
  get hasAdminRole(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  // Comprobamos si el usuario tiene rol de bibliotecario
  get hasLibrarianRole(): boolean {
    return this.authService.hasRole('ROLE_LIBRARIAN');
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  logout(): void {
    this.authService.logout();
  }
}