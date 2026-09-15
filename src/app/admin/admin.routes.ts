import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'aktualnosci',
        canActivate: [authGuard],
        loadComponent: () => import('./components/news-admin/news-admin.component').then(m => m.NewsAdminComponent),
      },
      {
        path: 'kierunki',
        canActivate: [authGuard],
        loadComponent: () => import('./components/programs-admin/programs-admin.component').then(m => m.ProgramsAdminComponent),
      },
      {
        path: 'galeria',
        canActivate: [authGuard],
        loadComponent: () => import('./components/gallery-admin/gallery-admin.component').then(m => m.GalleryAdminComponent),
      },
      {
        path: 'dokumenty',
        canActivate: [authGuard],
        loadComponent: () => import('./components/documents-admin/documents-admin.component').then(m => m.DocumentsAdminComponent),
      },
      {
        path: 'szkola',
        canActivate: [authGuard],
        loadComponent: () => import('./components/school-admin/school-admin.component').then(m => m.SchoolAdminComponent),
      },
      {
        path: 'kadra',
        canActivate: [authGuard],
        loadComponent: () => import('./components/staff-admin/staff-admin.component').then(m => m.StaffAdminComponent),
      },
    ],
  },
];
