import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';
import { ProfileComponent } from './features/profile/profile/profile.component';
import { ReservationDetailComponent } from './shared/components/reservation-detail/reservation-detail.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home/home.component').then(m => m.HomeComponent),
    title: 'Epilogo | Inicio'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { role: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
    title: 'Epilogo | No autorizado'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reservations/:id',
    component: ReservationDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Epilogo | Página no encontrada'
  }
];