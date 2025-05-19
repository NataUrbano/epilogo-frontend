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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

declare var bootstrap: any;

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './book-management.component.html',
  styleUrls: ['./book-management.component.css']
})
export class BookManagementComponent implements OnInit, OnDestroy {
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);
  private authorService = inject(AuthorService);
  private translateService = inject(TranslateService);
  private fb = inject(FormBuilder);
  
  books: Book[] = [];
  categories: CategorySummary[] = [];
  authors: AuthorSummary[] = [];
  
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  selectedBook: Book | null = null;
  selectedFile: File | null = null;
  filePreview: string = '';
  
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  searchForm!: FormGroup;
  bookForm!: FormGroup;
  
  searchParams: BookSearch = {
    page: 0,
    size: 10,
    sortBy: 'title',
    sortDirection: 'asc'
  };
  
  private bookModal: any;
  private coverModal: any;
  private deleteModal: any;

  ngOnInit(): void {
    this.initForms();
    this.loadCategories();
    this.loadAuthors();
    this.loadBooks();
    
    this.initializeModals();
  }
  
  ngOnDestroy(): void {
    this.bookModal?.dispose();
    this.coverModal?.dispose();
    this.deleteModal?.dispose();
  }

  private initializeModals(): void {
    setTimeout(() => {
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
    this.searchForm = this.fb.group({
      query: [''],
      categoryId: [null],
      status: [null]
    });
    
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
  
  private availableAmountValidator(group: FormGroup): { [key: string]: boolean } | null {
    const totalAmount = group.get('totalAmount')?.value;
    const availableAmount = group.get('availableAmount')?.value;
    
    if (totalAmount !== null && availableAmount !== null && availableAmount > totalAmount) {
      return { 'availableExceedsTotal': true };
    }
    
    return null;
  }
  
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
        this.showNotification(this.translateService.instant('BOOKS.LOAD_ERROR'), 'error');
      }
    });
  }
  
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showNotification(this.translateService.instant('BOOKS.CATEGORIES_LOAD_ERROR'), 'error');
      }
    });
  }
  
  loadAuthors(): void {
    this.authorService.getAllAuthors().subscribe({
      next: (authors) => {
        this.authors = authors;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.showNotification(this.translateService.instant('BOOKS.AUTHORS_LOAD_ERROR'), 'error');
      }
    });
  }
  
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
  
  sortBy(column: string): void {
    if (this.searchParams.sortBy === column) {
      this.searchParams.sortDirection = this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchParams.sortBy = column;
      this.searchParams.sortDirection = 'asc';
    }
    
    this.loadBooks();
  }
  
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
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
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
  
  showAddBookModal(): void {
    this.isEditMode = false;
    this.selectedBook = null;
    
    this.bookForm.reset({
      totalAmount: 1,
      availableAmount: 1
    });
    
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
    
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
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  saveBook(): void {
    if (this.bookForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.bookForm.value;
    
    if (this.isEditMode && this.selectedBook) {
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
          this.isSubmitting = false;
          this.bookModal?.hide();
          
          const index = this.books.findIndex(b => b.bookId === updatedBook.bookId);
          if (index !== -1) {
            this.books[index] = updatedBook;
          }
          
          this.showNotification(
            this.translateService.instant('BOOKS.UPDATE_SUCCESS', { title: updatedBook.title }),
            'success'
          );
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating book:', error);
          this.showNotification(this.translateService.instant('BOOKS.UPDATE_ERROR'), 'error');
        }
      });
    } else {
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
          this.isSubmitting = false;
          this.bookModal?.hide();
          
          if (this.currentPage === 0) {
            this.books.unshift(newBook);
            
            if (this.books.length > this.pageSize) {
              this.books.pop();
            }
          } else {
            this.loadBooks();
          }
          
          this.showNotification(
            this.translateService.instant('BOOKS.CREATE_SUCCESS', { title: newBook.title }),
            'success'
          );
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating book:', error);
          this.showNotification(this.translateService.instant('BOOKS.CREATE_ERROR'), 'error');
        }
      });
    }
  }
  
  uploadCover(): void {
    if (!this.selectedFile || !this.selectedBook) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.bookService.uploadBookCover(this.selectedBook.bookId, this.selectedFile).subscribe({
      next: (updatedBook) => {
        this.isSubmitting = false;
        this.coverModal?.hide();
        
        const index = this.books.findIndex(b => b.bookId === updatedBook.bookId);
        if (index !== -1) {
          this.books[index] = updatedBook;
        }
        
        this.showNotification(
          this.translateService.instant('BOOKS.COVER_UPLOAD_SUCCESS', { title: updatedBook.title }),
          'success'
        );
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error uploading cover:', error);
        this.showNotification(this.translateService.instant('BOOKS.COVER_UPLOAD_ERROR'), 'error');
      }
    });
  }
  
  deleteBook(): void {
    if (!this.selectedBook) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.bookService.deleteBook(this.selectedBook.bookId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.deleteModal?.hide();
        
        this.books = this.books.filter(b => b.bookId !== this.selectedBook?.bookId);
        
        if (this.books.length === 0 && this.currentPage > 0) {
          this.goToPage(this.currentPage - 1);
        } else if (this.books.length === 0) {
          this.loadBooks();
        }
        
        const bookTitle = this.selectedBook?.title || '';
        this.showNotification(
          this.translateService.instant('BOOKS.DELETE_SUCCESS', { title: bookTitle }),
          'success'
        );
        this.selectedBook = null;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error deleting book:', error);
        this.showNotification(this.translateService.instant('BOOKS.DELETE_ERROR'), 'error');
      }
    });
  }
  
  getStatusText(status: BookStatus): string {
    switch (status) {
      case BookStatus.AVAILABLE:
        return this.translateService.instant('BOOKS.STATUS_AVAILABLE');
      case BookStatus.LOW_STOCK:
        return this.translateService.instant('BOOKS.STATUS_LOW_STOCK');
      case BookStatus.UNAVAILABLE:
        return this.translateService.instant('BOOKS.STATUS_UNAVAILABLE');
      default:
        return status;
    }
  }
  
  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
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
    
    try {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
      });
    } catch (error) {
      console.error('Error showing toast notification:', error);
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
} 