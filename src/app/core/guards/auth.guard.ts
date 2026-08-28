import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = async () => {
  const fb = inject(FirebaseService);
  const router = inject(Router);

  if (!fb.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};
