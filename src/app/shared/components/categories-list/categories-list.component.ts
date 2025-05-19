import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category, CategoryCreate, CategoryUpdate } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  
  @ViewChild('imageInput') imageInput!: ElementRef;
  
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  
  selectedCategory: Category | null = null;
  selectedImage: File | null = null;
  
  categoryCreateForm: CategoryCreate = {
    categoryName: '',
    description: ''
  };
  
  categoryEditForm: CategoryUpdate = {
    categoryName: '',
    description: ''
  };
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.isLoading = true;
    
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = [];
        this.loadCategoryDetails(categories);
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }
  
  loadCategoryDetails(categorySummaries: any[]): void {
    if (categorySummaries.length === 0) {
      this.isLoading = false;
      return;
    }
    
    let loadedCount = 0;
    categorySummaries.forEach(summary => {
      this.categoryService.getCategoryById(summary.categoryId).subscribe({
        next: (category) => {
          this.categories.push(category);
          loadedCount++;
          
          if (loadedCount === categorySummaries.length) {
            this.filteredCategories = [...this.categories];
            this.isLoading = false;
          }
        },
        error: (error) => {
          loadedCount++;
          
          if (loadedCount === categorySummaries.length) {
            this.filteredCategories = [...this.categories];
            this.isLoading = false;
          }
        }
      });
    });
  }
  
  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredCategories = this.categories.filter(category => 
      category.categoryName.toLowerCase().includes(search) ||
      (category.description && category.description.toLowerCase().includes(search))
    );
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.filterCategories();
  }
  
  createCategory(): void {
    if (!this.categoryCreateForm.categoryName.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }
    
    this.categoryService.createCategory(this.categoryCreateForm).subscribe({
      next: (newCategory) => {
        this.categories.push(newCategory);
        this.filterCategories();
        this.resetCreateForm();
        this.showCreateModal = false;
      },
      error: (error) => {
        alert('Error al crear la categoría: ' + error.message);
      }
    });
  }
  
  editCategory(category: Category): void {
    this.selectedCategory = category;
    this.categoryEditForm = {
      categoryName: category.categoryName,
      description: category.description
    };
    this.selectedImage = null;
    this.showEditModal = true;
  }
  
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }
  
  saveCategory(): void {
    if (!this.selectedCategory) return;
    
    this.categoryService.updateCategory(
      this.selectedCategory.categoryId, 
      this.categoryEditForm
    ).subscribe({
      next: (updatedCategory) => {
        if (this.selectedImage) {
          this.uploadCategoryImage(updatedCategory.categoryId);
        } else {
          this.updateCategoryInList(updatedCategory);
          this.showEditModal = false;
        }
      },
      error: (error) => {
        alert('Error al actualizar la categoría: ' + error.message);
      }
    });
  }
  
  uploadCategoryImage(categoryId: number): void {
    if (!this.selectedImage) return;
    
    this.categoryService.uploadCategoryImage(categoryId, this.selectedImage).subscribe({
      next: (categoryWithImage) => {
        this.updateCategoryInList(categoryWithImage);
        this.selectedImage = null;
        this.showEditModal = false;
      },
      error: (error) => {
        alert('Error al subir la imagen: ' + error.message);
        this.showEditModal = false;
      }
    });
  }
  
  deleteCategory(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }
  
  confirmDeleteCategory(): void {
    if (!this.selectedCategory) return;
    
    this.categoryService.deleteCategory(this.selectedCategory.categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.categoryId !== this.selectedCategory?.categoryId);
        this.filterCategories();
        this.showDeleteModal = false;
        this.selectedCategory = null;
      },
      error: (error) => {
        alert('Error al eliminar la categoría: ' + error.message);
      }
    });
  }
  
  private updateCategoryInList(updatedCategory: Category): void {
    const index = this.categories.findIndex(c => c.categoryId === updatedCategory.categoryId);
    if (index !== -1) {
      this.categories[index] = {...this.categories[index], ...updatedCategory};
      this.filterCategories();
    } else {
      this.categories.push(updatedCategory);
      this.filterCategories();
    }
  }
  
  private resetCreateForm(): void {
    this.categoryCreateForm = {
      categoryName: '',
      description: ''
    };
  }
}