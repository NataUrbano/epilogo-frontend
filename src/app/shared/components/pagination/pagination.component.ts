import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
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