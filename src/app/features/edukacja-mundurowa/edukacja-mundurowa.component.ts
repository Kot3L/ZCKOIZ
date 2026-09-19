import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { EducationPage } from '../../core/models/database.types';

const DEFAULT_PAGE: EducationPage = {
  title: 'Edukacja mundurowa',
  content: 'Edukacja mundurowa rozwija dyscyplinę, odpowiedzialność, sprawność fizyczną oraz umiejętność współpracy w zespole.\n\nZajęcia łączą wiedzę teoretyczną z praktycznymi ćwiczeniami i przygotowują uczniów do dalszego kształcenia oraz pracy w służbach mundurowych i instytucjach związanych z bezpieczeństwem publicznym.',
  cover_image_url: null,
  content_images: [],
  youtube_urls: [],
  pdf_url: null,
  pdf_name: null,
};

@Component({
  selector: 'app-edukacja-mundurowa',
  standalone: true,
  imports: [PageHeaderComponent, SkeletonComponent, RouterLink],
  template: `
    @if (loading()) {
      <section class="py-12"><div class="container-main max-w-4xl space-y-6" aria-busy="true">
        <app-skeleton type="title" [style.width]="'55%'" /><app-skeleton type="text" [style.width]="'35%'" />
        <app-skeleton type="rect" /><app-skeleton type="text" /><app-skeleton type="text" />
      </div></section>
    } @else {
      <app-page-header [title]="page().title" subtitle="Przygotowanie do służby, odpowiedzialności i pracy zespołowej" />
      <div class="pt-10 pb-16 md:pt-14 md:pb-24">
        <div class="container-main max-w-4xl">
          <article>
            <a routerLink="/edukacja-mundurowa" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-8 hover:gap-3 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Wróć do edukacji mundurowej
            </a>
            <header class="mb-10">
              <p class="text-petrol font-heading font-semibold text-sm uppercase tracking-widest mb-3">Edukacja mundurowa</p>
              <h1 class="font-heading text-3xl md:text-5xl text-ink leading-tight mb-5">{{ page().title }}</h1>
            </header>
            @if (page().cover_image_url) {
              <figure class="mb-10 max-h-[32rem] overflow-hidden rounded-xl bg-cream-dark flex justify-center">
                <img [src]="page().cover_image_url" [alt]="page().title" class="w-full h-auto max-h-[32rem] object-contain" />
              </figure>
            }
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-line">{{ page().content }}</div>
            @if (page().content_images.length) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                @for (image of page().content_images; track image) {
                  <figure class="overflow-hidden rounded-xl bg-cream-dark flex justify-center"><img [src]="image" [alt]="page().title" class="w-full max-h-[26rem] object-contain" loading="lazy" /></figure>
                }
              </div>
            }
            @if (youtubeEmbeds().length) {
              <div class="space-y-6 mt-10">
                @for (src of youtubeEmbeds(); track src) {
                  <div class="relative aspect-video overflow-hidden rounded-xl border-2 border-ink shadow-[4px_4px_0_var(--color-ink)]"><iframe [src]="src" title="Film YouTube" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div>
                }
              </div>
            }
            @if (page().pdf_url) {
              <div class="mt-10"><a [href]="page().pdf_url" target="_blank" rel="noopener" class="comic-btn-primary text-sm">Pobierz dokument</a></div>
            }
          </article>
        </div>
      </div>
    }
  `,
})
export class EdukacjaMundurowaComponent implements OnInit {
  page = signal<EducationPage>(DEFAULT_PAGE);
  loading = signal(true);
  youtubeEmbeds = signal<SafeResourceUrl[]>([]);

  constructor(private fb: FirebaseService, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    try {
      const setting = await this.fb.getSetting('edukacja_mundurowa');
      if (setting) {
        try {
          const data = JSON.parse(setting.value) as Partial<EducationPage>;
          this.page.set({ ...DEFAULT_PAGE, ...data, content_images: data.content_images ?? [], youtube_urls: data.youtube_urls ?? [] });
        } catch {
          this.page.set(DEFAULT_PAGE);
        }
      }
      this.youtubeEmbeds.set(this.page().youtube_urls.map((url) => this.toEmbedUrl(url)).filter((url): url is string => !!url).map((url) => this.sanitizer.bypassSecurityTrustResourceUrl(url)));
    } finally {
      this.loading.set(false);
    }
  }

  private toEmbedUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      let id = parsed.searchParams.get('v');
      if (!id && parsed.hostname === 'youtu.be') id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
      return null;
    }
  }
}
