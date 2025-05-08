import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface CarouselSlide {
  imageUrl: string;
  titleKey: string;
  messageKey: string;
}

@Component({
  selector: 'app-welcome-carousel',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="carousel-container">
      <div class="carousel-slides" [style.transform]="'translateX(' + (-currentSlide * 100) + '%)'">
        @for (slide of slides; track $index) {
          <div class="carousel-slide">
            <div class="slide-content" [style.background-image]="'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(' + slide.imageUrl + ')'">
              <div class="slide-text">
                <h2>{{ slide.titleKey | translate:{userName: userName} }}</h2>
                <p>{{ slide.messageKey | translate }}</p>
              </div>
            </div>
          </div>
        }
      </div>
      
      <!-- Botones minimalistas y más elegantes -->
      <div class="carousel-indicators">
        @for (slide of slides; track $index) {
          <button 
            class="carousel-indicator" 
            [class.active]="currentSlide === $index"
            (click)="goToSlide($index)">
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .carousel-slides {
      display: flex;
      transition: transform 0.5s ease-in-out;
      height: 350px;
    }

    .carousel-slide {
      min-width: 100%;
      height: 100%;
    }

    .slide-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-size: cover;
      background-position: center;
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .slide-text {
      max-width: 800px;
      opacity: 0;
      animation: fadeIn 0.8s ease-in-out forwards;
      animation-delay: 0.3s;
    }

    .slide-text h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .slide-text p {
      font-size: 1.3rem;
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    /* Nuevos indicadores minimalistas al centro inferior */
    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    .carousel-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      cursor: pointer;
      transition: transform 0.3s ease, background-color 0.3s ease;
      padding: 0;
    }

    .carousel-indicator.active {
      background: white;
      transform: scale(1.3);
    }

    /* Animación para el texto */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .carousel-slides {
        height: 300px;
      }

      .slide-text h2 {
        font-size: 2rem;
      }

      .slide-text p {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 480px) {
      .carousel-slides {
        height: 250px;
      }

      .slide-text h2 {
        font-size: 1.5rem;
      }

      .slide-text p {
        font-size: 1rem;
      }
    }
  `]
})
export class WelcomeCarouselComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  
  private translateService = inject(TranslateService);
  
  slides: CarouselSlide[] = [];
  currentSlide = 0;
  autoPlayInterval: any;
  langSubscription: Subscription | null = null;

  // Claves de mensajes de bienvenida para traducción
  private welcomeMessageKeys = [
    'CAROUSEL.MESSAGE_1',
    'CAROUSEL.MESSAGE_2',
    'CAROUSEL.MESSAGE_3',
    'CAROUSEL.MESSAGE_4',
    'CAROUSEL.MESSAGE_5'
  ];

  // Imágenes de fondo para el carousel
  private backgroundImages = [
    './assets/images/library-1.jpg',
    './assets/images/books-1.jpg',
    './assets/images/reading-1.jpg',
    './assets/images/library-2.jpg',
    './assets/images/books-2.jpg'
  ];

  ngOnInit(): void {
    this.initializeSlides();
    this.startAutoPlay();
    
    // Suscribirse a cambios de idioma para recrear los slides
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      // No necesitamos regenerar los slides ya que usamos pipes de traducción
      // que se actualizan automáticamente
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  initializeSlides(): void {
    // Limpiamos slides existentes
    this.slides = [];
    
    // Creamos 3-5 slides con combinaciones aleatorias de mensajes e imágenes
    const numSlides = Math.floor(Math.random() * 3) + 3; // Entre 3 y 5 slides
    
    for (let i = 0; i < numSlides; i++) {
      const randomMessageIndex = Math.floor(Math.random() * this.welcomeMessageKeys.length);
      const randomImageIndex = Math.floor(Math.random() * this.backgroundImages.length);
      
      this.slides.push({
        imageUrl: this.backgroundImages[randomImageIndex],
        titleKey: this.getWelcomeTitleKey(),
        messageKey: this.welcomeMessageKeys[randomMessageIndex]
      });
    }
  }

  getWelcomeTitleKey(): string {
    if (this.userName) {
      return 'CAROUSEL.WELCOME_USER';
    } else {
      return 'CAROUSEL.WELCOME_GUEST';
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide === this.slides.length - 1) 
        ? 0 
        : this.currentSlide + 1;
    }, 6000); // Cambiar slide cada 6 segundos
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}