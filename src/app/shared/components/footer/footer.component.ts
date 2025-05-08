import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  private translateService = inject(TranslateService);
  
  currentYear: number = new Date().getFullYear();
  
  // Para el formulario de suscripción
  email: string = '';
  
  // Para mostrar mensajes de éxito/error
  subscriptionMessage: string = '';
  subscriptionSuccess: boolean = false;
  
  constructor() { }
  
  ngOnInit(): void {
    // Si necesitas inicializar algo específico del footer aquí
  }
  
  onSubmit() {
    if (this.email && this.validateEmail(this.email)) {
      // Aquí iría la lógica para procesar la suscripción
      console.log('Email suscrito:', this.email);
      
      // Simular éxito de suscripción
      this.subscriptionSuccess = true;
      this.subscriptionMessage = this.translateService.instant('FOOTER.SUBSCRIPTION_SUCCESS');
      
      // Limpiar el formulario
      this.email = '';
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        this.subscriptionMessage = '';
      }, 3000);
      
    } else {
      // Mostrar error de validación
      this.subscriptionSuccess = false;
      this.subscriptionMessage = this.translateService.instant('FOOTER.INVALID_EMAIL');
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        this.subscriptionMessage = '';
      }, 3000);
    }
  }
  
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}