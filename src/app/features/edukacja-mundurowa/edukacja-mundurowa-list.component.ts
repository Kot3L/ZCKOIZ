import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { EducationArticle, EducationPage } from '../../core/models/database.types';

const LEGACY_SLUG = 'edukacja-mundurowa';

@Component({
  selector: 'app-edukacja-mundurowa-list',
  standalone: true,
  imports: [PageHeaderComponent, NewsCardComponent, SkeletonComponent, RouterLink],
  template: `
    <app-page-header title="Edukacja mundurowa" subtitle="Przygotowanie do służby, odpowiedzialności i pracy zespołowej" />
    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Ładowanie artykułów">
            @for (s of [1,2,3]; track s) {
              <div class="comic-card !p-0 overflow-hidden">
                <app-skeleton type="rect" />
                <div class="p-5 space-y-3">
                  <app-skeleton type="title" />
                  <app-skeleton type="text" />
                  <app-skeleton type="text" [style.width]="'60%'"/>
                </div>
              </div>
            }
          </div>
        } @else if (legacy()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a routerLink="/edukacja-mundurowa/edukacja-mundurowa" class="comic-card block group overflow-hidden">
              @if (legacy()!.cover_image_url) {
                <div class="overflow-hidden -mx-6 -mt-6 mb-4 border-b-2 border-ink bg-cream-dark flex justify-center">
                  <img [src]="legacy()!.cover_image_url" [alt]="legacy()!.title" class="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              }
              <h2 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">{{ legacy()!.title }}</h2>
              <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">{{ legacyExcerpt() }}</p>
              <span class="inline-flex items-center gap-1 text-petrol font-heading font-semibold text-sm mt-4 uppercase tracking-wide group-hover:gap-2 transition-all">Czytaj więcej
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of articles(); track item.id) {
              <app-news-card [news]="item" [baseRoute]="'/edukacja-mundurowa'" />
            } @empty {
              <div class="col-span-full text-center py-16">
                <p class="text-gray-500 text-lg">Brak artykułów do wyświetlenia</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class EdukacjaMundurowaListComponent implements OnInit {
  articles = signal<EducationArticle[]>([]);
  legacy = signal<EducationPage | null>(null);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const [arts, setting] = await Promise.all([
        this.fb.listPublishedEducationArticles(),
        this.fb.getSetting('edukacja_mundurowa'),
      ]);
      this.articles.set(arts);
      if (arts.length === 0 && setting) {
        try {
          this.legacy.set(JSON.parse(setting.value) as EducationPage);
        } catch {
          this.legacy.set(null);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  legacyExcerpt(): string {
    const page = this.legacy();
    return page ? page.content.replace(/\s+/g, ' ').trim() : '';
  }
}