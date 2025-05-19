import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { BookSearch, BookStatus, BookSummary } from '../../../core/models/book.model';
import { CategorySummary } from '../../../core/models/category.model';
import { finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit, OnChanges {
  private translateService = inject(TranslateService);
  @Input() selectedCategoryId: number | null = null;
  @Input() searchQuery: string = '';
  
  // Evento para la selección de un libro
  @Output() bookSelected = new EventEmitter<number>();
  
  books: BookSummary[] = [];
  loading = true;
  error = false;
  currentPage = 0;
  pageSize = 12;
  totalBooks = 0;
  totalPages = 0;
  searchParams: BookSearch = {
    page: 0,
    size: this.pageSize,
    sortBy: 'title',
    sortDirection: 'asc'
  };
  
  // Para mostrar el nombre de la categoría seleccionada
  selectedCategory: CategorySummary | null = null;
  
  BookStatus = BookStatus; // Para usar en el template
  
  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    let shouldReload = false;
    
    // Si cambia la categoría seleccionada
    if (changes['selectedCategoryId']) {
      this.searchParams.categoryId = this.selectedCategoryId || undefined;
      shouldReload = true;
      
      // Cargar info de la categoría para mostrar el nombre
      if (this.selectedCategoryId) {
        this.loadCategoryInfo(this.selectedCategoryId);
      } else {
        this.selectedCategory = null;
      }

      this.goToLibros();
      
    }
    
    // Si cambia la búsqueda
    if (changes['searchQuery']) {
      this.searchParams.query = this.searchQuery || undefined;
      shouldReload = true;
    }
    
    // Recargar libros si es necesario
    if (shouldReload) {
      this.currentPage = 0;
      this.searchParams.page = 0;
      this.loadBooks();
    }
  }

  loadBooks(): void {
    this.loading = true;
    this.error = false;
    
    this.bookService.searchBooks(this.searchParams)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.books = response.content;
          this.totalBooks = response.totalElements;
          this.totalPages = response.totalPages;
        },
        error: () => {
          this.error = true;
        }
      });
  }
  
  loadCategoryInfo(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId)
      .subscribe({
        next: (category) => {
          this.selectedCategory = {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            imageUrl: category.imageUrl
          };
        },
        error: () => {
          this.selectedCategory = null;
        }
      });
  }
  
  onPageChange(page: number): void {
    if (page !== this.currentPage && page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchParams.page = page;
      this.loadBooks();
    }
  }
  
  onSearch(query: string): void {
    this.searchParams.query = query || undefined;
    this.currentPage = 0;
    this.searchParams.page = 0;
    this.loadBooks();
  }
  
  onSortChange(event: Event): void {
    let value: string;
    
    // Determinamos si viene del select o del botón de dirección
    if (event instanceof Event && event.target) {
      const target = event.target as HTMLSelectElement;
      if (target.value) {
        value = target.value;
      } else {
        // Si no tiene value, es el botón de dirección, usamos el sortBy actual
        value = this.searchParams.sortBy || 'title';
      }
    } else {
      // Valor por defecto
      value = 'title';
    }
    
    if (this.searchParams.sortBy === value) {
      // Si el campo de ordenación es el mismo, cambiamos la dirección
      this.searchParams.sortDirection = 
        this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchParams.sortBy = value;
      this.searchParams.sortDirection = 'asc';
    }
    
    this.loadBooks();
  }
  
  clearCategoryFilter(): void {
    this.selectedCategoryId = null;
    this.selectedCategory = null;
    this.searchParams.categoryId = undefined;
    this.loadBooks();
  }
  
  clearSearchFilter(): void {
    this.searchParams.query = undefined;
    this.loadBooks();
  }
  
  retryLoad(): void {
    this.loadBooks();
  }
  
  // Método para emitir el evento de selección de libro
  selectBook(bookId: number): void {
    this.bookSelected.emit(bookId);
  }
  
  // Método para generar el array de páginas para la paginación
  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostramos todas
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Implementamos paginación avanzada
      if (this.currentPage <= 2) {
        // Estamos cerca del inicio
        for (let i = 0; i < Math.min(maxPagesToShow, this.totalPages); i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 3) {
        // Estamos cerca del final
        for (let i = this.totalPages - maxPagesToShow; i < this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Estamos en el medio
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

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
}