import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService); 
  private elementRef = inject(ElementRef);
  private translateService = inject(TranslateService);
  
  // Estado usando propiedades regulares en lugar de signals
  isMenuOpen = false;
  isMobileMenuOpen = false;
  isNavCollapsed = false;
  showNavExpander = false;
  currentUser: User | null = null;
  isAuthenticated = false;
  selectedCategoryId: number | null = null;
  searchQuery: string = '';
  

    get hasAdminOrLibrarianRole(): boolean {
  return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_LIBRARIAN');
}


  constructor(private viewportScroller: ViewportScroller,private router: Router) {}

  goToLibros() {
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        this.waitAndScroll('libros-seccion');
      });
    } else {
      this.waitAndScroll('libros-seccion');
    }
  }
  
  private waitAndScroll(anchor: string, retries = 10) {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (retries > 0) {
      setTimeout(() => this.waitAndScroll(anchor, retries - 1), 100);
    }
  }
  
  
  // Propiedades para el selector de idioma
  isLanguageMenuOpen = false;
  currentLanguage: string = 'es';
  
  // Variable para evitar múltiples activaciones durante el scroll
  private scrollTimeout: any = null;
  
  // Detectar scroll para ocultar/mostrar el segundo nivel
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Evitar múltiples activaciones durante el scroll con un debounce
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Usar un umbral más alto para evitar cambios con pequeños scrolls
      if (scrollPosition > 150 && !this.isNavCollapsed) {
        this.isNavCollapsed = true;
        this.showNavExpander = true;
      } else if (scrollPosition <= 50 && this.isNavCollapsed) {
        // Umbral más bajo para regresar, evitando la zona "intermedia"
        this.isNavCollapsed = false;
        this.showNavExpander = false;
      }
    }, 100); // Pequeño retraso para suavizar la detección
  }
  
  ngOnInit(): void {


    // Inicializar idioma
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'es';
    this.translateService.use(this.currentLanguage);
    
    // Verificar autenticación inicial
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Suscribirse a cambios de usuario
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = this.authService.isAuthenticated();
    });
    
    // Cerrar menú cuando se hace clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // No cerrar el menú si se hizo clic en el botón de usuario o dentro del menú
      if (this.isMenuOpen && 
          !this.elementRef.nativeElement.querySelector('#userDropdown').contains(target) && 
          !this.elementRef.nativeElement.querySelector('.dropdown-menu')?.contains(target)) {
        this.closeMenu();
      }
      
      // Cerrar menú de idioma si se hace clic fuera
      if (this.isLanguageMenuOpen && 
          !this.elementRef.nativeElement.querySelector('#languageDropdown').contains(target) && 
          !this.elementRef.nativeElement.querySelector('.dropdown-menu')?.contains(target)) {
        this.closeLanguageMenu();
      }
    });
  }
  
  getUserInitials(): string {
    if (!this.currentUser?.userName) return '';
    
    const nameParts = this.currentUser.userName.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
  }
  
  toggleMenu(event: Event): void {
    event.stopPropagation(); // Evitar que el evento se propague al document
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  closeMenu(): void {
    this.isMenuOpen = false;
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
  
  toggleNavCollapse(): void {
    this.isNavCollapsed = !this.isNavCollapsed;
  }
  
  // Métodos para el selector de idioma
  toggleLanguageMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  closeLanguageMenu(): void {
    this.isLanguageMenuOpen = false;
  }

  changeLanguage(lang: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.currentLanguage = lang;
    this.translateService.use(lang);
    localStorage.setItem('selectedLanguage', lang);
    this.closeLanguageMenu();
  }

  getCurrentLanguageDisplay(): string {
    const languages: { [key: string]: string } = {
      'es': 'ES',
      'en': 'EN',
      'fr': 'FR'
    };
    return languages[this.currentLanguage] || 'ES';
  }
  
  logout(event: Event): void {
    event.preventDefault();
    this.closeMenu();
    this.closeMobileMenu();
    this.authService.logout();
  }
  
  // Método para manejar la búsqueda
  onSearch(searchQuery: string): void {
    // Navegar al home con el parámetro de búsqueda
    this.router.navigate(['/'], { 
      queryParams: { query: searchQuery.trim() || null },
      queryParamsHandling: 'merge'
    });
  }
}