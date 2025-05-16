import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRegistration } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow border-0 rounded-lg">
        <div class="card-body p-4 p-lg-5">
          <div class="text-center mb-4">
            <h1 class="h3 fw-bold">Crear una cuenta</h1>
            <p class="text-muted small">
              O
              <a [routerLink]="['/auth/login']" class="text-primary text-decoration-none">
                inicia sesión con tu cuenta existente
              </a>
            </p>
          </div>
          
          <!-- Alert message -->
          <div *ngIf="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Error:</strong> {{ errorMessage }}
            </div>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="needs-validation">
            <div class="mb-3">
              <label for="userName" class="form-label">Nombre de usuario</label>
              <input
                id="userName"
                type="text"
                formControlName="userName"
                class="form-control"
                [ngClass]="{'is-invalid': registerForm.get('userName')?.invalid && (registerForm.get('userName')?.dirty || registerForm.get('userName')?.touched)}"
                placeholder="Tu nombre de usuario"
              />
              <div *ngIf="registerForm.get('userName')?.invalid && (registerForm.get('userName')?.dirty || registerForm.get('userName')?.touched)" class="invalid-feedback">
                Nombre de usuario es requerido (mínimo 3 caracteres)
              </div>
            </div>
            
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                [ngClass]="{'is-invalid': registerForm.get('email')?.invalid && (registerForm.get('email')?.dirty || registerForm.get('email')?.touched)}"
                placeholder="tu@email.com"
              />
              <div *ngIf="registerForm.get('email')?.invalid && (registerForm.get('email')?.dirty || registerForm.get('email')?.touched)" class="invalid-feedback">
                Email inválido
              </div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="form-control"
                [ngClass]="{'is-invalid': registerForm.get('password')?.invalid && (registerForm.get('password')?.dirty || registerForm.get('password')?.touched)}"
                placeholder="Al menos 6 caracteres"
              />
              <div *ngIf="registerForm.get('password')?.invalid && (registerForm.get('password')?.dirty || registerForm.get('password')?.touched)" class="invalid-feedback">
                La contraseña debe tener al menos 6 caracteres
              </div>
            </div>
            
            <div class="mb-4">
              <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="form-control"
                [ngClass]="{'is-invalid': registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched}"
                placeholder="Repite la contraseña"
              />
              <div *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="invalid-feedback">
                Las contraseñas no coinciden
              </div>
            </div>
            
            <div class="d-grid">
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="btn btn-primary btn-lg"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? 'Procesando...' : 'Registrarse' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor() {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  
  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const userRegistration: UserRegistration = {
      userName: this.registerForm.value.userName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      isActive : true
    };
    
    this.authService.register(userRegistration).subscribe({
      
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al registrarse. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}