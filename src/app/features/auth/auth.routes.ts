import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard, publicGuard } from '../../core/auth/auth.guard';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from '../profile/profile/profile.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
    title: 'Epilogo | Iniciar sesión'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard],
    title: 'Epilogo | Registrarse'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Epilogo | Mi Perfil'
  }
];