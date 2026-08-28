import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-rekrutacja',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  template: `
    <app-page-header
      title="Rekrutacja"
      subtitle="Zasady, terminy i dokumenty potrzebne do zapisu do ZCKOiZ Zabrze" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <!-- Ważne terminy -->
        <div class="mb-12">
          <h2 class="section-heading">Ważne terminy</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            @for (item of timeline; track item.label) {
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
            @for (step of steps; track step; let i = $index) {
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
              @for (doc of requiredDocs; track doc) {
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
              @for (item of extraPoints; track item) {
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
      </div>
    </section>
  `,
})
export class RekrutacjaComponent {
  timeline = [
    {
      date: 'od 15 maja',
      label: 'Składanie wniosków',
      detail: 'Rejestracja kandydatów przez system elektronicznej rekrutacji.',
    },
    {
      date: 'czerwiec–lipiec',
      label: 'Potwierdzanie woli',
      detail: 'Dostarczenie świadectw i zaświadczeń, potwierdzenie wyboru szkoły.',
    },
    {
      date: 'lipiec',
      label: 'Ogłoszenie wyników',
      detail: 'Publikacja list zakwalifikowanych i przyjętych kandydatów.',
    },
  ];

  steps = [
    {
      title: 'Zarejestruj się w systemie',
      detail: 'Utwórz konto i wypełnij wniosek o przyjęcie w internetowym systemie rekrutacji.',
    },
    {
      title: 'Wybierz kierunki',
      detail: 'Uszereguj wybrane kierunki kszta\u0142cenia według swoich preferencji.',
    },
    {
      title: 'Dostarcz dokumenty',
      detail: 'Złóż świadectwo ukończenia szkoły i zaświadczenie o wynikach egzaminu.',
    },
    {
      title: 'Potwierdź wolę nauki',
      detail: 'W wyznaczonym terminie potwierdź chęć podjęcia nauki w naszej szkole.',
    },
  ];

  requiredDocs = [
    'Wniosek o przyjęcie do szkoły',
    'Świadectwo ukończenia szkoły podstawowej',
    'Zaświadczenie o wynikach egzaminu ósmoklasisty',
    'Dwie fotografie',
    'Zaświadczenie lekarskie o braku przeciwwskazań do nauki w danym zawodzie',
  ];

  extraPoints = [
    'świadectwo z wyróżnieniem (ukończenie szkoły z paskiem)',
    'wolontariat i aktywność społeczna',
    'osiągnięcia w konkursach przedmiotowych i olimpiadach',
    'szczególne osiągnięcia sportowe i artystyczne',
  ];
}
