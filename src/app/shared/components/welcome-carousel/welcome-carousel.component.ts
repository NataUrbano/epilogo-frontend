import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  templateUrl: './welcome-carousel.component.html',
  styleUrls: ['./welcome-carousel.component.css']
})
export class WelcomeCarouselComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  
  private translateService = inject(TranslateService);
  
  slides: CarouselSlide[] = [];
  currentSlide = 0;
  autoPlayInterval: any;
  langSubscription: Subscription | null = null;

  private welcomeMessageKeys = [
    'CAROUSEL.MESSAGE_1',
    'CAROUSEL.MESSAGE_2',
    'CAROUSEL.MESSAGE_3',
    'CAROUSEL.MESSAGE_4',
    'CAROUSEL.MESSAGE_5'
  ];

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
    
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  initializeSlides(): void {
    this.slides = [];
    
    const numSlides = Math.floor(Math.random() * 3) + 3;
    
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
    }, 6000);
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