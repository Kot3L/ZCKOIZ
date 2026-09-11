import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = async (route) => {
  const fb = inject(FirebaseService);
  const router = inject(Router);

  if (!fb.isLoggedIn()) {
    const secret = route.paramMap.get('secret');
    if (secret) {
      router.navigate(['/' + secret + '/login']);
    } else {
      router.navigate(['/']);
    }
    return false;
  }
  return true;
};
