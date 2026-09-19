import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'zckoiz-theme';
const CONTRAST_KEY = 'zckoiz-contrast';

export type ContrastMode = 'bw' | 'black-yellow' | 'yellow-black' | null;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  readonly isDark = signal(false);
  readonly contrast = signal<ContrastMode>(null);

  constructor() {
    this.init();
  }

  
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

    let contrast: ContrastMode = null;
    try {
      const c = window.localStorage.getItem(CONTRAST_KEY);
      if (c === 'bw' || c === 'black-yellow' || c === 'yellow-black') {
        contrast = c;
      }
    } catch {
      contrast = null;
    }

    this.apply(dark, contrast);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.apply(!this.isDark(), this.contrast());
  }

  setContrast(mode: ContrastMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.apply(this.isDark(), this.contrast() === mode ? null : mode);
  }

  private apply(dark: boolean, contrast: ContrastMode): void {
    this.isDark.set(dark);
    this.contrast.set(contrast);
    const root = document.documentElement;

    root.classList.toggle('dark', dark);
    root.classList.toggle('hc-bw', contrast === 'bw');
    root.classList.toggle('hc-black-yellow', contrast === 'black-yellow');
    root.classList.toggle('hc-yellow-black', contrast === 'yellow-black');
    root.style.colorScheme = dark ? 'dark' : 'light';

    try {
      window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
      if (contrast) {
        window.localStorage.setItem(CONTRAST_KEY, contrast);
      } else {
        window.localStorage.removeItem(CONTRAST_KEY);
      }
    } catch {
      
    }
  }
}
