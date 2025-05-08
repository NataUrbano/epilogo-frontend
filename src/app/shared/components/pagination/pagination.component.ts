import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container">
      <button 
        class="pagination-btn" 
        [disabled]="currentPage === 0"
        (click)="onFirstPage()"
        title="Primera página"
      >
        «
      </button>
      
      <button 
        class="pagination-btn" 
        [disabled]="currentPage === 0"
        (click)="onPreviousPage()"
        title="Página anterior"
      >
        ‹
      </button>
      
      <div class="page-info">
        <span>Página {{ currentPage + 1 }} de {{ totalPages || 1 }}</span>
      </div>
      
      <button 
        class="pagination-btn" 
        [disabled]="currentPage >= totalPages - 1"
        (click)="onNextPage()"
        title="Página siguiente"
      >
        ›
      </button>
      
      <button 
        class="pagination-btn" 
        [disabled]="currentPage >= totalPages - 1"
        (click)="onLastPage()"
        title="Última página"
      >
        »
      </button>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2rem 0;
      gap: 0.5rem;
    }
    
    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid #ddd;
      background-color: white;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .pagination-btn:hover:not(:disabled) {
      background-color: #f0f0f0;
      border-color: #bbb;
    }
    
    .pagination-btn:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
    
    .page-info {
      padding: 0 1rem;
      font-size: 0.9rem;
      color: #666;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  
  @Output() pageChange = new EventEmitter<number>();
  
  onFirstPage(): void {
    if (this.currentPage !== 0) {
      this.pageChange.emit(0);
    }
  }
  
  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }
  
  onNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
  
  onLastPage(): void {
    if (this.currentPage !== this.totalPages - 1) {
      this.pageChange.emit(this.totalPages - 1);
    }
  }
}