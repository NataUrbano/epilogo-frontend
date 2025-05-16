import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Author, AuthorCreate, AuthorUpdate } from '../../core/models/author.model';
import { AuthorService } from '../../core/services/author.service';

declare var bootstrap: any;

interface AuthorSearchParams {
  name?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Component({
  selector: 'app-author-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'author-management.component.html',
  styleUrls: ['author-management.component.css']
})
export class AuthorManagementComponent implements OnInit, OnDestroy {
  private authorService = inject(AuthorService);
  private fb = inject(FormBuilder);
  
  // Data
  authors: Author[] = [];
  
  // State
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  selectedAuthor: Author | null = null;
  selectedFile: File | null = null;
  filePreview: string = '';
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  // Forms
  searchForm!: FormGroup;
  authorForm!: FormGroup;
  
  // Search parameters
  searchParams: AuthorSearchParams = {
    page: 0,
    size: 10,
    sortBy: 'authorName',
    sortDirection: 'asc'
  };
  
  // Modals
  private authorModal: any;
  private imageModal: any;
  private deleteModal: any;

  ngOnInit(): void {
    this.initForms();
    this.loadAuthors();
    
    // Initialize Bootstrap modals
    this.initializeModals();
  }
  
  ngOnDestroy(): void {
    // Clean up resources if necessary
    this.authorModal?.dispose();
    this.imageModal?.dispose();
    this.deleteModal?.dispose();
  }

  private initializeModals(): void {
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      // Initialize modals
      try {
        const authorModalElement = document.getElementById('authorModal');
        if (authorModalElement) {
          this.authorModal = new bootstrap.Modal(authorModalElement);
        }
        
        const imageModalElement = document.getElementById('imageModal');
        if (imageModalElement) {
          this.imageModal = new bootstrap.Modal(imageModalElement);
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
      query: ['']
    });
    
    // Author form with validators
    this.authorForm = this.fb.group({
      authorName: ['', Validators.required],
      biography: [''],
      birthYear: [null, [Validators.min(0), Validators.max(new Date().getFullYear())]],
      deathYear: [null, [Validators.min(0), Validators.max(new Date().getFullYear())]]
    }, { 
      validators: this.yearSequenceValidator 
    });
  }
  
  // Custom validator to ensure death year is after birth year
  private yearSequenceValidator(group: FormGroup): { [key: string]: boolean } | null {
    const birthYear = group.get('birthYear')?.value;
    const deathYear = group.get('deathYear')?.value;
    
    if (birthYear && deathYear && deathYear < birthYear) {
      return { 'yearSequence': true };
    }
    
    return null;
  }
  
  // Load authors from the API
  loadAuthors(): void {
    this.isLoading = true;
    
    if (this.searchParams.name) {
      // If we have a search query, use findAuthorsByName
      this.authorService.findAuthorsByName(
        this.searchParams.name, 
        this.searchParams.page, 
        this.searchParams.size
      ).subscribe({
        next: (response) => {
          this.authors = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.currentPage = response.number;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading authors:', error);
          this.isLoading = false;
          this.showNotification('Error al cargar los autores. Inténtalo de nuevo.', 'error');
        }
      });
    } else {
      // If no search query, get all authors
      this.authorService.getAllAuthors().subscribe({
        next: (authors) => {
          this.authors = authors as Author[];
          this.totalElements = authors.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading authors:', error);
          this.isLoading = false;
          this.showNotification('Error al cargar los autores. Inténtalo de nuevo.', 'error');
        }
      });
    }
  }
  
  // Search authors
  searchAuthors(): void {
    const query = this.searchForm.value.query?.trim();
    
    this.searchParams = {
      ...this.searchParams,
      page: 0,
      name: query || undefined
    };
    
    this.loadAuthors();
  }
  
  // Sort authors by column
  sortBy(column: string): void {
    if (this.searchParams.sortBy === column) {
      // Toggle direction if already sorting by this column
      this.searchParams.sortDirection = this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column and default to ascending
      this.searchParams.sortBy = column;
      this.searchParams.sortDirection = 'asc';
    }
    
    this.loadAuthors();
  }
  
  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.searchParams.page = page;
      this.loadAuthors();
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
  showAddAuthorModal(): void {
    this.isEditMode = false;
    this.selectedAuthor = null;
    
    // Reset form
    this.authorForm.reset();
    
    // Ensure the form is properly reset by manually clearing validators errors
    Object.keys(this.authorForm.controls).forEach(key => {
      const control = this.authorForm.get(key);
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
    
    // Show the modal
    this.authorModal?.show();
  }
  
  showEditAuthorModal(author: Author): void {
    this.isEditMode = true;
    this.selectedAuthor = author;
    
    this.authorForm.patchValue({
      authorName: author.authorName,
      biography: author.biography || '',
      birthYear: author.birthYear || null,
      deathYear: author.deathYear || null
    });
    
    this.authorModal?.show();
  }
  
  showUploadImageModal(author: Author): void {
    this.selectedAuthor = author;
    this.selectedFile = null;
    this.filePreview = '';
    
    this.imageModal?.show();
  }
  
  showDeleteConfirmation(author: Author): void {
    this.selectedAuthor = author;
    
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
  
  // Save author (create or update)
  saveAuthor(): void {
    if (this.authorForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.authorForm.value;
    
    if (this.isEditMode && this.selectedAuthor) {
      // Update existing author
      const authorUpdate: AuthorUpdate = {
        authorName: formValues.authorName,
        biography: formValues.biography || undefined,
        birthYear: formValues.birthYear || undefined,
        deathYear: formValues.deathYear || undefined
      };
      
      this.authorService.updateAuthor(this.selectedAuthor.authorId, authorUpdate).subscribe({
        next: (updatedAuthor) => {
          // Success - close modal and refresh list
          this.isSubmitting = false;
          this.authorModal?.hide();
          
          // Update author in the list
          const index = this.authors.findIndex(a => a.authorId === updatedAuthor.authorId);
          if (index !== -1) {
            this.authors[index] = updatedAuthor;
          }
          
          // Show success notification
          this.showNotification(`Autor "${updatedAuthor.authorName}" actualizado correctamente.`, 'success');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating author:', error);
          this.showNotification('Error al actualizar el autor. Inténtalo de nuevo.', 'error');
        }
      });
    } else {
      // Create new author
      const authorCreate: AuthorCreate = {
        authorName: formValues.authorName,
        biography: formValues.biography || undefined,
        birthYear: formValues.birthYear || undefined,
        deathYear: formValues.deathYear || undefined
      };
      
      this.authorService.createAuthor(authorCreate).subscribe({
        next: (newAuthor) => {
          // Success - close modal and refresh list
          this.isSubmitting = false;
          this.authorModal?.hide();
          
          // Add new author to the beginning of the list if on first page
          if (this.currentPage === 0) {
            this.authors.unshift(newAuthor);
            
            // Remove last item if needed to maintain page size
            if (this.authors.length > this.pageSize) {
              this.authors.pop();
            }
          } else {
            // If not on first page, just reload the data
            this.loadAuthors();
          }
          
          // Show success notification
          this.showNotification(`Autor "${newAuthor.authorName}" creado correctamente.`, 'success');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating author:', error);
          this.showNotification('Error al crear el autor. Inténtalo de nuevo.', 'error');
        }
      });
    }
  }
  
  // Upload author image
  uploadImage(): void {
    if (!this.selectedFile || !this.selectedAuthor) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.authorService.uploadAuthorImage(this.selectedAuthor.authorId, this.selectedFile).subscribe({
      next: (updatedAuthor) => {
        // Success - close modal and update author
        this.isSubmitting = false;
        this.imageModal?.hide();
        
        // Update author in the list
        const index = this.authors.findIndex(a => a.authorId === updatedAuthor.authorId);
        if (index !== -1) {
          this.authors[index] = updatedAuthor;
        }
        
        // Show success notification
        this.showNotification(`Imagen para "${updatedAuthor.authorName}" subida correctamente.`, 'success');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error uploading image:', error);
        this.showNotification('Error al subir la imagen. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  // Delete author
  deleteAuthor(): void {
    if (!this.selectedAuthor || (this.selectedAuthor.totalBooks && this.selectedAuthor.totalBooks > 0)) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.authorService.deleteAuthor(this.selectedAuthor.authorId).subscribe({
      next: () => {
        // Success - close modal and remove author from list
        this.isSubmitting = false;
        this.deleteModal?.hide();
        
        // Remove author from the list
        this.authors = this.authors.filter(a => a.authorId !== this.selectedAuthor?.authorId);
        
        // If we've removed the last item on the page, go to the previous page
        if (this.authors.length === 0 && this.currentPage > 0) {
          this.goToPage(this.currentPage - 1);
        } else if (this.authors.length === 0) {
          // If we're on the first page, reload to see if there's any data
          this.loadAuthors();
        }
        
        // Show success notification
        const authorName = this.selectedAuthor?.authorName || '';
        this.showNotification(`Autor "${authorName}" eliminado correctamente.`, 'success');
        this.selectedAuthor = null;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error deleting author:', error);
        this.showNotification('Error al eliminar el autor. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  // Show notification
  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
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