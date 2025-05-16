import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category, CategoryCreate, CategoryUpdate } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <!-- Header & Search -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="h3 fw-bold mb-0">Gestión de Categorías</h1>
            </div>
            <div class="col-lg-6">
              <div class="d-flex justify-content-lg-end mt-3 mt-lg-0">
                <div class="position-relative me-2 flex-grow-1" style="max-width: 300px;">
                  <input 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    (input)="filterCategories()"
                    placeholder="Buscar categoría..." 
                    class="form-control"
                  >
                  <button 
                    *ngIf="searchTerm" 
                    (click)="clearSearch()"
                    class="btn-close position-absolute top-50 end-0 translate-middle-y me-2 small"
                    type="button"
                    aria-label="Clear"
                  ></button>
                </div>
                <button 
                  (click)="showCreateModal = true"
                  class="btn btn-primary"
                >
                  <i class="bi bi-plus-lg me-1"></i> Nueva Categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Spinner de carga -->
      <div *ngIf="isLoading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <!-- Mensaje sin resultados -->
      <div *ngIf="!isLoading && filteredCategories.length === 0" class="card border-0 shadow-sm">
        <div class="card-body py-5 text-center">
          <p class="text-muted mb-0">No se encontraron categorías que coincidan con la búsqueda.</p>
        </div>
      </div>
      
      <!-- Grid de categorías -->
      <div *ngIf="!isLoading && filteredCategories.length > 0" class="row g-4">
        <div class="col-sm-6 col-lg-4 col-xl-3" *ngFor="let category of filteredCategories">
          <div class="card border-0 shadow-sm h-100 category-card">
            <div class="position-relative">
              <div class="category-image">
                <img 
                  [src]="category.imageUrl || '/assets/images/default-category.jpg'" 
                  [alt]="category.categoryName"
                  class="card-img-top"
                  style="object-fit: cover; height: 180px;"
                >
              </div>
              <div class="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-to-top">
                <h5 class="card-title text-white mb-0">{{ category.categoryName }}</h5>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <div *ngIf="category.description" class="card-text text-muted small mb-3 flex-grow-1">
                {{ category.description | slice:0:100 }}{{ category.description.length > 100 ? '...' : '' }}
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-light text-dark">
                  <i class="bi bi-book me-1"></i> {{ category.totalBooks || 0 }} libros
                </span>
                <div class="btn-group">
                  <button 
                    (click)="editCategory(category)" 
                    class="btn btn-sm btn-outline-primary"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    (click)="deleteCategory(category)" 
                    class="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal para crear categoría -->
      <div class="modal fade" [class.show]="showCreateModal" [style.display]="showCreateModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showCreateModal" [attr.aria-hidden]="!showCreateModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nueva Categoría</h5>
              <button type="button" class="btn-close" (click)="showCreateModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="categoryName" class="form-label">Nombre de la categoría</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="categoryName" 
                  [(ngModel)]="categoryCreateForm.categoryName"
                  placeholder="Ej. Ciencia Ficción"
                >
              </div>
              <div class="mb-3">
                <label for="categoryDescription" class="form-label">Descripción</label>
                <textarea 
                  class="form-control" 
                  id="categoryDescription" 
                  [(ngModel)]="categoryCreateForm.description"
                  rows="3"
                  placeholder="Breve descripción de la categoría"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showCreateModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="createCategory()">Crear categoría</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showCreateModal" [class.show]="showCreateModal"></div>
      
      <!-- Modal para editar categoría -->
      <div class="modal fade" [class.show]="showEditModal" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showEditModal" [attr.aria-hidden]="!showEditModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Categoría</h5>
              <button type="button" class="btn-close" (click)="showEditModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedCategory">
              <div class="mb-3">
                <label for="editCategoryName" class="form-label">Nombre de la categoría</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="editCategoryName" 
                  [(ngModel)]="categoryEditForm.categoryName"
                >
              </div>
              <div class="mb-3">
                <label for="editCategoryDescription" class="form-label">Descripción</label>
                <textarea 
                  class="form-control" 
                  id="editCategoryDescription" 
                  [(ngModel)]="categoryEditForm.description"
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Imagen actual</label>
                <div class="card">
                  <div style="height: 160px; overflow: hidden">
                    <img 
                      [src]="selectedCategory.imageUrl || '/assets/images/default-category.jpg'" 
                      [alt]="selectedCategory.categoryName"
                      class="img-fluid w-100"
                      style="object-fit: cover; height: 100%;"
                    >
                  </div>
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="form-text">Selecciona una nueva imagen para cambiarla</div>
                      <div>
                        <input 
                          type="file" 
                          (change)="onImageSelected($event)"
                          accept="image/*"
                          class="d-none"
                          #imageInput
                        >
                        <button 
                          (click)="imageInput.click()"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="bi bi-upload me-1"></i> Subir imagen
                        </button>
                      </div>
                    </div>
                    <div *ngIf="selectedImage" class="mt-2 small text-success">
                      Nueva imagen seleccionada: {{ selectedImage.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showEditModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="saveCategory()">Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showEditModal" [class.show]="showEditModal"></div>
      
      <!-- Modal de confirmación para eliminar categoría -->
      <div class="modal fade" [class.show]="showDeleteModal" [style.display]="showDeleteModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showDeleteModal" [attr.aria-hidden]="!showDeleteModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger">Eliminar Categoría</h5>
              <button type="button" class="btn-close" (click)="showDeleteModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedCategory">
              <p>¿Estás seguro de que deseas eliminar la categoría <strong>{{ selectedCategory.categoryName }}</strong>?</p>
              <p *ngIf="selectedCategory.totalBooks && selectedCategory.totalBooks > 0" class="text-warning mb-3">
                <i class="bi bi-exclamation-triangle me-1"></i>
                Esta categoría tiene {{ selectedCategory.totalBooks }} libros asociados.
              </p>
              <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showDeleteModal = false">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="confirmDeleteCategory()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showDeleteModal" [class.show]="showDeleteModal"></div>
    </div>
  `,
  styles: [`
    .bg-gradient-to-top {
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
    }
    
    .category-card {
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
    }
    
    .category-image {
      overflow: hidden;
    }
    
    .category-card:hover .category-image img {
      transform: scale(1.05);
    }
    
    .category-image img {
      transition: transform 0.3s ease;
    }
    
    /* Modal custom styles */
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-backdrop {
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
    }
    
    /* Responsive improvements */
    @media (max-width: 767.98px) {
      .btn-group .btn {
        padding: 0.25rem 0.5rem;
      }
    }
  `]
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
    console.log('Iniciando carga de categorías');
    
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categorías recibidas del servicio:', categories);
        this.categories = [];
        this.loadCategoryDetails(categories);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadCategoryDetails(categorySummaries: any[]): void {
    // Si no hay categorías, terminamos
    if (categorySummaries.length === 0) {
      this.isLoading = false;
      return;
    }
    
    // Para cada resumen de categoría, obtenemos su detalle
    let loadedCount = 0;
    categorySummaries.forEach(summary => {
      this.categoryService.getCategoryById(summary.categoryId).subscribe({
        next: (category) => {
          // Ya no necesitamos el mapa de URLs, ya que las URLs se gestionan correctamente en el backend
          this.categories.push(category);
          loadedCount++;
          
          // Cuando se hayan cargado todas las categorías
          if (loadedCount === categorySummaries.length) {
            this.filteredCategories = [...this.categories];
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error(`Error al cargar detalle de categoría ${summary.categoryId}:`, error);
          loadedCount++;
          
          // Si hubo error, igual contamos como cargada
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
        // Añadir a la lista y resetear formulario
        this.categories.push(newCategory);
        this.filterCategories();
        this.resetCreateForm();
        this.showCreateModal = false;
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
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
    
    // Actualizamos los datos de la categoría
    this.categoryService.updateCategory(
      this.selectedCategory.categoryId, 
      this.categoryEditForm
    ).subscribe({
      next: (updatedCategory) => {
        // Si hay imagen para subir, la procesamos
        if (this.selectedImage) {
          this.uploadCategoryImage(updatedCategory.categoryId);
        } else {
          this.updateCategoryInList(updatedCategory);
          this.showEditModal = false;
        }
      },
      error: (error) => {
        console.error('Error al actualizar categoría:', error);
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
        console.error('Error al subir imagen de categoría:', error);
        alert('Error al subir la imagen: ' + error.message);
        // Aún así cerramos el modal, la actualización de datos ya se hizo
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
        // Eliminar categoría de la lista
        this.categories = this.categories.filter(c => c.categoryId !== this.selectedCategory?.categoryId);
        this.filterCategories();
        this.showDeleteModal = false;
        this.selectedCategory = null;
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        alert('Error al eliminar la categoría: ' + error.message);
      }
    });
  }
  
  private updateCategoryInList(updatedCategory: Category): void {
    console.log('Actualizando categoría en la lista:', updatedCategory);
    console.log('URL de imagen recibida:', updatedCategory.imageUrl);
    
    const index = this.categories.findIndex(c => c.categoryId === updatedCategory.categoryId);
    if (index !== -1) {
      console.log('Categoría antes de actualizar:', this.categories[index]);
      this.categories[index] = {...this.categories[index], ...updatedCategory};
      console.log('Categoría después de actualizar:', this.categories[index]);
      this.filterCategories();
    } else {
      // Si por alguna razón no está en la lista, la añadimos
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