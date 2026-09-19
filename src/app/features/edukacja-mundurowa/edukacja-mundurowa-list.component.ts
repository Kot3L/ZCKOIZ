import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { EducationPage } from '../../core/models/database.types';

const DEFAULT_PAGE: EducationPage = {
  title: 'Edukacja mundurowa',
  content: 'Edukacja mundurowa rozwija dyscyplinę, odpowiedzialność, sprawność fizyczną oraz umiejętność współpracy w zespole.',
  cover_image_url: null,
  content_images: [],
  youtube_urls: [],
  pdf_url: null,
  pdf_name: null,
};

@Component({
  selector: 'app-edukacja-mundurowa-list',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, SkeletonComponent],
  template: `
    <app-page-header title="Edukacja mundurowa" subtitle="Przygotowanie do służby, odpowiedzialności i pracy zespołowej" />
    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            <div class="comic-card !p-0 overflow-hidden"><app-skeleton type="rect" /><div class="p-5 space-y-3"><app-skeleton type="title" /><app-skeleton type="text" /></div></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a routerLink="/edukacja-mundurowa/edukacja-mundurowa" class="comic-card block group overflow-hidden">
              @if (page().cover_image_url) {
                <div class="overflow-hidden -mx-6 -mt-6 mb-4 border-b-2 border-ink bg-cream-dark flex justify-center">
                  <img [src]="page().cover_image_url" [alt]="page().title" class="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              }
              <h2 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">{{ page().title }}</h2>
              <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">{{ excerpt() }}</p>
              <span class="inline-flex items-center gap-1 text-petrol font-heading font-semibold text-sm mt-4 uppercase tracking-wide group-hover:gap-2 transition-all">Czytaj więcej
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class EdukacjaMundurowaListComponent implements OnInit {
  page = signal<EducationPage>(DEFAULT_PAGE);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const setting = await this.fb.getSetting('edukacja_mundurowa');
      if (setting) {
        const data = JSON.parse(setting.value) as Partial<EducationPage>;
        this.page.set({ ...DEFAULT_PAGE, ...data, content_images: data.content_images ?? [], youtube_urls: data.youtube_urls ?? [] });
      }
    } catch {
      this.page.set(DEFAULT_PAGE);
    } finally {
      this.loading.set(false);
    }
  }

  excerpt(): string {
    return this.page().content.replace(/\s+/g, ' ').trim();
  }
}
