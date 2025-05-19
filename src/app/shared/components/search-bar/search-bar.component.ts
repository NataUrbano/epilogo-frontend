// src/app/shared/components/search-bar/search-bar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="search-container">
      <input 
        type="text" 
        class="search-input" 
        [placeholder]="placeholder || ('SEARCH.PLACEHOLDER' | translate)" 
        [(ngModel)]="searchTerm"
        (keyup.enter)="onSearch()"
      >
      <button 
        class="search-button" 
        (click)="onSearch()"
        [disabled]="searchTerm.trim().length === 0 && !allowEmptySearch"
      >
        <span class="search-icon">🔍</span>
        <span class="sr-only">{{ 'search.button' | translate }}</span>
      </button>
    </div>
  `,
  styles: [`
    /* Tus estilos actuales se mantienen igual */
    .search-container {
      display: flex;
      width: 100%;
      position: relative;
    }
    
    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
    }
    
    .search-button {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3rem;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s;
    }
    
    .search-button:hover:not(:disabled) {
      background-color: #303f9f;
    }
    
    .search-button:disabled {
      background-color: #b0bec5;
      cursor: not-allowed;
    }
    
    .search-icon {
      font-size: 1.2rem;
    }

    /* Estilo para texto accesible */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class SearchBarComponent {
  @Input() placeholder?: string; // Ahora es opcional
  @Input() allowEmptySearch = false;
  @Output() search = new EventEmitter<string>();
  
  searchTerm = '';
  
  constructor(private translate: TranslateService) {}

  onSearch(): void {
    if (this.searchTerm.trim().length > 0 || this.allowEmptySearch) {
      this.search.emit(this.searchTerm.trim());
    }
  }
  
  reset(): void {
    this.searchTerm = '';
  }
}