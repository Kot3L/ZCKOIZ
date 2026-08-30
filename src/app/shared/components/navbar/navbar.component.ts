import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { FontService } from '../../../core/services/font.service';

interface SchoolMenuItem {
  label: string;
  url: string;
  external?: boolean;
}

interface SchoolMenuGroup {
  heading: string;
  items: SchoolMenuItem[];
}

const SCHOOL_MENU: SchoolMenuGroup[] = [
  {
    heading: 'O szkole',
    items: [
      { label: 'Partnerzy szkoły', url: '/szkola/partnerzy' },
      { label: 'Dyrekcja', url: '/szkola/dyrekcja' },
      { label: 'Sekretariat', url: '/szkola/sekretariat' },
      { label: 'Kadra ZCKOiZ', url: '/kadra' },
      { label: 'Specjaliści', url: '/szkola/specjalisci' },
      { label: 'Biblioteka', url: '/szkola/biblioteka' },
      { label: 'Rajd po Zabrzu', url: '/szkola/rajd-po-zabrzu' },
      { label: 'Historia', url: '/szkola/historia' },
      { label: 'Statut ZCKOiZ', url: '/szkola/statut' },
      { label: 'RODO ZCKOiZ', url: '/szkola/rodo' },
      { label: 'Rada Rodziców', url: '/szkola/rada-rodzicow' },
      { label: 'Dla rodzica', url: '/szkola/dla-rodzica' },
      { label: 'BIP', url: 'https://bip.miastozabrze.pl/engine//bip/84?o=TreeMenu&e=e|84', external: true },
    ],
  },
  {
    heading: 'Organizacja roku',
    items: [
      { label: 'Zestaw podręczników', url: '/szkola/zestaw-podrecznikow' },
      { label: 'Wychowawcy klas', url: '/szkola/wychowawcy-klas' },
      { label: 'Samorząd uczniowski', url: '/szkola/samorzad' },
      { label: 'Organizacja roku szkolnego', url: '/szkola/organizacja-roku' },
      { label: 'Dni wolne od zajęć', url: '/szkola/dni-wolne' },
      { label: 'Regulamin oceniania', url: '/szkola/regulamin' },
      { label: 'Wymagania edukacyjne', url: '/szkola/wymagania' },
    ],
  },
];

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
            @for (item of beforeSchool; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-orange-primary bg-orange-50"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="px-3 py-2 rounded-lg text-sm font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark hover:text-orange-primary transition-colors">
                {{ item.label }}
              </a>
            }

            <div
              class="relative"
              (mouseenter)="openSchool()"
              (mouseleave)="scheduleSchoolClose()">
              <button
                class="px-3 py-2 rounded-lg text-sm font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark hover:text-orange-primary transition-colors flex items-center gap-1">
                Szkoła
                <svg class="w-3 h-3 mt-0.5 transition-transform" [class.rotate-180]="schoolOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div
                class="dropdown-panel"
                [class.panel-open]="schoolOpen()"
                (mouseenter)="openSchool()"
                (mouseleave)="scheduleSchoolClose()">
                <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                  @for (group of schoolMenu; track group.heading) {
                    <div>
                      <h4 class="text-xs font-heading font-bold uppercase tracking-widest text-petrol mb-3 whitespace-nowrap">{{ group.heading }}</h4>
                      <ul class="space-y-1">
                        @for (item of group.items; track item.url) {
                          <li>
                            @if (item.external) {
                              <a [href]="item.url" target="_blank" rel="noopener" (click)="closeSchool()"
                                class="block px-2 py-1.5 rounded-md text-sm text-ink hover:bg-cream-dark hover:text-orange-primary transition-colors whitespace-nowrap">
                                {{ item.label }}
                              </a>
                            } @else {
                              <a [routerLink]="item.url" class="block px-2 py-1.5 rounded-md text-sm text-ink hover:bg-cream-dark hover:text-orange-primary transition-colors whitespace-nowrap">
                                {{ item.label }}
                              </a>
                            }
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              </div>
            </div>

            @for (item of afterSchool; track item.path) {
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
              (click)="font.next()"
              class="comic-icon-btn !w-auto !h-auto px-2"
              [class.hc-active]="fontSize() !== 'normal'"
              [attr.aria-label]="'Zmień rozmiar czcionki (aktualny: ' + fontSize() + ')'"
              title="Zmień rozmiar czcionki (klik ponownie, aby wrócić do domyślnej)">
              <span class="font-heading font-bold">
                @switch (fontSize()) {
                  @case ('largest') { <span class="text-lg">A+</span> }
                  @case ('larger') { <span class="text-base">A+</span> }
                  @default { <span class="text-sm">A</span> }
                }
              </span>
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
            @for (item of beforeSchool; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-orange-primary bg-orange-50"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="mobileOpen.set(false)"
                class="block px-4 py-3 rounded-lg font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark transition-colors">
                {{ item.label }}
              </a>
            }

            <button
              (click)="schoolMobileOpen.set(!schoolMobileOpen())"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark transition-colors">
              Szkoła
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="schoolMobileOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
            </button>
            @if (schoolMobileOpen()) {
              <div class="pl-4 space-y-1 border-l-2 border-ink/10 ml-2">
                @for (group of schoolMenu; track group.heading) {
                  <p class="text-xs font-heading font-bold uppercase tracking-widest text-petrol pt-2 pb-1">{{ group.heading }}</p>
                  @for (item of group.items; track item.url) {
                    @if (item.external) {
                      <a [href]="item.url" target="_blank" rel="noopener" (click)="mobileOpen.set(false)"
                        class="block px-4 py-2 rounded-lg text-sm hover:bg-cream-dark transition-colors">{{ item.label }}</a>
                    } @else {
                      <a [routerLink]="item.url"
                        class="block px-4 py-2 rounded-lg text-sm hover:bg-cream-dark transition-colors">{{ item.label }}</a>
                    }
                  }
                }
              </div>
            }

            @for (item of afterSchool; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-orange-primary bg-orange-50"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="mobileOpen.set(false)"
                class="block px-4 py-3 rounded-lg font-heading font-semibold uppercase tracking-wide hover:bg-cream-dark transition-colors">
                {{ item.label }}
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  mobileOpen = signal(false);
  schoolMobileOpen = signal(false);
  schoolOpen = signal(false);

  private schoolCloseTimer: ReturnType<typeof setTimeout> | null = null;

  theme = inject(ThemeService);
  isDark = this.theme.isDark;
  font = inject(FontService);
  fontSize = this.font.size;

  private router = inject(Router);

  schoolMenu = SCHOOL_MENU;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.schoolOpen.set(false);
        this.mobileOpen.set(false);
        this.schoolMobileOpen.set(false);
        if (this.schoolCloseTimer) {
          clearTimeout(this.schoolCloseTimer);
          this.schoolCloseTimer = null;
        }
      }
    });
  }

  openSchool() {
    if (this.schoolCloseTimer) {
      clearTimeout(this.schoolCloseTimer);
      this.schoolCloseTimer = null;
    }
    this.schoolOpen.set(true);
  }

  closeSchool() {
    if (this.schoolCloseTimer) {
      clearTimeout(this.schoolCloseTimer);
      this.schoolCloseTimer = null;
    }
    this.schoolOpen.set(false);
  }

  scheduleSchoolClose() {
    if (this.schoolCloseTimer) clearTimeout(this.schoolCloseTimer);
    this.schoolCloseTimer = setTimeout(() => {
      this.schoolOpen.set(false);
      this.schoolCloseTimer = null;
    }, 2000);
  }

  beforeSchool = [
    { label: 'Oferta', path: '/oferta', exact: false },
    { label: 'Aktualności', path: '/aktualnosci', exact: false },
    { label: 'Galeria', path: '/galeria', exact: false },
  ];

  afterSchool = [
    { label: 'Kadra', path: '/kadra', exact: false },
    { label: 'Rekrutacja', path: '/rekrutacja', exact: false },
    { label: 'Kontakt', path: '/kontakt', exact: false },
  ];
}
