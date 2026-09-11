import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { ProgramCardComponent } from '../../shared/components/program-card/program-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { InviewDirective } from '../../shared/directives/inview.directive';
import { FirebaseService } from '../../core/services/firebase.service';
import { News, Program, HeroSlide } from '../../core/models/database.types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NewsCardComponent, ProgramCardComponent, InviewDirective, SkeletonComponent],
  template: `
    <section class="relative bg-hero overflow-hidden">
      <div class="halftone-bg absolute inset-0"></div>
      <div class="comic-dots absolute inset-0 opacity-40 pointer-events-none"></div>
      <div class="comic-hatch absolute inset-0 opacity-60 pointer-events-none"></div>

      <div class="comic-star animate-float pointer-events-none"
           style="top: 14%; right: 10%; width: 64px; height: 64px; transform: rotate(10deg);"></div>
      <div class="comic-star comic-star-white animate-float pointer-events-none"
           style="top: 22%; left: 7%; width: 46px; height: 46px; transform: rotate(-14deg); animation-delay: 0.8s;"></div>
      <div class="comic-star animate-float pointer-events-none"
           style="bottom: 26%; right: 24%; width: 34px; height: 34px; transform: rotate(22deg); animation-delay: 1.6s;"></div>
      <div class="comic-star comic-star-white animate-float pointer-events-none"
           style="bottom: 16%; left: 12%; width: 30px; height: 30px; transform: rotate(-8deg); animation-delay: 2.2s;"></div>
      <div class="comic-star animate-float pointer-events-none"
           style="top: 8%; left: 24%; width: 26px; height: 26px; transform: rotate(30deg); animation-delay: 0.4s;"></div>
      <div class="comic-star animate-float pointer-events-none"
           style="top: 64%; right: 6%; width: 40px; height: 40px; transform: rotate(-18deg); animation-delay: 1.1s;"></div>

      <div class="comic-circle animate-float pointer-events-none"
           style="width: 46px; height: 46px; top: 20%; right: 30%; animation-delay: 0.9s;"></div>
      <div class="comic-circle animate-float pointer-events-none"
           style="width: 26px; height: 26px; bottom: 30%; left: 30%; animation-delay: 2s;"></div>
      <div class="comic-circle animate-float pointer-events-none"
           style="width: 38px; height: 38px; top: 72%; right: 20%; opacity: 0.7; animation-delay: 1.2s;"></div>

      <div class="comic-wave pointer-events-none"
           style="width: 220px; top: 12%; left: 30%;"></div>
      <div class="comic-wave pointer-events-none"
           style="width: 160px; bottom: 14%; right: 28%; opacity: 0.7;"></div>

      <div class="comic-scribble pointer-events-none"
           style="width: 200px; top: 62%; left: 22%;"></div>
      <div class="comic-scribble pointer-events-none"
           style="width: 120px; top: 20%; right: 6%; opacity: 0.8;"></div>

      <div class="comic-speed-lines pointer-events-none"
           style="top: -60px; right: -40px; width: 340px; height: 220px; transform: rotate(-14deg);"></div>
      <div class="comic-speed-lines pointer-events-none"
           style="bottom: -80px; left: -30px; width: 300px; height: 200px; transform: rotate(10deg);"></div>
      @if (heroSlides().length > 0) {
        <div class="relative z-10">
          @for (slide of heroSlides(); track slide.id; let i = $index) {
            @if (i === currentSlide()) {
              <div class="min-h-[70vh] md:min-h-[80vh] flex items-center">
                <div class="container-main py-16 md:py-24">
                  <div class="max-w-2xl animate-fade-in">
                    <h1 class="text-4xl sm:text-5xl md:text-6xl text-white mb-4 leading-tight font-bold">
                      {{ slide.title }}
                    </h1>
                    <p class="text-xl text-gray-300 mb-8">{{ slide.subtitle }}</p>
                    @if (slide.link_url) {
                      <a [routerLink]="slide.link_url" class="comic-btn-primary text-lg">
                        {{ slide.link_label || 'Dowiedz się więcej' }}
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          }
        </div>
        @if (heroSlides().length > 1) {
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            @for (slide of heroSlides(); track slide.id; let i = $index) {
              <button
                (click)="currentSlide.set(i)"
                [class]="i === currentSlide()
                  ? 'w-8 h-3 bg-orange-primary rounded-full border border-white/50'
                  : 'w-3 h-3 bg-white/40 rounded-full border border-white/30 hover:bg-white/60'"
                class="transition-all">
              </button>
            }
          </div>
        }
      } @else {
        <div class="min-h-[70vh] md:min-h-[80vh] flex items-center">
          <div class="container-main py-16 md:py-24 relative z-10">
            <div class="max-w-4xl">
              <div class="flex items-center gap-4 mb-4">
              <h1 class="text-3xl sm:text-4xl md:text-5xl text-white leading-tight font-bold relative z-10">
                Zabrzańskie Centrum Kształcenia Ogólnego i&nbsp;Zawodowego<br>
                <span class="text-yellow-accent font-bold">w&nbsp;Zabrzu</span>
              </h1>
              <img
                src="/logobig.png"
                alt="logo ZCKOiZ Zabrze"
                class="w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain shrink-0 -ml-10 sm:-ml-14 md:-ml-20 relative z-0 animate-float bg-transparent"
              />
              </div>
              <p class="text-xl text-gray-300 mt-8 mb-8">
                Technikum i branżowa szkoła I stopnia. Wybierz swój kierunek i rozpocznij karierę!
              </p>
              <div class="flex flex-wrap gap-4 items-center">
                <a routerLink="/oferta" class="comic-btn-primary text-lg">
                  Poznaj ofertę
                </a>
                <a routerLink="/kontakt" class="comic-btn bg-surface text-ink border-white text-lg hover:bg-cream-dark">
                  Kontakt
                </a>
                <span class="speech-bubble font-heading font-semibold text-sm text-orange-primary uppercase tracking-wide ml-1">
                  Trwa rekrutacja!
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </section>

    <section class="border-b-3 border-ink">
      <div class="container-main py-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a inview routerLink="/oferta" class="flex items-center gap-3 bg-blue-primary hover:brightness-110 dark:bg-[var(--color-hero)] dark:hover:bg-[var(--color-hero)] rounded-lg px-4 py-3 border-2 border-ink transition-colors">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span class="text-white font-heading font-semibold text-sm uppercase">Oferta</span>
          </a>
          <a inview [delay]="100" routerLink="/rekrutacja" class="flex items-center gap-3 bg-blue-primary hover:brightness-110 dark:bg-[var(--color-hero)] dark:hover:bg-[var(--color-hero)] rounded-lg px-4 py-3 border-2 border-ink transition-colors">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            <span class="text-white font-heading font-semibold text-sm uppercase">Rekrutacja</span>
          </a>
          <a inview [delay]="200" routerLink="/aktualnosci" class="flex items-center gap-3 bg-blue-primary hover:brightness-110 dark:bg-[var(--color-hero)] dark:hover:bg-[var(--color-hero)] rounded-lg px-4 py-3 border-2 border-ink transition-colors">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            <span class="text-white  font-heading font-semibold text-sm uppercase">Aktualności</span>
          </a>
          <a inview [delay]="300" routerLink="/kontakt" class="flex items-center gap-3 bg-blue-primary hover:brightness-110 dark:bg-[var(--color-hero)] dark:hover:bg-[var(--color-hero)] rounded-lg px-4 py-3 border-2 border-ink transition-colors">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span class="text-white font-heading font-semibold text-sm uppercase">Kontakt</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Programs Preview -->
    @if (loading()) {
      <section class="py-16 md:py-20">
        <div class="container-main">
          <app-skeleton type="title" [style.width]="'40%'"/>
          <p class="mt-4"><app-skeleton type="text" [style.width]="'30%'"/></p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            @for (s of [1,2,3]; track s) {
              <div class="comic-card !p-0 overflow-hidden">
                <app-skeleton type="rect" />
                <div class="p-5 space-y-3">
                  <app-skeleton type="title" />
                  <app-skeleton type="text" />
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    } @else if (programs().length > 0) {
      <section class="py-16 md:py-20">
        <div class="container-main">
          <div class="flex items-end justify-between mb-10">
            <div>
              <h2 class="section-heading">Kierunki kształcenia</h2>
              <p class="text-gray-600 mt-4">Wybierz kierunek, który Cię interesuje</p>
            </div>
            <a routerLink="/oferta" class="hidden md:inline-flex comic-btn-secondary text-sm py-2 px-4">
              Wszystkie kierunki
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (program of programs().slice(0, 6); track program.id; let i = $index) {
              <div inview [delay]="i * 120">
                <app-program-card [program]="program" />
              </div>
            }
          </div>
          <div class="mt-6 text-center md:hidden">
            <a routerLink="/oferta" class="comic-btn-secondary text-sm">Wszystkie kierunki</a>
          </div>
        </div>
      </section>
    }

    <!-- Latest News -->
    @if (loading()) {
      <section class="py-16 md:py-20 bg-cream-dark">
        <div class="container-main">
          <app-skeleton type="title" [style.width]="'40%'"/>
          <p class="mt-4"><app-skeleton type="text" [style.width]="'30%'"/></p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            @for (s of [1,2,3]; track s) {
              <div class="comic-card !p-0 overflow-hidden">
                <app-skeleton type="rect" />
                <div class="p-5 space-y-3">
                  <app-skeleton type="title" />
                  <app-skeleton type="text" />
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    } @else if (latestNews().length > 0) {
      <section class="py-16 md:py-20 bg-cream-dark">
        <div class="container-main">
          <div class="flex items-end justify-between mb-10">
            <div>
              <h2 class="section-heading">Najnowsze aktualności</h2>
              <p class="text-gray-600 mt-4">Co słychać w naszej szkole</p>
            </div>
            <a routerLink="/aktualnosci" class="hidden md:inline-flex comic-btn-secondary text-sm py-2 px-4">
              Wszystkie aktualności
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of latestNews(); track item.id; let i = $index) {
              <div inview [delay]="i * 120">
                <app-news-card [news]="item" />
              </div>
            }
          </div>
        </div>
      </section>
    }

    <section class="py-16 md:py-20 bg-orange-primary halftone-bg border-y-3 border-ink">
      <div class="container-main relative z-10 text-center" inview>
        <h2 class="text-4xl md:text-5xl text-white mb-4">Rozpocznij naukę w ZCKOiZ!</h2>
        <p class="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
          Trwa rekrutacja na rok szkolny 2025/2026. Sprawdź naszą ofertę i zgłoś się już dziś.
        </p>
        <a routerLink="/kontakt" class="comic-btn bg-surface text-orange-primary border-white text-lg hover:bg-cream-dark">
          Skontaktuj się z nami
        </a>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  heroSlides = signal<HeroSlide[]>([]);
  programs = signal<Program[]>([]);
  latestNews = signal<News[]>([]);
  currentSlide = signal(0);
  loading = signal(true);
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      await Promise.all([
        this.loadHeroSlides(),
        this.loadPrograms(),
        this.loadLatestNews(),
      ]);
    } finally {
      this.loading.set(false);
    }

    if (this.heroSlides().length > 1) {
      this.sliderInterval = setInterval(() => {
        this.currentSlide.update(i => (i + 1) % this.heroSlides().length);
      }, 6000);
    }
  }

  ngOnDestroy() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }

  private async loadHeroSlides() {
    const data = await this.fb.getSetting('hero_slides');
    if (data) {
      try {
        this.heroSlides.set(JSON.parse(data.value) as HeroSlide[]);
      } catch {
        this.heroSlides.set([]);
      }
    }
  }

  private async loadPrograms() {
    const data = await this.fb.listActivePrograms();
    this.programs.set(data);
  }

  private async loadLatestNews() {
    const { items } = await this.fb.listPublishedNewsPage(3);
    this.latestNews.set(items);
  }
}
