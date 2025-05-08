import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { TranslateService, TranslateStore } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-gray-50">
      <app-header></app-header>
      
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer/>
    </div>
  `,
  styles: [],
  // TranslateStore ya está proporcionado globalmente en provideTranslation,
  // así que no es necesario duplicarlo aquí, pero dejarlo no causa problemas
  providers: [TranslateStore]
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  constructor(private translate: TranslateService) {
    // Configuración más sencilla
    translate.setDefaultLang('es');
    
    // Detectar idioma del navegador o usar el guardado
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      translate.use(savedLang);
    } else {
      const browserLang = translate.getBrowserLang();
      translate.use(browserLang?.match(/es|en/) ? browserLang : 'es');
    }
  }
}