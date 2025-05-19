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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
      next: (user : User)  => {
        // User data is updated via the currentUser$ subscription above
        return
      },
      error: (error : Error) => {
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