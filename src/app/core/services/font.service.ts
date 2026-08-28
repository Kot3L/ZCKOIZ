import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const FONT_KEY = 'zckoiz-fontsize';

export type FontSize = 'normal' | 'larger' | 'largest';

@Injectable({ providedIn: 'root' })
export class FontService {
  private platformId = inject(PLATFORM_ID);
  readonly size = signal<FontSize>('normal');

  constructor() {
    this.init();
  }

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let size: FontSize = 'normal';
    try {
      const s = window.localStorage.getItem(FONT_KEY);
      if (s === 'larger' || s === 'largest') {
        size = s;
      }
    } catch {
      size = 'normal';
    }

    this.apply(size);
  }

  /** Cycle: normal -> larger -> largest -> normal */
  next(): void {
    const order: FontSize[] = ['normal', 'larger', 'largest'];
    const idx = order.indexOf(this.size());
    this.apply(order[(idx + 1) % order.length]);
  }

  private apply(size: FontSize): void {
    this.size.set(size);
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('font-larger', size === 'larger');
    root.classList.toggle('font-largest', size === 'largest');

    try {
      window.localStorage.setItem(FONT_KEY, size);
    } catch {
      /* ignore */
    }
  }
}
