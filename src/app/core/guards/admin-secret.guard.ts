import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminStateService } from '../services/admin-state.service';

/**
 * Sekret nigdzie nie jest trzymany w postaci jawnej — ani w kodzie, ani w bazie.
 * W kodzie znajduje się wyłącznie skrót SHA-256 tajnego segmentu URL.
 * Guard porównuje hash wpisanego segmentu z tym skrótem, więc odtworzenie
 * sekretu z repozytorium/Firestore nie jest możliwe (jedynie brute-force).
 */

const SECRET_HASH = 'ab102f5d1a15d7bf6d834e03d7c17dbaed46c35eca075e87e71f9fcbda2fd0e4';

export const adminSecretGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const adminState = inject(AdminStateService);

  if (typeof window === 'undefined') return true; 
  if (adminState.secret()) return true;

  const candidate = route.paramMap.get('secret') ?? '';
  const hash = await sha256(candidate);
  if (hash === SECRET_HASH) {
    adminState.secret.set(candidate);
    return true;
  }
  return router.createUrlTree(['/']);
};

async function sha256(text: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '';
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}