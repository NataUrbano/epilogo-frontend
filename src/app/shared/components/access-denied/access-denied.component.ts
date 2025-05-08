import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
            <div class="security-badge mb-4">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h1 class="display-3 fw-bold text-danger mb-4">403</h1>
            <h2 class="fw-light mb-3">Acceso restringido</h2>
            <p class="lead text-muted mb-4">
              No tienes permisos para acceder a esta página. Si crees que esto es un error,
              por favor contáctanos o inicia sesión con una cuenta que tenga los permisos necesarios.
            </p>
            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-start">
              <a routerLink="/" class="btn btn-primary px-4 py-2">
                <i class="bi bi-house-door me-2"></i>Volver al inicio
              </a>
              <a routerLink="/auth/login" class="btn btn-outline-secondary px-4 py-2">
                <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
              </a>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <div class="position-relative">
              <!-- SVG de ilustración interactiva 403 -->
              <svg width="100%" height="350" viewBox="0 0 650 350" xmlns="http://www.w3.org/2000/svg">
                <!-- Fondo con gradiente -->
                <rect width="100%" height="100%" fill="#f8f9fa" />
                <ellipse cx="325" cy="175" rx="180" ry="150" fill="#feebee" />
                
                <!-- Fortaleza de seguridad -->
                <g class="security-fortress" transform="translate(325, 180)">
                  <!-- Base de la fortaleza -->
                  <rect x="-120" y="0" width="240" height="60" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                  
                  <!-- Torres de la fortaleza -->
                  <g class="tower-left">
                    <rect x="-100" y="-120" width="40" height="120" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="-110" y="-130" width="60" height="10" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="-90" y="-80" width="20" height="30" rx="3" fill="#dee2e6" />
                  </g>
                  
                  <g class="tower-center">
                    <rect x="-20" y="-140" width="40" height="140" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="-30" y="-150" width="60" height="10" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="-10" y="-90" width="20" height="30" rx="3" fill="#dee2e6" />
                  </g>
                  
                  <g class="tower-right">
                    <rect x="60" y="-120" width="40" height="120" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="50" y="-130" width="60" height="10" rx="5" fill="#ffffff" stroke="#dc3545" stroke-width="2" />
                    <rect x="70" y="-80" width="20" height="30" rx="3" fill="#dee2e6" />
                  </g>
                  
                  <!-- Puerta blindada -->
                  <g class="secure-door">
                    <rect x="-25" y="-40" width="50" height="70" rx="5" fill="#dc3545" />
                    <circle cx="15" cy="-5" r="5" fill="#ffc107" /> <!-- Cerradura -->
                    <rect x="-15" y="-25" width="30" height="10" rx="2" fill="#6c757d" /> <!-- Escáner -->
                  </g>
                  
                  <!-- Candado flotante -->
                  <g class="floating-lock" transform="translate(0, -190)">
                    <rect x="-15" y="0" width="30" height="25" rx="5" fill="#dc3545" />
                    <rect x="-25" y="-15" width="50" height="15" rx="5" fill="#dc3545" />
                    <circle cx="0" cy="12" r="6" fill="#6c757d" />
                    <rect x="-1" y="9" width="2" height="6" fill="#ffffff" />
                  </g>
                </g>
                
                <!-- Texto 403 -->
                <g class="floating-text">
                  <text x="325" y="300" font-family="Arial" font-size="24" font-weight="bold" fill="#6c757d" text-anchor="middle">Acceso Restringido</text>
                </g>
                
                <!-- Elementos de seguridad adicionales -->
                <g class="security-elements">
                  <circle cx="180" cy="100" r="10" fill="#e0e0e0" stroke="#dc3545" stroke-width="1" />
                  <circle cx="180" cy="100" r="3" fill="#dc3545" />
                  
                  <circle cx="480" cy="80" r="10" fill="#e0e0e0" stroke="#dc3545" stroke-width="1" />
                  <circle cx="480" cy="80" r="3" fill="#dc3545" />
                  
                  <path d="M180,100 L480,80" stroke="#dc3545" stroke-width="1" stroke-dasharray="5,5" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
    }
    
    .security-badge {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      background-color: #feebee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .security-badge i {
      font-size: 40px;
      color: #dc3545;
    }
    
    .floating-lock {
      animation: pulse 2s ease-in-out infinite;
    }
    
    .security-elements {
      animation: scan 10s linear infinite;
    }
    
    .tower-left,
    .tower-right,
    .tower-center {
      animation: sway 6s ease-in-out infinite;
    }
    
    .tower-center {
      animation-delay: 1s;
    }
    
    .tower-right {
      animation-delay: 2s;
    }
    
    .floating-text {
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
    
    @keyframes scan {
      0% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.7;
      }
    }
    
    @keyframes sway {
      0%, 100% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(5px);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `]
})
export class AccessDeniedComponent {
  constructor() { }
}