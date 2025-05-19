// random-categories.component.ts
import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CategorySummary } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-random-categories',
  imports: [TranslateModule],
  templateUrl: './random-categories.component.html',
  styleUrls: ['./random-categories.component.css']
})
export class RandomCategoriesComponent implements OnInit {
  categories: CategorySummary[] = [];
  loading = true;
  error = false;
  private translateService = inject(TranslateService);
  @Output() categorySelected = new EventEmitter<number>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadRandomCategories();
  }

  loadRandomCategories(): void {
    this.loading = true;
    this.error = false;
    
    this.categoryService.getAllCategories()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (categories) => {
          if (categories.length > 10) {
            
            this.categories = this.getRandomCategories(categories, 10);
            
          } else {
            this.categories = categories;
          }

        this.categories.forEach(category => {
          console.log(`CategoryName: ${category.categoryName}, ImageUrl: ${category.imageUrl}`);
        }); 
        },
        error: () => {
          this.error = true;
        }
      });
  }

  getRandomCategories(categories: CategorySummary[], count: number): CategorySummary[] {
    const shuffled = [...categories];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }

  onSelectCategory(categoryId: number): void {
    this.categorySelected.emit(categoryId);
  }

  retryLoad(): void {
    this.loadRandomCategories();
  }
}