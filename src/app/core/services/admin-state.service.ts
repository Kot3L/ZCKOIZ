import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  readonly secret = signal('');
}