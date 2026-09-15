import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

const CONSENT_KEY = 'zckoiz-cookie-consent';

type CookieConsent = 'accepted' | 'rejected' | null;

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private platformId = inject(PLATFORM_ID);
  readonly consent = signal<CookieConsent>(this.readConsent());

  accept(): void {
    this.setConsent('accepted');
  }

  reject(): void {
    this.setConsent('rejected');
  }

  private readConsent(): CookieConsent {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const value = window.localStorage.getItem(CONSENT_KEY);
      return value === 'accepted' || value === 'rejected' ? value : null;
    } catch {
      return null;
    }
  }

  private setConsent(value: Exclude<CookieConsent, null>): void {
    this.consent.set(value);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* Ignore storage restrictions. */
    }
  }
}
