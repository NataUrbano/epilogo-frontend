import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '../../core/auth/auth.guard';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { ReservationsListComponent } from '../app-reservations-list/app-reservations-list.component';
import { BookManagementComponent } from '../book-management/book-management.component';
import { AuthorManagementComponent } from '../author-management/author-management.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'] }, // También permitimos ROLE_LIBRARIAN en los componentes hijos
    children: [
      {
        path: '',
        loadComponent: () => import('../dashboard-home/dashboard-home.component')
          .then(m => m.DashboardHomeComponent),
        title: 'Epilogo | Dashboard'
      },
      {
        path: 'users',
        loadComponent: () => import('../users-list/users-list.component')
          .then(m => m.UsersListComponent),
        canActivate: [roleGuard],
        data: { role: 'ROLE_ADMIN' }, // Solo los administradores pueden ver usuarios
        title: 'Epilogo | Administrar Usuarios'
      },
      {
        path: 'categories',
        loadComponent: () => import('../../shared/components/categories-list/categories-list.component')
          .then(m => m.CategoriesListComponent),
        title: 'Epilogo | Administrar Categorías'
      },
      {
        path: 'reservations',
        loadComponent: () => import('../../features/app-reservations-list/app-reservations-list.component')
          .then(m => m.ReservationsListComponent),
        title: 'Epilogo | Reservas',
        canActivate: [roleGuard],
        data: { role: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'] } // Accesible para bibliotecarios y administradores
      },
      {
        path: 'books',
        component: BookManagementComponent,
        canActivate: [roleGuard],
        data: { role: ['ADMIN', 'LIBRARIAN'] }
      },
      {
        path: 'authors',
        component: AuthorManagementComponent,
        canActivate: [roleGuard],
        data: { role: ['ADMIN', 'LIBRARIAN'] },
        title: 'Epilogo | Administrar Autores'
      },
    ]
  }
];