import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { Role, RoleService } from '../../core/services/role.services';
import { User, UserUpdateAdmin } from '../../core/models/user.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private translateService = inject(TranslateService);
  
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
        console.error('Error loading users:', error);
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
        console.error('Error loading roles:', error);
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
    
    if (this.userEditForm.userName !== this.selectedUser.userName) {
      this.userService.updateUser(this.selectedUser.userId, {
        userName: this.userEditForm.userName
      }).subscribe({
        next: (updatedUser) => {
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
        }
      });
    }
    
    if (this.userEditForm.isActive !== this.selectedUser.isActive) {
      this.userService.updateUserStatus(
        this.selectedUser.userId, 
        this.userEditForm.isActive || false
      ).subscribe({
        next: (updatedUser) => {
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error updating user status:', error);
        }
      });
    }
    
    if (!this.arraysEqual(this.userEditForm.roles || [], this.selectedUser.roles)) {
      this.userService.updateUserRoles(
        this.selectedUser.userId, 
        this.userEditForm.roles || []
      ).subscribe({
        next: (updatedUser) => {
          this.updateUserInList(updatedUser);
        },
        error: (error: any) => {
          console.error('Error updating user roles:', error);
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
        this.users = this.users.filter(u => u.userId !== this.selectedUser?.userId);
        this.filterUsers();
        this.showDeleteModal = false;
        this.selectedUser = null;
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
      }
    });
  }
  
  private updateUserInList(updatedUser: User): void {
    const index = this.users.findIndex(u => u.userId === updatedUser.userId);
    if (index !== -1) {
      this.users[index] = {...this.users[index], ...updatedUser};
      this.filterUsers();
    }
  }
  
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, i) => val === sortedB[i]);
  }
}