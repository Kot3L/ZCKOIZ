import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'oferta/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'aktualnosci/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: ':secret/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
