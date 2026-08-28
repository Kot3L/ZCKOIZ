import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};

export const editorGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!supabase.isEditor()) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};
