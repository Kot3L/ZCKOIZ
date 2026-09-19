import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Recruitment } from '../../core/models/database.types';

const DEFAULT_REKRUTACJA: Recruitment = {
  timeline: [
    {
      date: 'od 15 maja',
      label: 'Składanie wniosków',
      detail: 'Rejestracja kandydatów przez system elektronicznej rekrutacji.',
    },
    {
      date: 'czerwiec-lipiec',
      label: 'Potwierdzanie woli',
      detail: 'Dostarczenie świadectw i zaświadczeń, potwierdzenie wyboru szkoły.',
    },
    {
      date: 'lipiec',
      label: 'Ogłoszenie wyników',
      detail: 'Publikacja list zakwalifikowanych i przyjętych kandydatów.',
    },
  ],
  steps: [
    {
      title: 'Zarejestruj się w systemie',
      detail: 'Utwórz konto i wypełnij wniosek o przyjęcie w internetowym systemie rekrutacji.',
    },
    {
      title: 'Wybierz kierunki',
      detail: 'Uszereguj wybrane kierunki kształcenia według swoich preferencji.',
    },
    {
      title: 'Dostarcz dokumenty',
      detail: 'Złóż świadectwo ukończenia szkoły i zaświadczenie o wynikach egzaminu.',
    },
    {
      title: 'Potwierdź wolę nauki',
      detail: 'W wyznaczonym terminie potwierdź chęć podjęcia nauki w naszej szkole.',
    },
  ],
  required_docs: [
    'Wniosek o przyjęcie do szkoły',
    'Świadectwo ukończenia szkoły podstawowej',
    'Zaświadczenie o wynikach egzaminu ósmoklasisty',
    'Dwie fotografie',
    'Zaświadczenie lekarskie o braku przeciwwskazań do nauki w danym zawodzie',
  ],
  extra_points: [
    'świadectwo z wyróżnieniem (ukończenie szkoły z paskiem)',
    'wolontariat i aktywność społeczna',
    'osiągnięcia w konkursach przedmiotowych i olimpiadach',
    'szczególne osiągnięcia sportowe i artystyczne',
  ],
};

@Component({
  selector: 'app-rekrutacja',
  standalone: true,
  imports: [PageHeaderComponent, SkeletonComponent, RouterLink],
  template: `
    <app-page-header
      title="Rekrutacja"
      subtitle="Zasady, terminy i dokumenty potrzebne do zapisu do ZCKOiZ Zabrze" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="space-y-4" aria-busy="true">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="comic-card !p-5 space-y-3">
                <app-skeleton type="title" [style.width]="'35%'" />
                <app-skeleton type="text" [style.width]="'80%'" />
              </div>
            }
          </div>
        } @else {
        <!-- Ważne terminy -->
        <div class="mb-12">
          <h2 class="section-heading">Ważne terminy</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            @for (item of data().timeline; track $index) {
              <div class="comic-card !p-6">
                <div class="badge-orange text-xs mb-3">{{ item.date }}</div>
                <h3 class="font-heading text-xl text-ink mb-2">{{ item.label }}</h3>
                <p class="text-ink text-sm">{{ item.detail }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Jak przebiega rekrutacja -->
        <div class="mb-12">
          <h2 class="section-heading">Jak przebiega rekrutacja?</h2>
          <div class="space-y-4 mt-8">
            @for (step of data().steps; track $index; let i = $index) {
              <div class="comic-card flex items-start gap-4 !p-5">
                <div class="w-12 h-12 shrink-0 bg-blue-primary border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg">
                  {{ i + 1 }}
                </div>
                <div>
                  <h3 class="font-heading text-lg text-ink mb-1">{{ step.title }}</h3>
                  <p class="text-ink text-sm">{{ step.detail }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <!-- Wymagane dokumenty -->
          <div class="comic-card !p-6">
            <h2 class="font-heading text-xl text-orange-primary mb-4">Wymagane dokumenty</h2>
            <ul class="space-y-2 text-ink">
              @for (doc of data().required_docs; track $index) {
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ doc }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- Dodatkowe punkty -->
          <div class="comic-card !p-6">
            <h2 class="font-heading text-xl text-petrol mb-4">Dodatkowe punkty w rekrutacji</h2>
            <ul class="space-y-3 text-ink">
              @for (item of data().extra_points; track $index) {
                <li class="flex items-start gap-3">
                  <span class="badge-blue text-xs shrink-0 mt-1">+</span>
                  <span class="text-sm">{{ item }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- CTA -->
        <div class="comic-card bg-blue-primary !p-8 md:!p-10 text-center">
          <h2 class="text-2xl md:text-3xl font-heading text-white mb-3">Masz pytania dotyczące rekrutacji?</h2>
          <p class="text-blue-100 mb-6 max-w-2xl mx-auto">
            Skontaktuj się z sekretariatem szkoły lub odwiedź nas osobiście w godzinach pracy.
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
export class RekrutacjaComponent implements OnInit {
  data = signal<Recruitment>(DEFAULT_REKRUTACJA);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const setting = await this.fb.getSetting('rekrutacja');
      if (setting) {
        try {
          const parsed = JSON.parse(setting.value) as Recruitment;
          if (parsed && Array.isArray(parsed.timeline) && Array.isArray(parsed.steps)
            && Array.isArray(parsed.required_docs) && Array.isArray(parsed.extra_points)) {
            this.data.set(parsed);
          }
        } catch {
          this.data.set(DEFAULT_REKRUTACJA);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }
}
