import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminSecretGuard } from './core/guards/admin-secret.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {
      seo: {
        title: 'ZCKOiZ Zabrze',
        description: 'Zespół Centrów Kształcenia Zawodowego w Zabrzu - Technikum i Branżowa Szkoła I Stopnia. Poznaj naszą ofertę edukacyjną.',
      },
    },
  },
  {
    path: 'oferta',
    loadComponent: () => import('./features/oferta/oferta.component').then(m => m.OfertaComponent),
    data: {
      seo: {
        title: 'Oferta edukacyjna',
        description: 'Poznaj kierunki kształcenia w ZCKOiZ Zabrze - technikum i branżowa szkoła I stopnia.',
      },
    },
  },
  {
    path: 'edukacja-mundurowa',
    loadComponent: () => import('./features/edukacja-mundurowa/edukacja-mundurowa.component').then(m => m.EdukacjaMundurowaComponent),
    data: {
      seo: {
        title: 'Edukacja mundurowa',
        description: 'Edukacja mundurowa w ZCKOiZ Zabrze - dyscyplina, sprawność, bezpieczeństwo i praca zespołowa.',
      },
    },
  },
  {
    path: 'oferta/:slug',
    loadComponent: () => import('./features/oferta/program-detail.component').then(m => m.ProgramDetailComponent),
    data: {
      seo: {
        title: 'Kierunek kształcenia',
        description: 'Szczegóły kierunku kształcenia w ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'aktualnosci',
    loadComponent: () => import('./features/aktualnosci/aktualnosci-list.component').then(m => m.AktualnosciListComponent),
    data: {
      seo: {
        title: 'Aktualności',
        description: 'Najnowsze wiadomości i wydarzenia z życia ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'aktualnosci/:slug',
    loadComponent: () => import('./features/aktualnosci/aktualnosc-detail.component').then(m => m.AktualnoscDetailComponent),
    data: {
      seo: {
        title: 'Aktualność',
        description: 'Wiadomość ze szkoły ZCKOiZ Zabrze.',
      },
    },
  },
{
    path: 'galeria',
    loadComponent: () => import('./features/galeria/galeria.component').then(m => m.GaleriaComponent),
    data: {
      seo: {
        title: 'Galeria',
        description: 'Galeria zdj\u0119\u0107 z \u017cycia ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'galeria/:slug',
    loadComponent: () => import('./features/galeria/album-detail.component').then(m => m.AlbumDetailComponent),
    data: {
      seo: {
        title: 'Album galerii',
        description: 'Album zdj\u0119\u0107 z ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'szkola/edukacja-mundurowa',
    redirectTo: '/edukacja-mundurowa',
    pathMatch: 'full',
  },
  {
    path: 'szkola/:slug',
    loadComponent: () => import('./features/szkola/school-page.component').then(m => m.SchoolPageComponent),
    data: {
      seo: {
        title: 'Szkoła',
        description: 'Ważne informacje o Zabrzańskim Centrum Kształcenia Ogólnego i Zawodowego.',
      },
    },
  },
  {
    path: 'dokumenty',
    loadComponent: () => import('./features/dokumenty/dokumenty.component').then(m => m.DokumentyComponent),
    data: {
      seo: {
        title: 'Dokumenty',
        description: 'Dokumenty do pobrania - statut, rekrutacja, regulaminy ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'kadra',
    loadComponent: () => import('./features/kadra/kadra.component').then(m => m.KadraComponent),
    data: {
      seo: {
        title: 'Kadra',
        description: 'Dyrekcja i nauczyciele ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./features/kontakt/kontakt.component').then(m => m.KontaktComponent),
    data: {
      seo: {
        title: 'Kontakt',
        description: 'Skontaktuj si�t z ZCKOiZ Zabrze - dane kontaktowe, godziny pracy sekretariatu.',
      },
    },
  },
  {
    path: 'rekrutacja',
    loadComponent: () => import('./features/rekrutacja/rekrutacja.component').then(m => m.RekrutacjaComponent),
    data: {
      seo: {
        title: 'Rekrutacja',
        description: 'Zasady, terminy i dokumenty potrzebne do rekrutacji do ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: 'organizacja-roku',
    loadComponent: () => import('./features/organizacja/organizacja-roku.component').then(m => m.OrganizacjaRokuComponent),
    data: {
      seo: {
        title: 'Organizacja roku',
        description: 'Ważne daty, dni wolne oraz organizacja roku szkolnego w ZCKOiZ Zabrze.',
      },
    },
  },
  {
    path: ':secret',
    canActivate: [adminSecretGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: ':secret/login',
    canActivate: [adminSecretGuard],
    loadComponent: () => import('./admin/components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
