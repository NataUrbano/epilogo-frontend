import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
            <h1 class="display-3 fw-bold text-primary mb-4">404</h1>
            <h2 class="fw-light mb-3">¡Ups! No pudimos encontrar esta página</h2>
            <p class="lead text-muted mb-4">
              Parece que la página que estás buscando ha sido movida, eliminada o 
              nunca existió. No te preocupes, te ayudaremos a encontrar tu camino.
            </p>
            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-lg-start">
              <a routerLink="/" class="btn btn-primary px-4 py-2">
                <i class="bi bi-house-door me-2"></i>Volver al inicio
              </a>
              <a routerLink="/contacto" class="btn btn-outline-secondary px-4 py-2">
                <i class="bi bi-headset me-2"></i>Contactar soporte
              </a>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <div class="position-relative">
              <!-- SVG de ilustración interactiva 404 mejorada -->
              <svg width="100%" height="350" viewBox="0 0 650 350" xmlns="http://www.w3.org/2000/svg">
                <!-- Fondo con estrellas y elementos -->
                <rect width="100%" height="100%" fill="#FFFFFF" />
                <circle cx="325" cy="175" r="150" fill="#e9f2fe" />
                
                <!-- Elementos de fondo decorativos -->
                <g class="stars">
                  <circle cx="150" cy="100" r="2" fill="#6c757d" />
                  <circle cx="480" cy="80" r="3" fill="#6c757d" />
                  <circle cx="200" cy="230" r="3" fill="#6c757d" />
                  <circle cx="550" cy="220" r="2" fill="#6c757d" />
                  <circle cx="420" cy="280" r="3" fill="#6c757d" />
                  <circle cx="100" cy="280" r="2" fill="#6c757d" />
                  <circle cx="370" cy="50" r="2" fill="#6c757d" />
                </g>
                
                <!-- Planeta/Luna -->
                <circle cx="530" cy="90" r="40" fill="#dee2e6" />
                <circle cx="510" cy="80" r="10" fill="#ced4da" />
                <circle cx="550" cy="100" r="8" fill="#ced4da" />
                
                <!-- Astronauta perdido - CORREGIDO para posicionamiento -->
                <g class="astronaut">
                  <!-- Cuerpo del astronauta -->
                  <ellipse cx="325" cy="175" rx="45" ry="65" fill="#ffffff" stroke="#0d6efd" stroke-width="2" />
                  <!-- Visera -->
                  <ellipse cx="325" cy="150" rx="30" ry="25" fill="#f1f8ff" stroke="#0d6efd" stroke-width="2" />
                  <!-- Detalles del traje -->
                  <rect x="310" y="190" width="30" height="10" rx="5" fill="#0d6efd" />
                  <!-- Mochila de oxígeno -->
                  <rect x="275" y="155" width="15" height="40" rx="5" fill="#dee2e6" stroke="#0d6efd" stroke-width="1" />
                  <!-- Brazos -->
                  <path d="M282,175 Q265,215 285,245" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
                  <path d="M368,175 Q385,215 365,245" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
                  <!-- Señal de "?" flotante -->
                  <text x="325" y="95" font-family="Arial" font-size="80" font-weight="bold" fill="#0d6efd" text-anchor="middle">?</text>
                </g>
                
                <!-- Texto 404 flotante -->
                <g class="floating-text">
                  <text x="325" y="300" font-family="Arial" font-size="24" font-weight="bold" fill="#6c757d" text-anchor="middle">Página no encontrada</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
    }
    
    .astronaut {
      animation: float 6s ease-in-out infinite;
    }
    
    .stars circle {
      animation: twinkle 4s ease-in-out infinite;
      opacity: 0.6;
    }
    
    .stars circle:nth-child(odd) {
      animation-delay: 2s;
    }
    
    .floating-text {
      animation: float 5s ease-in-out infinite;
      animation-delay: 1s;
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-15px);
      }
    }
    
    @keyframes twinkle {
      0%, 100% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor() { }
}