import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Author, AuthorCreate, AuthorUpdate } from '../../core/models/author.model';
import { AuthorService } from '../../core/services/author.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './author-management.component.html',
  styleUrls: ['./author-management.component.css']
})
export class AuthorManagementComponent implements OnInit, OnDestroy {
  private authorService = inject(AuthorService);
  private translateService = inject(TranslateService);
  private fb = inject(FormBuilder);
  
  authors: Author[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  selectedAuthor: Author | null = null;
  selectedFile: File | null = null;
  filePreview: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  searchForm!: FormGroup;
  authorForm!: FormGroup;
  searchParams: AuthorSearchParams = {
    page: 0,
    size: 10,
    sortBy: 'authorName',
    sortDirection: 'asc'
  };
  private authorModal: any;
  private imageModal: any;
  private deleteModal: any;

  ngOnInit(): void {
    this.initForms();
    this.loadAuthors();
    this.initializeModals();
  }
  
  ngOnDestroy(): void {
    this.authorModal?.dispose();
    this.imageModal?.dispose();
    this.deleteModal?.dispose();
  }

  private initializeModals(): void {
    setTimeout(() => {
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
    this.searchForm = this.fb.group({
      query: ['']
    });
    
    this.authorForm = this.fb.group({
      authorName: ['', Validators.required],
      biography: [''],
      birthYear: [null, [Validators.min(0), Validators.max(new Date().getFullYear())]],
      deathYear: [null, [Validators.min(0), Validators.max(new Date().getFullYear())]]
    }, { 
      validators: this.yearSequenceValidator 
    });
  }
  
  private yearSequenceValidator(group: FormGroup): { [key: string]: boolean } | null {
    const birthYear = group.get('birthYear')?.value;
    const deathYear = group.get('deathYear')?.value;
    
    if (birthYear && deathYear && deathYear < birthYear) {
      return { 'yearSequence': true };
    }
    
    return null;
  }
  
  loadAuthors(): void {
    this.isLoading = true;
    
    if (this.searchParams.name) {
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
          this.showNotification(this.translateService.instant('AUTHORS.LOAD_ERROR'), 'error');
        }
      });
    } else {
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
          this.showNotification(this.translateService.instant('AUTHORS.LOAD_ERROR'), 'error');
        }
      });
    }
  }
  
  searchAuthors(): void {
    const query = this.searchForm.value.query?.trim();
    
    this.searchParams = {
      ...this.searchParams,
      page: 0,
      name: query || undefined
    };
    
    this.loadAuthors();
  }
  
  sortBy(column: string): void {
    if (this.searchParams.sortBy === column) {
      this.searchParams.sortDirection = this.searchParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchParams.sortBy = column;
      this.searchParams.sortDirection = 'asc';
    }
    
    this.loadAuthors();
  }
  
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
  
  showAddAuthorModal(): void {
    this.isEditMode = false;
    this.selectedAuthor = null;
    
    this.authorForm.reset();
    
    Object.keys(this.authorForm.controls).forEach(key => {
      const control = this.authorForm.get(key);
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });
    
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
  
  saveAuthor(): void {
    if (this.authorForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.authorForm.value;
    
    if (this.isEditMode && this.selectedAuthor) {
      const authorUpdate: AuthorUpdate = {
        authorName: formValues.authorName,
        biography: formValues.biography || undefined,
        birthYear: formValues.birthYear || undefined,
        deathYear: formValues.deathYear || undefined
      };
      
      this.authorService.updateAuthor(this.selectedAuthor.authorId, authorUpdate).subscribe({
        next: (updatedAuthor) => {
          this.isSubmitting = false;
          this.authorModal?.hide();
          
          const index = this.authors.findIndex(a => a.authorId === updatedAuthor.authorId);
          if (index !== -1) {
            this.authors[index] = updatedAuthor;
          }
          
          this.showNotification(
            this.translateService.instant('AUTHORS.UPDATE_SUCCESS', { name: updatedAuthor.authorName }),
            'success'
          );
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating author:', error);
          this.showNotification(this.translateService.instant('AUTHORS.UPDATE_ERROR'), 'error');
        }
      });
    } else {
      const authorCreate: AuthorCreate = {
        authorName: formValues.authorName,
        biography: formValues.biography || undefined,
        birthYear: formValues.birthYear || undefined,
        deathYear: formValues.deathYear || undefined
      };
      
      this.authorService.createAuthor(authorCreate).subscribe({
        next: (newAuthor) => {
          this.isSubmitting = false;
          this.authorModal?.hide();
          
          if (this.currentPage === 0) {
            this.authors.unshift(newAuthor);
            
            if (this.authors.length > this.pageSize) {
              this.authors.pop();
            }
          } else {
            this.loadAuthors();
          }
          
          this.showNotification(
            this.translateService.instant('AUTHORS.CREATE_SUCCESS', { name: newAuthor.authorName }),
            'success'
          );
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating author:', error);
          this.showNotification(this.translateService.instant('AUTHORS.CREATE_ERROR'), 'error');
        }
      });
    }
  }
  
  uploadImage(): void {
    if (!this.selectedFile || !this.selectedAuthor) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.authorService.uploadAuthorImage(this.selectedAuthor.authorId, this.selectedFile).subscribe({
      next: (updatedAuthor) => {
        this.isSubmitting = false;
        this.imageModal?.hide();
        
        const index = this.authors.findIndex(a => a.authorId === updatedAuthor.authorId);
        if (index !== -1) {
          this.authors[index] = updatedAuthor;
        }
        
        this.showNotification(
          this.translateService.instant('AUTHORS.IMAGE_UPLOAD_SUCCESS', { name: updatedAuthor.authorName }),
          'success'
        );
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error uploading image:', error);
        this.showNotification(this.translateService.instant('AUTHORS.IMAGE_UPLOAD_ERROR'), 'error');
      }
    });
  }
  
  deleteAuthor(): void {
    if (!this.selectedAuthor || (this.selectedAuthor.totalBooks && this.selectedAuthor.totalBooks > 0)) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.authorService.deleteAuthor(this.selectedAuthor.authorId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.deleteModal?.hide();
        
        this.authors = this.authors.filter(a => a.authorId !== this.selectedAuthor?.authorId);
        
        if (this.authors.length === 0 && this.currentPage > 0) {
          this.goToPage(this.currentPage - 1);
        } else if (this.authors.length === 0) {
          this.loadAuthors();
        }
        
        const authorName = this.selectedAuthor?.authorName || '';
        this.showNotification(
          this.translateService.instant('AUTHORS.DELETE_SUCCESS', { name: authorName }),
          'success'
        );
        this.selectedAuthor = null;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error deleting author:', error);
        this.showNotification(this.translateService.instant('AUTHORS.DELETE_ERROR'), 'error');
      }
    });
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