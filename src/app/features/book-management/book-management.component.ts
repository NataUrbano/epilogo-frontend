import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthorService } from '../../core/services/author.service';
import { Book, BookCreate, BookSearch, BookStatus, BookUpdate } from '../../core/models/book.model';
import { CategorySummary } from '../../core/models/category.model';
import { AuthorSummary } from '../../core/models/author.model';

declare var bootstrap: any;

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'book-management.component.html',
  styleUrls: ['book-management.component.css']
})
export class BookManagementComponent implements OnInit, OnDestroy {
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);
  private authorService = inject(AuthorService);
  private fb = inject(FormBuilder);
  
  // Data
  books: Book[] = [];
  categories: CategorySummary[] = [];
  authors: AuthorSummary[] = [];
  
  // State
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  selectedBook: Book | null = null;
  selectedFile: File | null = null;
  filePreview: string = '';
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  // Forms
  searchForm!: FormGroup;
  bookForm!: FormGroup;
  
  // Search parameters
  searchParams: BookSearch = {
    page: 0,
    size: 10,
    sortBy: 'title',
    sortDirection: 'asc'
  };
  
  // Modals
  private bookModal: any;
  private coverModal: any;
  private deleteModal: any;

  ngOnInit(): void {
    this.initForms();
    this.loadCategories();
    this.loadAuthors();
    this.loadBooks();
    
    // Initialize Bootstrap modals
    this.initializeModals();
  }
  
  ngOnDestroy(): void {
    // Clean up resources if necessary
    this.bookModal?.dispose();
    this.coverModal?.dispose();
    this.deleteModal?.dispose();
  }

  private initializeModals(): void {
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      // Initialize modals
      try {
        const bookModalElement = document.getElementById('bookModal');
        if (bookModalElement) {
          this.bookModal = new bootstrap.Modal(bookModalElement);
        }
        
        const coverModalElement = document.getElementById('coverModal');
        if (coverModalElement) {
          this.coverModal = new bootstrap.Modal(coverModalElement);
        }
        
        const deleteModalElement = document.getElementById('deleteModal');
        if (deleteModalElement) {
          this.deleteModal = new bootstrap.Modal(deleteModalElement);
        }
      } catch (error) {
        console.error('Error initializing modals:', error);
      }
    });
  }
  
  private initForms(): void {
    // Search form
    this.searchForm = this.fb.group({
      query: [''],
      categoryId: [null],
      status: [null]
    });
    
    // Book form with validators
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      isbn: [''],
      authorId: [null, Validators.required],
      categoryId: [null, Validators.required],
      totalAmount: [1, [Validators.required, Validators.min(1)]],
      availableAmount: [1, [Validators.required, Validators.min(0)]],
      publicationYear: [null, [Validators.min(1000), Validators.max(new Date().getFullYear())]]
    }, { 
      validators: this.availableAmountValidator 
    });
  }
  
  // Custom validator to ensure available amount doesn't exceed total
  private availableAmountValidator(group: FormGroup): { [key: string]: boolean } | null {
    const totalAmount = group.get('totalAmount')?.value;
    const availableAmount = group.get('availableAmount')?.value;
    
    if (totalAmount !== null && availableAmount !== null && availableAmount > totalAmount) {
      return { 'availableExceedsTotal': true };
    }
    
    return null;
  }
  
  // Load books from the API
  loadBooks(): void {
    this.isLoading = true;
    
    this.bookService.searchBooks(this.searchParams).subscribe({
      next: (response) => {
        this.books = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.number;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
        this.showNotification('Error al cargar los libros. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  // Load categories for dropdowns
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showNotification('Error al cargar las categorías.', 'error');
      }
    });
  }
  
  // Load authors for dropdowns
  loadAuthors(): void {
    this.authorService.getAllAuthors().subscribe({
      next: (authors) => {
        this.authors = authors;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.showNotification('Error al cargar los autores.', 'error');
      }
    });
  }
  
  // Apply search filters
  applyFilters(): void {
    const formValues = this.searchForm.value;
    
    this.searchParams = {
      ...this.searchParams,
      page: 0,
      query: formValues.query || undefined,
      categoryId: formValues.categoryId || undefined,
      status: formValues.status || undefined
    };
    
    this.loadBooks();
  }
  
  // Sort books by column
  sortBy(column: string): void {
    if (this.searchParams.sortBy === column) {
      // Toggle direction if already sorting by this column
      this.searchParams.sortDirection = this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column and default to ascending
      this.searchParams.sortBy = column;
      this.searchParams.sortDirection = 'asc';
    }
    
    this.loadBooks();
  }
  
  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.searchParams.page = page;
      this.loadBooks();
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate range of pages to show
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      // Adjust if endPage exceeds totalPages
      if (endPage >= this.totalPages) {
        endPage = this.totalPages - 1;
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Modal methods
  showAddBookModal(): void {
    this.isEditMode = false;
    this.selectedBook = null;
    
    console.log("CREANDO UN NUEVO LIBRO");
    
    // Reset form with default values
    this.bookForm.reset({
      totalAmount: 1,
      availableAmount: 1
    });
    
    // Ensure the form is properly reset by manually clearing validators errors
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
    
    // Show the modal
    this.bookModal?.show();
  }
  
  showEditBookModal(book: Book): void {
    this.isEditMode = true;
    this.selectedBook = book;
    
    this.bookForm.patchValue({
      title: book.title,
      description: book.description || '',
      isbn: book.isbn || '',
      authorId: book.author.authorId,
      categoryId: book.category.categoryId,
      totalAmount: book.totalAmount,
      availableAmount: book.availableAmount,
      publicationYear: book.publicationYear || null
    });
    
    this.bookModal?.show();
  }
  
  showUploadCoverModal(book: Book): void {
    this.selectedBook = book;
    this.selectedFile = null;
    this.filePreview = '';
    
    this.coverModal?.show();
  }
  
  showDeleteConfirmation(book: Book): void {
    this.selectedBook = book;
    
    this.deleteModal?.show();
  }
  
  // File handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  // Save book (create or update)
  saveBook(): void {
    if (this.bookForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.bookForm.value;
    
    if (this.isEditMode && this.selectedBook) {
      // Update existing book
      const bookUpdate: BookUpdate = {
        title: formValues.title,
        description: formValues.description || undefined,
        isbn: formValues.isbn || undefined,
        authorId: formValues.authorId,
        categoryId: formValues.categoryId,
        totalAmount: formValues.totalAmount,
        availableAmount: formValues.availableAmount,
        publicationYear: formValues.publicationYear || undefined
      };
      
      this.bookService.updateBook(this.selectedBook.bookId, bookUpdate).subscribe({
        next: (updatedBook) => {
          // Success - close modal and refresh list
          this.isSubmitting = false;
          this.bookModal?.hide();
          
          // Update book in the list
          const index = this.books.findIndex(b => b.bookId === updatedBook.bookId);
          if (index !== -1) {
            this.books[index] = updatedBook;
          }
          
          // Show success notification
          this.showNotification(`Libro "${updatedBook.title}" actualizado correctamente.`, 'success');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating book:', error);
          this.showNotification('Error al actualizar el libro. Inténtalo de nuevo.', 'error');
        }
      });
    } else {
      // Create new book
      const bookCreate: BookCreate = {
        title: formValues.title,
        description: formValues.description || undefined,
        isbn: formValues.isbn || undefined,
        authorId: formValues.authorId,
        categoryId: formValues.categoryId,
        totalAmount: formValues.totalAmount,
        availableAmount: formValues.availableAmount,
        publicationYear: formValues.publicationYear || undefined
      };
      
      this.bookService.createBook(bookCreate).subscribe({
        next: (newBook) => {
          // Success - close modal and refresh list
          this.isSubmitting = false;
          this.bookModal?.hide();
          
          // Add new book to the beginning of the list if on first page
          if (this.currentPage === 0) {
            this.books.unshift(newBook);
            
            // Remove last item if needed to maintain page size
            if (this.books.length > this.pageSize) {
              this.books.pop();
            }
          } else {
            // If not on first page, just reload the data
            this.loadBooks();
          }
          
          // Show success notification
          this.showNotification(`Libro "${newBook.title}" creado correctamente.`, 'success');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating book:', error);
          this.showNotification('Error al crear el libro. Inténtalo de nuevo.', 'error');
        }
      });
    }
  }
  
  // Upload book cover
  uploadCover(): void {
    if (!this.selectedFile || !this.selectedBook) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.bookService.uploadBookCover(this.selectedBook.bookId, this.selectedFile).subscribe({
      next: (updatedBook) => {
        // Success - close modal and update book
        this.isSubmitting = false;
        this.coverModal?.hide();
        
        // Update book in the list
        const index = this.books.findIndex(b => b.bookId === updatedBook.bookId);
        if (index !== -1) {
          this.books[index] = updatedBook;
        }
        
        // Show success notification
        this.showNotification(`Portada para "${updatedBook.title}" subida correctamente.`, 'success');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error uploading cover:', error);
        this.showNotification('Error al subir la portada. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  // Delete book
  deleteBook(): void {
    if (!this.selectedBook) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.bookService.deleteBook(this.selectedBook.bookId).subscribe({
      next: () => {
        // Success - close modal and remove book from list
        this.isSubmitting = false;
        this.deleteModal?.hide();
        
        // Remove book from the list
        this.books = this.books.filter(b => b.bookId !== this.selectedBook?.bookId);
        
        // If we've removed the last item on the page, go to the previous page
        if (this.books.length === 0 && this.currentPage > 0) {
          this.goToPage(this.currentPage - 1);
        } else if (this.books.length === 0) {
          // If we're on the first page, reload to see if there's any data
          this.loadBooks();
        }
        
        // Show success notification
        const bookTitle = this.selectedBook?.title || '';
        this.showNotification(`Libro "${bookTitle}" eliminado correctamente.`, 'success');
        this.selectedBook = null;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error deleting book:', error);
        this.showNotification('Error al eliminar el libro. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  // Helper function to convert status enum to readable text
  getStatusText(status: BookStatus): string {
    switch (status) {
      case BookStatus.AVAILABLE:
        return 'Disponible';
      case BookStatus.LOW_STOCK:
        return 'Poco stock';
      case BookStatus.UNAVAILABLE:
        return 'No disponible';
      default:
        return status;
    }
  }
  
  // Show notification
  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    // This is a simple implementation. In a real app, you might use a toast service
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    const toastContent = document.createElement('div');
    toastContent.className = 'd-flex';
    
    const toastBody = document.createElement('div');
    toastBody.className = 'toast-body';
    toastBody.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-close-white me-2 m-auto';
    closeButton.setAttribute('data-bs-dismiss', 'toast');
    closeButton.setAttribute('aria-label', 'Close');
    
    toastContent.appendChild(toastBody);
    toastContent.appendChild(closeButton);
    toast.appendChild(toastContent);
    
    toastContainer.appendChild(toast);
    
    // Initialize and show the toast
    try {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      // Remove toast after it's hidden
      toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
      });
    } catch (error) {
      console.error('Error showing toast notification:', error);
      // If Bootstrap Toast fails, at least log the message
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}