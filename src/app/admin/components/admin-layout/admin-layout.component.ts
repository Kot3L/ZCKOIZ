import { Component, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../../core/services/firebase.service';
import { AdminStateService } from '../../../core/services/admin-state.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-panel min-h-screen bg-cream">
      <aside class="hidden lg:flex w-64 bg-dark text-white flex-col shrink-0 fixed inset-y-0 left-0">
        <div class="p-6 border-b border-gray-800">
          <div class="flex items-center gap-3">
            <img
              src="/wlepka100szary.png"
              alt="ZCKOiZ Zabrze"
              class="w-10 h-10 object-contain rounded-lg border-2 border-white bg-white shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
            />
            <div>
              <span class="font-heading font-bold block">ZCKOiZ</span>
              <span class="text-xs text-gray-400">Panel administracyjny</span>
            </div>
          </div>
        </div>

        <nav class="p-4 space-y-1 flex-1">
          @for (item of navItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-orange-primary text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="p-4 border-t border-gray-800">
          <a href="/" target="_blank" rel="noopener" class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
            Powrót na stronę
          </a>
          <button
            (click)="logout()"
            class="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-left">
            Wyloguj się
          </button>
        </div>
      </aside>

      <div class="min-h-screen flex flex-col lg:pl-64">
        @if (mobileNav()) {
          <nav class="lg:hidden bg-surface border-b border-ink/10 p-4 space-y-1 -mt-0">
            @for (item of navItems(); track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-orange-primary text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="mobileNav.set(false)"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-dark transition-colors text-sm font-medium">
                {{ item.label }}
              </a>
            }
            <button (click)="logout()" class="w-full text-left flex items-center px-4 py-3 rounded-lg hover:bg-cream-dark transition-colors text-sm font-medium">
              Wyloguj się
            </button>
          </nav>
        }

        <main class="admin-content flex-1 p-4 lg:p-8 relative">
          @if (user()) {
            <div class="flex justify-end lg:hidden mb-4">
              <button (click)="mobileNav.set(!mobileNav())" class="p-2 border-2 border-ink rounded-lg" aria-label="Menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          }
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  mobileNav = signal(false);

  constructor(
    private fb: FirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private adminState: AdminStateService,
  ) {}

  ngOnInit() {}

  user = () => this.fb.user();

  base = () => '/' + (this.adminState.secret() || this.route.snapshot.paramMap.get('secret') || '');

  navItems = () => {
    const base = this.base();
    return [
      { path: base, exact: true, label: 'Dashboard' },
      { path: base + '/aktualnosci', exact: false, label: 'Aktualności' },
      { path: base + '/kierunki', exact: false, label: 'Kierunki kształcenia' },
      { path: base + '/galeria', exact: false, label: 'Galeria' },
      { path: base + '/dokumenty', exact: false, label: 'Dokumenty' },
      { path: base + '/szkola', exact: false, label: 'Szkoła' },
      { path: base + '/kadra', exact: false, label: 'Kadra' },
      { path: base + '/organizacja', exact: false, label: 'Organizacja roku' },
      { path: base + '/rekrutacja', exact: false, label: 'Rekrutacja' },
      { path: base + '/edukacja-mundurowa', exact: false, label: 'Edukacja mundurowa' },
      { path: base + '/programy-unijne', exact: false, label: 'Programy unijne' },
    ];
  };

  async logout() {
    await this.fb.signOut();
    this.router.navigate([this.base() + '/login']);
  }
}
