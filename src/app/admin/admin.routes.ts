import { Routes } from '@angular/router';
import { editorGuard, adminGuard } from '../core/guards/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'aktualnosci',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/news-admin/news-admin.component').then(m => m.NewsAdminComponent),
      },
      {
        path: 'kierunki',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/programs-admin/programs-admin.component').then(m => m.ProgramsAdminComponent),
      },
      {
        path: 'galeria',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/gallery-admin/gallery-admin.component').then(m => m.GalleryAdminComponent),
      },
      {
        path: 'dokumenty',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/documents-admin/documents-admin.component').then(m => m.DocumentsAdminComponent),
      },
      {
        path: 'kadra',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/staff-admin/staff-admin.component').then(m => m.StaffAdminComponent),
      },
      {
        path: 'uzytkownicy',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/users-admin/users-admin.component').then(m => m.UsersAdminComponent),
      },
      {
        path: 'ustawienia',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/settings-admin/settings-admin.component').then(m => m.SettingsAdminComponent),
      },
    ],
  },
];
