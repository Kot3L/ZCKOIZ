import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { OrgDateEntry, Organization } from '../../core/models/database.types';

const DEFAULT_ORGANIZACJA: Organization = {
  wazne_daty: [
    {
      label: 'Dni wolne od zajęć lekcyjnych',
      date: 'wrzesień – czerwiec',
      detail: 'Dni wolne od zajęć lekcyjnych są ustalane na początku roku szkolnego przez dyrektora szkoły zgodnie z obowiązującymi przepisami.',
    },
    {
      label: 'Organizacja roku szkolnego',
      date: 'od 1 września',
      detail: 'Zasady organizacji roku szkolnego, kalendarza zajęć oraz dni świątecznych obowiązujące w bieżącym roku szkolnym.',
    },
    {
      label: 'Wewnątrzszkolny regulamin zachowania',
      date: 'cały rok',
      detail: 'Zasady zachowania i obowiązki ucznia wynikające ze statutu oraz wewnątrzszkolnego regulaminu.',
    },
  ],
  dni_wolne: [
    {
      label: 'Zimowa przerwa świąteczna',
      date: 'grudzień – styczeń',
      detail: 'Przerwa świąteczna w trakcie roku szkolnego, wolne od zajęć lekcyjnych.',
    },
    {
      label: 'Ferie zimowe',
      date: 'styczeń – luty',
      detail: 'Dwa tygodnie wolne od zajęć dydaktycznych zgodnie z terminarzem ferii.',
    },
    {
      label: 'Wiosenna przerwa świąteczna',
      date: 'marzec – kwiecień',
      detail: 'Przerwa świąteczna przed Wielkanocą, wolne od zajęć lekcyjnych.',
    },
    {
      label: 'Dodatkowe dni wolne',
      date: 'wg kalendarza',
      detail: 'Dni wolne od zajęć lekcyjnych ustalone rozporządzeniem i decyzją dyrektora szkoły.',
    },
  ],
};

@Component({
  selector: 'app-organizacja-roku',
  standalone: true,
  imports: [PageHeaderComponent, SkeletonComponent, RouterLink],
  template: `
    <app-page-header
      title="Organizacja roku"
      subtitle="Ważne daty, dni wolne od zajęć oraz organizacja roku szkolnego" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            @for (s of [1,2,3]; track s) {
              <div class="comic-card !p-6">
                <app-skeleton type="button" [style.width]="'45%'"/>
                <div class="mt-4 space-y-2"><app-skeleton type="title" /><app-skeleton type="text" /></div>
              </div>
            }
          </div>
          <div class="space-y-4">
            @for (s of [1,2,3,4]; track s) {
              <div class="comic-card !p-5 flex items-start gap-4">
                <app-skeleton type="circle" [style]="{ width: '48px', height: '48px', 'aspect-ratio': 'auto' }"/>
                <div class="flex-1 space-y-2"><app-skeleton type="title" /><app-skeleton type="text" /></div>
              </div>
            }
          </div>
        } @else {
          <!-- Ważne daty -->
          @if (data().wazne_daty.length) {
            <div class="mb-12">
              <h2 class="section-heading">Ważne daty</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                @for (item of data().wazne_daty; track $index) {
                  <div class="comic-card !p-6">
                    <div class="badge-orange text-xs mb-3">{{ item.date }}</div>
                    <h3 class="font-heading text-xl text-ink mb-2">{{ item.label }}</h3>
                    <p class="text-ink text-sm">{{ item.detail }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Dni wolne -->
          @if (data().dni_wolne.length) {
            <div class="mb-12">
              <h2 class="section-heading">Dni wolne</h2>
              <div class="space-y-4 mt-8">
                @for (item of data().dni_wolne; track $index; let i = $index) {
                  <div class="comic-card flex items-start gap-4 !p-5">
                    <div class="w-12 h-12 shrink-0 bg-blue-primary border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg">
                      {{ i + 1 }}
                    </div>
                    <div>
                      <div class="badge-orange text-xs mb-1">{{ item.date }}</div>
                      <h3 class="font-heading text-lg text-ink mb-1">{{ item.label }}</h3>
                      <p class="text-ink text-sm">{{ item.detail }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Rozkład materiału -->
            <div class="comic-card !p-6">
              <h2 class="font-heading text-xl text-orange-primary mb-4">Rozkład materiału</h2>
              <ul class="space-y-2 text-ink">
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Kalendarz roku szkolnego i organizacja zajęć lekcyjnych.</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Zmiany organizacyjne i informacje o planie zajęć.</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Terminy egzaminów, sprawdzianów i konsultacji.</span>
                </li>
              </ul>
            </div>

            <!-- Samorząd uczniowski -->
            <div class="comic-card !p-6">
              <h2 class="font-heading text-xl text-orange-primary mb-4">Samorząd uczniowski</h2>
              <ul class="space-y-2 text-ink">
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>Samorząd Uczniowski reprezentuje uczniów wobec dyrekcji i grona pedagogicznego.</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Opiekunowie Samorządu i spotkania z uczniami.</span>
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Działalność, inicjatywy i akcje szkolne.</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="comic-card mt-8 bg-blue-primary !p-8 md:!p-10 text-center">
            <h2 class="text-2xl md:text-3xl font-heading text-white mb-3">Czy masz jakieś inne pytania?</h2>
            <p class="text-blue-100 mb-6 max-w-2xl mx-auto">
              W sekretariacie otrzymasz większość odpowiedzi na twoje pytania.
            </p>
            <a routerLink="/kontakt" class="comic-btn-secondary text-sm">
              Skontaktuj się z nami
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class OrganizacjaRokuComponent implements OnInit {
  data = signal<Organization>(DEFAULT_ORGANIZACJA);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const setting = await this.fb.getSetting('organizacja');
      if (setting) {
        try {
          const parsed = JSON.parse(setting.value) as Organization;
          if (parsed && Array.isArray(parsed.wazne_daty) && Array.isArray(parsed.dni_wolne)) {
            this.data.set(parsed);
          }
        } catch {
          this.data.set(DEFAULT_ORGANIZACJA);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }
}