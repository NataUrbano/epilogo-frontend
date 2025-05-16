import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { Role, RoleService } from '../../core/services/role.services';
import { User, UserUpdateAdmin } from '../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-0">
      <!-- Header & Search -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="h3 fw-bold mb-0">Gestión de Usuarios</h1>
            </div>
            <div class="col-lg-6">
              <div class="d-flex justify-content-lg-end mt-3 mt-lg-0">
                <div class="position-relative me-2 flex-grow-1" style="max-width: 300px;">
                  <input 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    (input)="filterUsers()"
                    placeholder="Buscar usuario..." 
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
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabla de usuarios -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div *ngIf="isLoading" class="d-flex justify-content-center align-items-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          
          <div *ngIf="!isLoading && filteredUsers.length === 0" class="py-5 text-center">
            <p class="text-muted mb-0">No se encontraron usuarios que coincidan con la búsqueda.</p>
          </div>
          
          <div *ngIf="!isLoading && filteredUsers.length > 0" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="py-3">Usuario</th>
                  <th class="py-3">Email</th>
                  <th class="py-3">Fecha de registro</th>
                  <th class="py-3">Estado</th>
                  <th class="py-3">Roles</th>
                  <th class="py-3 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td class="py-3">
                    <div class="d-flex align-items-center">
                      <img 
                        [src]="user.imageUrl || '/assets/images/default-avatar.png'" 
                        class="rounded-circle me-3"
                        width="40"
                        height="40"
                        style="object-fit: cover;"
                        alt="Avatar"
                      >
                      <span class="fw-medium">{{ user.userName }}</span>
                    </div>
                  </td>
                  <td class="py-3">{{ user.email }}</td>
                  <td class="py-3">{{ user.registerDate | date: 'dd/MM/yyyy' }}</td>
                  <td class="py-3">
                    <span class="badge rounded-pill" 
                          [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="py-3">
                    <div class="d-flex flex-wrap gap-1">
                      <span *ngFor="let role of user.roles" class="badge rounded-pill" 
                            [ngClass]="{
                              'bg-primary': role === 'ROLE_ADMIN', 
                              'bg-success': role === 'ROLE_LIBRARIAN',
                              'bg-info': role === 'ROLE_USER'
                            }">
                        {{ role.replace('ROLE_', '') }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 text-end">
                    <button 
                      (click)="editUser(user)" 
                      class="btn btn-sm btn-outline-primary me-1"
                    >
                      <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button 
                      (click)="deleteUser(user)" 
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Modal para editar usuario -->
      <div class="modal fade" [class.show]="showEditModal" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showEditModal" [attr.aria-hidden]="!showEditModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Usuario</h5>
              <button type="button" class="btn-close" (click)="showEditModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedUser">
              <div class="mb-3">
                <label for="userName" class="form-label">Nombre de usuario</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="userName" 
                  [(ngModel)]="userEditForm.userName"
                >
              </div>
              <div class="mb-3">
                <label for="userEmail" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="userEmail" 
                  [(ngModel)]="userEditForm.email"
                  readonly
                >
                <div class="form-text">El email no puede ser modificado.</div>
              </div>
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="userStatus" 
                    [(ngModel)]="userEditForm.isActive"
                  >
                  <label class="form-check-label" for="userStatus">
                    {{ userEditForm.isActive ? 'Usuario activo' : 'Usuario inactivo' }}
                  </label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Roles</label>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check" *ngFor="let role of availableRoles">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      [id]="'role-' + role.roleId" 
                      [checked]="isRoleSelected(role.roleName)"
                      (change)="toggleRole(role.roleName)"
                    >
                    <label class="form-check-label" [for]="'role-' + role.roleId">
                      {{ role.roleName.replace('ROLE_', '') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showEditModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="saveUserChanges()">Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showEditModal" [class.show]="showEditModal"></div>
      
      <!-- Modal de confirmación para eliminar usuario -->
      <div class="modal fade" [class.show]="showDeleteModal" [style.display]="showDeleteModal ? 'block' : 'none'" tabindex="-1" [attr.aria-modal]="showDeleteModal" [attr.aria-hidden]="!showDeleteModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger">Eliminar Usuario</h5>
              <button type="button" class="btn-close" (click)="showDeleteModal = false" aria-label="Close"></button>
            </div>
            <div class="modal-body" *ngIf="selectedUser">
              <p>¿Estás seguro de que deseas eliminar el usuario <strong>{{ selectedUser.userName }}</strong>?</p>
              <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="showDeleteModal = false">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="confirmDeleteUser()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" *ngIf="showDeleteModal" [class.show]="showDeleteModal"></div>
    </div>
  `,
  styles: [`
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-backdrop {
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
    }
    
    .badge {
      font-weight: 500;
    }
    
    .table th {
      font-weight: 500;
      font-size: 0.85rem;
      text-transform: uppercase;
      color: #6c757d;
    }
    
    .table td {
      vertical-align: middle;
    }
    
    /* Responsive improvements */
    @media (max-width: 767.98px) {
      .table {
        min-width: 800px;
      }
    }
  `]
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  
  users: User[] = [];
  filteredUsers: User[] = [];
  availableRoles: Role[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedUser: User | null = null;
  
  userEditForm: UserUpdateAdmin = {
    userName: '',
    email: '',
    roles: [],
    isActive: true
  };
  
  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }
  
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }
  
  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => 
      user.userName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.roles.some(role => role.toLowerCase().includes(search))
    );
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.filterUsers();
  }
  
  editUser(user: User): void {
    this.selectedUser = user;
    this.userEditForm = {
      userName: user.userName,
      email: user.email,
      roles: [...user.roles],
      isActive: user.isActive
    };
    this.showEditModal = true;
  }
  
  isRoleSelected(roleName: string): boolean {
    return this.userEditForm.roles?.includes(roleName) || false;
  }
  
  toggleRole(roleName: string): void {
    if (!this.userEditForm.roles) {
      this.userEditForm.roles = [];
    }
    
    if (this.isRoleSelected(roleName)) {
      this.userEditForm.roles = this.userEditForm.roles.filter(role => role !== roleName);
    } else {
      this.userEditForm.roles.push(roleName);
    }
  }
  
  saveUserChanges(): void {
    if (!this.selectedUser) return;
    
    // Actualizamos el nombre de usuario si ha cambiado
    if (this.userEditForm.userName !== this.selectedUser.userName) {
      this.userService.updateUser(this.selectedUser.userId, {
        userName: this.userEditForm.userName
      }).subscribe({
        next: (updatedUser) => {
          // Actualizar usuario en la lista
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
        }
      });
    }
    
    // Actualizamos el estado si ha cambiado
    if (this.userEditForm.isActive !== this.selectedUser.isActive) {
      this.userService.updateUserStatus(
        this.selectedUser.userId, 
        this.userEditForm.isActive || false
      ).subscribe({
        next: (updatedUser) => {
          // Actualizar usuario en la lista
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error al actualizar estado de usuario:', error);
        }
      });
    }
    
    // Actualizamos los roles si han cambiado
    if (!this.arraysEqual(this.userEditForm.roles || [], this.selectedUser.roles)) {
      this.userService.updateUserRoles(
        this.selectedUser.userId, 
        this.userEditForm.roles || []
      ).subscribe({
        next: (updatedUser) => {
          // Actualizar usuario en la lista
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error al actualizar roles de usuario:', error);
        }
      });
    }
    
    this.showEditModal = false;
    this.selectedUser = null;
  }
  
  deleteUser(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }
  
  confirmDeleteUser(): void {
    if (!this.selectedUser) return;
    
    this.userService.deleteUser(this.selectedUser.userId).subscribe({
      next: () => {
        // Eliminar usuario de la lista
        this.users = this.users.filter(u => u.userId !== this.selectedUser?.userId);
        this.filterUsers(); // Actualizar lista filtrada
        this.showDeleteModal = false;
        this.selectedUser = null;
      },
      error: (error: any) => {
        console.error('Error al eliminar usuario:', error);
      }
    });
  }
  
  private updateUserInList(updatedUser: User): void {
    const index = this.users.findIndex(u => u.userId === updatedUser.userId);
    if (index !== -1) {
      this.users[index] = {...this.users[index], ...updatedUser};
      this.filterUsers(); // Actualizar lista filtrada
    }
  }
  
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, i) => val === sortedB[i]);
  }
}