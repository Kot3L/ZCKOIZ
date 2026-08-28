import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'zckoiz-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  readonly isDark = signal(false);

  constructor() {
    this.init();
  }

  /** Must be called once before Angular hydrates to avoid a flash; safe to call multiple times. */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let dark = false;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        dark = saved === 'dark';
      } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      dark = false;
    }

    this.apply(dark);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.apply(!this.isDark());
  }

  private apply(dark: boolean): void {
    this.isDark.set(dark);
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';

    try {
      window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }
}
