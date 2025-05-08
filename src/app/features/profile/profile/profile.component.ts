import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { User, UserUpdate } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { UserReservationsComponent } from '../../../shared/components/user-reservations/user-reservations.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    TranslateModule, 
    UserReservationsComponent,
    RouterModule
  ],
  template: `<div class="container-fluid py-4">
  <div class="row">
    <!-- Sidebar - responsivo (colapsa en móvil) -->
    <div class="col-lg-3 mb-4 mb-lg-0">
      <div class="card shadow-sm border-0 h-100">
        <!-- Información del usuario -->
        <div class="card-body text-center p-4">
          <!-- Avatar del usuario -->
          <div class="position-relative mx-auto mb-3" style="width: 120px; height: 120px;">
            <div class="rounded-circle overflow-hidden w-100 h-100 bg-light">
              <div *ngIf="user?.imageUrl; else userInitials">
                <img [src]="user?.imageUrl" alt="{{ 'PROFILE.PROFILE_PHOTO' | translate }}" class="w-100 h-100 object-fit-cover" />
              </div>
              <ng-template #userInitials>
                <div class="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary">
                  <span class="fs-3 fw-semibold">{{ getUserInitials() }}</span>
                </div>
              </ng-template>
            </div>
            <!-- Botón para cambiar la imagen -->
            <label for="profile-image" class="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2 cursor-pointer">
              <i class="bi bi-camera text-primary"></i>
              <input 
                type="file" 
                id="profile-image" 
                (change)="onFileSelected($event)"
                accept="image/*"
                class="d-none"
              />
            </label>
          </div>
          
          <h5 class="fw-bold mb-1">{{ user?.userName }}</h5>
          <p class="text-muted small mb-3">{{ user?.email }}</p>
          
          <!-- Estadísticas básicas del usuario -->
          <div class="row g-0 mb-3 text-center border-top border-bottom py-2">
            <div class="col-4 border-end">
              <div class="py-2">
                <div class="fw-bold">{{ userStats.points || 0 }}</div>
                <div class="small text-muted">{{ 'PROFILE.POINTS' | translate }}</div>
              </div>
            </div>
            <div class="col-4 border-end">
              <div class="py-2">
                <div class="fw-bold">{{ userStats.activeReservations || 0 }}</div>
                <div class="small text-muted">{{ 'PROFILE.ACTIVE_BOOKS' | translate }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="py-2">
                <div class="fw-bold">{{ userStats.completedReservations || 0 }}</div>
                <div class="small text-muted">{{ 'PROFILE.COMPLETED' | translate }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Menú de navegación de perfil -->
        <div class="list-group list-group-flush">
          <a 
            href="#profile-reservations"
            class="list-group-item list-group-item-action"
            [class.active]="activeTab === 'reservations'"
            (click)="setActiveTab('reservations', $event)"
          >
            <i class="bi bi-book me-3"></i> {{ 'PROFILE.MY_RESERVATIONS' | translate }}
          </a>
          <a 
            href="#profile-info"
            class="list-group-item list-group-item-action"
            [class.active]="activeTab === 'info'"
            (click)="setActiveTab('info', $event)"
          >
            <i class="bi bi-person me-3"></i> {{ 'PROFILE.PERSONAL_INFO' | translate }}
          </a>
          <a 
            href="#profile-security"
            class="list-group-item list-group-item-action"
            [class.active]="activeTab === 'security'"
            (click)="setActiveTab('security', $event)"
          >
            <i class="bi bi-shield-lock me-3"></i> {{ 'PROFILE.SECURITY' | translate }}
          </a>
          <a 
            href="#profile-preferences"
            class="list-group-item list-group-item-action"
            [class.active]="activeTab === 'preferences'"
            (click)="setActiveTab('preferences', $event)"
          >
            <i class="bi bi-gear me-3"></i> {{ 'PROFILE.PREFERENCES' | translate }}
          </a>
        </div>
      </div>
    </div>
    
    <!-- Área principal de contenido -->
    <div class="col-lg-9">
      <!-- Alerta de éxito o error -->
      <div *ngIf="successMessage" class="alert alert-success d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <div>{{ successMessage }}</div>
      </div>
      
      <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>{{ errorMessage }}</div>
      </div>
      
      <!-- Panel de mis reservaciones -->
      <div 
        id="profile-reservations"
        class="mb-4"
        [ngClass]="{'d-none': activeTab !== 'reservations'}"
      >
        <app-user-reservations (statsUpdate)="updateReservationStats($event)"></app-user-reservations>
      </div>
      
      <!-- Panel de información personal -->
      <div 
        id="profile-info"
        class="card shadow-sm border-0 mb-4"
        [ngClass]="{'d-none': activeTab !== 'info'}"
      >
        <div class="card-header bg-white py-3">
          <h5 class="card-title mb-0">{{ 'PROFILE.PERSONAL_INFO' | translate }}</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="mb-3">
              <label for="userName" class="form-label">{{ 'PROFILE.USER_NAME' | translate }}</label>
              <input
                type="text"
                id="userName"
                formControlName="userName"
                class="form-control"
                [ngClass]="{'is-invalid': profileForm.get('userName')?.invalid && (profileForm.get('userName')?.dirty || profileForm.get('userName')?.touched)}"
              />
              <div *ngIf="profileForm.get('userName')?.invalid && (profileForm.get('userName')?.dirty || profileForm.get('userName')?.touched)" class="invalid-feedback">
                {{ 'PROFILE.USERNAME_REQUIRED' | translate }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="email" class="form-label">{{ 'PROFILE.EMAIL' | translate }}</label>
              <input
                type="email"
                id="email"
                [value]="user?.email"
                readonly
                class="form-control bg-light"
              />
              <div class="form-text">{{ 'PROFILE.EMAIL_CANNOT_CHANGE' | translate }}</div>
            </div>
            
            <!-- Campos adicionales que puedas necesitar -->
            <div class="mb-3">
              <label for="bio" class="form-label">{{ 'PROFILE.BIO' | translate }}</label>
              <textarea
                id="bio"
                formControlName="bio"
                class="form-control"
                rows="3"
                placeholder="{{ 'PROFILE.BIO_PLACEHOLDER' | translate }}"
              ></textarea>
            </div>
            
            <div class="text-end">
              <button
                type="submit"
                [disabled]="profileForm.invalid || isSaving || !profileForm.dirty"
                class="btn btn-primary"
              >
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isSaving ? ('PROFILE.SAVING' | translate) : ('PROFILE.SAVE_CHANGES' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Panel de seguridad -->
      <div 
        id="profile-security"
        class="card shadow-sm border-0 mb-4"
        [ngClass]="{'d-none': activeTab !== 'security'}"
      >
        <div class="card-header bg-white py-3">
          <h5 class="card-title mb-0">{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
            <div class="mb-3">
              <label for="currentPassword" class="form-label">{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</label>
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                class="form-control"
                [ngClass]="{'is-invalid': passwordForm.get('currentPassword')?.invalid && (passwordForm.get('currentPassword')?.dirty || passwordForm.get('currentPassword')?.touched)}"
              />
              <div *ngIf="passwordForm.get('currentPassword')?.invalid && (passwordForm.get('currentPassword')?.dirty || passwordForm.get('currentPassword')?.touched)" class="invalid-feedback">
                {{ 'PROFILE.CURRENT_PASSWORD_REQUIRED' | translate }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="newPassword" class="form-label">{{ 'PROFILE.NEW_PASSWORD' | translate }}</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                class="form-control"
                [ngClass]="{'is-invalid': passwordForm.get('newPassword')?.invalid && (passwordForm.get('newPassword')?.dirty || passwordForm.get('newPassword')?.touched)}"
              />
              <div *ngIf="passwordForm.get('newPassword')?.invalid && (passwordForm.get('newPassword')?.dirty || passwordForm.get('newPassword')?.touched)" class="invalid-feedback">
                {{ 'PROFILE.NEW_PASSWORD_LENGTH' | translate }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="confirmNewPassword" class="form-label">{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</label>
              <input
                type="password"
                id="confirmNewPassword"
                formControlName="confirmNewPassword"
                class="form-control"
                [ngClass]="{'is-invalid': passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmNewPassword')?.touched}"
              />
              <div *ngIf="passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmNewPassword')?.touched" class="invalid-feedback">
                {{ 'PROFILE.PASSWORDS_DONT_MATCH' | translate }}
              </div>
            </div>
            
            <div class="text-end">
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isChangingPassword"
                class="btn btn-primary"
              >
                <span *ngIf="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isChangingPassword ? ('PROFILE.UPDATING' | translate) : ('PROFILE.UPDATE_PASSWORD' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Panel de preferencias -->
      <div 
        id="profile-preferences"
        class="card shadow-sm border-0 mb-4"
        [ngClass]="{'d-none': activeTab !== 'preferences'}"
      >
        <div class="card-header bg-white py-3">
          <h5 class="card-title mb-0">{{ 'PROFILE.PREFERENCES' | translate }}</h5>
        </div>
        <div class="card-body p-4">
          <div class="mb-3 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="emailNotifications" [(ngModel)]="preferences.emailNotifications">
            <label class="form-check-label" for="emailNotifications">{{ 'PROFILE.EMAIL_NOTIFICATIONS' | translate }}</label>
          </div>
          
          <div class="mb-3 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="overdueAlerts" [(ngModel)]="preferences.overdueAlerts">
            <label class="form-check-label" for="overdueAlerts">{{ 'PROFILE.OVERDUE_ALERTS' | translate }}</label>
          </div>
          
          <div class="mb-3 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="darkMode" [(ngModel)]="preferences.darkMode">
            <label class="form-check-label" for="darkMode">{{ 'PROFILE.DARK_MODE' | translate }}</label>
          </div>
          
          <div class="mb-3">
            <label for="language" class="form-label">{{ 'PROFILE.LANGUAGE' | translate }}</label>
            <select 
              class="form-select" 
              id="language" 
              [(ngModel)]="selectedLanguage" 
              name="language"
              (change)="changeLanguage()"
              [ngModelOptions]="{standalone: true}"
            >
              <option value="es">{{ 'LANGUAGES.SPANISH' | translate }}</option>
              <option value="en">{{ 'LANGUAGES.ENGLISH' | translate }}</option>
              <option value="fr">{{ 'LANGUAGES.FRENCH' | translate }}</option>
            </select>
          </div>
          
          <div class="text-end">
            <button type="button" class="btn btn-primary" (click)="savePreferences()">{{ 'PROFILE.SAVE_PREFERENCES' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);
  
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  isSaving = false;
  isChangingPassword = false;
  successMessage = '';
  errorMessage = '';
  activeTab: string = 'reservations'; // Cambiado a 'reservaciones' por defecto
  selectedLanguage: string = 'es';
  
  // Estadísticas del usuario
  userStats = {
    points: 0,
    activeReservations: 0,
    completedReservations: 0,
  };
  
  // Preferencias del usuario
  preferences = {
    emailNotifications: true,
    overdueAlerts: true,
    darkMode: false
  };
  
  constructor() {
    // Initialize forms
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      bio: ['']
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Get current user and populate form from BehaviorSubject
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          userName: user.userName
        });
      }
    });
    
    // Also fetch latest user data from the server
    this.authService.getCurrentUserInfo().subscribe({
      next: () => {
        // User data is updated via the currentUser$ subscription above
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar la información del usuario.';
      }
    });

    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.selectedLanguage = savedLang;
    } else {
      // Si no hay idioma guardado, usar el del navegador o el predeterminado
      const browserLang = this.translateService.getBrowserLang();
      this.selectedLanguage = browserLang?.match(/es|en|fr/) ? browserLang : 'es';
    }
    
    // Asegurarse de que el servicio de traducción use el idioma seleccionado
    this.translateService.use(this.selectedLanguage);
    
    // Cargar preferencias guardadas
    this.loadPreferences();
  }
  
  // Método para actualizar las estadísticas cuando cambian las reservaciones
  updateReservationStats(stats: any): void {
    this.userStats = { ...this.userStats, ...stats };
  }
  
  // Get user initials for avatar placeholder
  getUserInitials(): string {
    if (!this.user?.userName) return '';
    
    const nameParts = this.user.userName.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
  }
  
  // Handle file selection for profile image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Formato de imagen no válido. Usa JPG, PNG, GIF o WEBP.';
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      this.errorMessage = 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.';
      return;
    }
    
    // La subida de imagen probablemente se manejará de otra manera
    // Por ahora, mantenemos la implementación original
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.updateProfileImage(file).subscribe({
      next: (updatedUser) => {
        this.isSaving = false;
        this.successMessage = 'Imagen de perfil actualizada correctamente.';
        
        // Asegurarnos de que la imagen se muestre inmediatamente (sin caché)
        if (updatedUser.imageUrl) {
          // Añadir un parámetro de timestamp para evitar caché
          this.user = {
            ...updatedUser,
            imageUrl: updatedUser.imageUrl + '?t=' + new Date().getTime()
          };
        }
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.message || 'Error al actualizar la imagen de perfil.';
        console.error('Error detallado:', error);
      }
    });
  }
  
  // Update profile info
  updateProfile(): void {
    if (this.profileForm.invalid || !this.user) return;
    
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const update: UserUpdate = {
      userName: this.profileForm.value.userName,
    };
    
    // Usar el método updateUser del UserService
    this.userService.updateUser(this.user.userId, update).subscribe({
      next: (updatedUser) => {
        this.isSaving = false;
        this.profileForm.markAsPristine();
        this.successMessage = 'Perfil actualizado correctamente.';
        
        // Actualizar el usuario en el AuthService (BehaviorSubject)
        const currentUser = this.user;
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('user_data', JSON.stringify(mergedUser));
          
          // Emitir el usuario actualizado a través del BehaviorSubject
          const userSubject = this.authService['currentUserSubject'];
          if (userSubject) {
            userSubject.next(mergedUser);
          }
        }
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.message || 'Error al actualizar el perfil.';
      }
    });
  }
  
  // Update password
  updatePassword(): void {
    if (this.passwordForm.invalid || !this.user) return;
    
    this.isChangingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const update: UserUpdate = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };
    
    // Usar el método updateUser del UserService
    this.userService.updateUser(this.user.userId, update).subscribe({
      next: (updatedUser) => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.successMessage = 'Contraseña actualizada correctamente.';
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.errorMessage = error.message || 'Error al actualizar la contraseña.';
      }
    });
  }
  
  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    
    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  // Cambiar pestaña activa
  setActiveTab(tab: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = tab;
  }

  // Método para cambiar el idioma
  changeLanguage(): void {
    this.translateService.use(this.selectedLanguage);
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
    
    // Mostrar mensaje de confirmación
    this.successMessage = this.translateService.instant('PROFILE.LANGUAGE_CHANGED');
    setTimeout(() => this.successMessage = '', 3000);
  }
  
  // Cargar preferencias del usuario
  loadPreferences(): void {
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
      } catch (error) {
        console.error('Error loading preferences', error);
      }
    }
  }
  
  // Guardar preferencias del usuario
  savePreferences(): void {
    localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
    
    // Aplicar tema oscuro si está activado
    if (this.preferences.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    this.successMessage = this.translateService.instant('PROFILE.PREFERENCES_SAVED');
    setTimeout(() => this.successMessage = '', 3000);
  }
}