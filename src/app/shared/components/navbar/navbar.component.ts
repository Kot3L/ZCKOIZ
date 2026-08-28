import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-surface border-b-3 border-ink sticky top-0 z-50">
      <div class="container-main">
        <div class="flex items-center justify-between h-16 md:h-20">
          <a routerLink="/" class="flex items-center gap-3 group">
            <img
              src="/wlepka100szary.png"
              alt="ZCKOiZ Zabrze"
              class="w-14 h-14 md:w-16 md:h-16 object-contain rounded-xl border-2 border-[#1A1A1A] bg-white shadow-[2px_2px_0_#1A1A1A] group-hover:shadow-[1px_1px_0_#1A1A1A] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all dark:border-0 dark:shadow-none dark:group-hover:shadow-none"
            />
            <div class="hidden sm:block">
              <span class="font-heading text-lg md:text-xl text-ink font-bold leading-tight block">ZCKOiZ</span>
              <span class="text-xs text-ink-light font-medium">Zabrze</span>
            </div>
          </a>

          <div class="hidden lg:flex items-center gap-1">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-orange-primary bg-orange-50"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="px-3 py-2 rounded-lg text-sm font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark hover:text-orange-primary transition-colors">
                {{ item.label }}
              </a>
            }
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a routerLink="/rekrutacja" class="comic-btn-primary text-sm py-2 px-4 hidden lg:inline-flex">
              Rekrutacja
            </a>

            <button
              (click)="theme.toggle()"
              class="comic-icon-btn"
              [attr.aria-label]="isDark() ? 'Włącz jasny tryb' : 'Włącz ciemny tryb'"
              title="Przełącz tryb jasny/ciemny">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                @if (isDark()) {
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                } @else {
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                }
              </svg>
            </button>

            <button
              (click)="theme.setContrast('bw')"
              class="comic-icon-btn"
              [class.hc-active]="theme.contrast() === 'bw'"
              title="Set high contrast black and white mode"
              aria-label="Wysoki kontrast czarno-biały">
              <span class="w-4 h-4 rounded-sm bg-white border-2 border-current"></span>
            </button>
            <button
              (click)="theme.setContrast('black-yellow')"
              class="comic-icon-btn"
              [class.hc-active]="theme.contrast() === 'black-yellow'"
              title="Set high contrast black and yellow"
              aria-label="Wysoki kontrast czarno-żółty">
              <span class="w-4 h-4 rounded-sm bg-black border-2 border-[#FFD300]"></span>
            </button>
            <button
              (click)="theme.setContrast('yellow-black')"
              class="comic-icon-btn"
              [class.hc-active]="theme.contrast() === 'yellow-black'"
              title="Set high contrast yellow and black"
              aria-label="Wysoki kontrast żółto-czarny">
              <span class="w-4 h-4 rounded-sm bg-[#FFD300] border-2 border-black"></span>
            </button>

            <button
              (click)="mobileOpen.set(!mobileOpen())"
              class="lg:hidden comic-icon-btn"
              aria-label="Menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="lg:hidden border-t-2 border-ink bg-surface animate-slide-up">
          <div class="container-main py-4 space-y-1">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-orange-primary bg-orange-50"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="mobileOpen.set(false)"
                class="block px-4 py-3 rounded-lg font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark transition-colors">
                {{ item.label }}
              </a>
            }
            <a
              routerLink="/rekrutacja"
              (click)="mobileOpen.set(false)"
              class="comic-btn-primary text-center w-full mt-4">
              Rekrutacja
            </a>
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  mobileOpen = signal(false);

  theme = inject(ThemeService);
  isDark = this.theme.isDark;

  navItems = [
    { label: 'Oferta', path: '/oferta', exact: false },
    { label: 'Aktualności', path: '/aktualnosci', exact: false },
    { label: 'Galeria', path: '/galeria', exact: false },
    { label: 'Dokumenty', path: '/dokumenty', exact: false },
    { label: 'Kadra', path: '/kadra', exact: false },
    { label: 'Rekrutacja', path: '/rekrutacja', exact: false },
    { label: 'Kontakt', path: '/kontakt', exact: false },
  ];
}
