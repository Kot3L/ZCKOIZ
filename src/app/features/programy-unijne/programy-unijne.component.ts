import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { EuProgramArticle, GalleryImage } from '../../core/models/database.types';
import { dataUrlToBlobUrl, fileNameFromUrl } from '../../shared/utils/pdf.utils';

@Component({
  selector: 'app-programy-unijne',
  standalone: true,
  imports: [RouterLink, DatePipe, SkeletonComponent],
  template: `
    <div class="pt-10 pb-16 md:pt-14 md:pb-24">
      <div class="container-main max-w-4xl">
        @if (loading()) {
          <div class="space-y-6" aria-busy="true">
            <app-skeleton type="text" [style.width]="'30%'"/>
            <app-skeleton type="title" [style.width]="'90%'"/>
            <app-skeleton type="text" [style.width]="'40%'"/>
            <app-skeleton type="rect" class="mt-4"/>
            <app-skeleton type="text" class="mt-4"/>
            <app-skeleton type="text"/>
            <app-skeleton type="text" [style.width]="'80%'"/>
          </div>
        } @else if (item()) {
          <article>
          <a routerLink="/programy_unijne" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-8 hover:gap-3 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Wróć do programów unijnych
          </a>

          <header class="mb-10">
            <p class="text-petrol font-heading font-semibold text-sm uppercase tracking-widest mb-3">Programy unijne</p>
            <h1 class="font-heading text-3xl md:text-5xl text-ink leading-tight mb-5">
              {{ item()!.title }}
            </h1>
            @if (item()!.published_at) {
              <time class="text-gray-500 font-medium">{{ item()!.published_at | date:'dd MMMM yyyy' }}</time>
            }
          </header>

          @if (item()!.cover_image_url) {
            <figure class="mb-10 max-h-[32rem] overflow-hidden rounded-xl bg-cream-dark flex justify-center">
              <img [src]="item()!.cover_image_url" [alt]="item()!.title" class="w-full h-auto max-h-[32rem] object-contain" />
            </figure>
          }

          <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {{ item()!.content }}
          </div>

          @if (item()!.content_images?.length) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              @for (imgUrl of item()!.content_images; track imgUrl) {
                <figure class="overflow-hidden rounded-xl bg-cream-dark flex justify-center">
                  <img [src]="imgUrl" [alt]="item()!.title" class="w-full max-h-[26rem] object-contain" loading="lazy" />
                </figure>
              }
            </div>
          }

          @if (youtubeEmbeds().length) {
            <div class="space-y-6 mt-10">
              @for (src of youtubeEmbeds(); track src) {
                <div class="relative aspect-video overflow-hidden rounded-xl border-2 border-ink shadow-[4px_4px_0_var(--color-ink)]">
                  <iframe
                    [src]="src"
                    title="Film YouTube"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                  </iframe>
                </div>
              }
            </div>
          }

          @if (pdfName() || pdfHref()) {
            <div class="mt-10 border-2 border-ink rounded-xl bg-surface overflow-hidden">
              <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b-2 border-ink">
                <span class="inline-flex items-center gap-2 font-semibold text-ink min-w-0">
                  <svg class="w-5 h-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  {{ pdfName() || 'Dokument PDF' }}
                </span>
                <a [href]="pdfHref()" target="_blank" rel="noopener"
                  class="comic-btn text-sm bg-surface text-ink">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Pobierz / Otwórz
                </a>
              </div>
              @if (pdfPreviewSrc()) {
                <iframe [src]="pdfPreviewSrc()" title="Podgląd PDF"
                  class="w-full h-[30rem] bg-white"></iframe>
              }
            </div>
          }

          @if (galleryImages().length > 0) {
            <section class="mt-12">
              <h2 class="font-heading text-2xl text-ink mb-6">Galeria zdjęć</h2>
              <div class="relative overflow-hidden rounded-xl bg-cream-dark">
                <div class="relative h-72 md:h-[28rem]">
                  <img [src]="galleryImages()[currentImage()].image_url" [alt]="item()!.title" class="w-full h-full object-contain bg-cream-dark" />
                  @if (galleryImages().length > 1) {
                    <button (click)="prevImage()" aria-label="Poprzednie zdjęcie"
                      class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 text-ink rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button (click)="nextImage()" aria-label="Następne zdjęcie"
                      class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 text-ink rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {{ currentImage() + 1 }} / {{ galleryImages().length }}
                    </div>
                  }
                </div>
              </div>
              @if (galleryImages().length > 1) {
                <div class="flex flex-wrap gap-2 mt-4">
                  @for (img of galleryImages(); track img.id; let i = $index) {
                    <button (click)="currentImage.set(i)"
                      [class]="i === currentImage() ? 'ring-2 ring-petrol opacity-100' : 'opacity-60 hover:opacity-100'"
                      class="w-16 h-14 rounded-lg overflow-hidden transition-all">
                      <img [src]="img.image_url" class="w-full h-full object-contain bg-cream-dark" alt="Miniatura" />
                    </button>
                  }
                </div>
              }
            </section>
          }
          </article>
        } @else {
          <div class="text-center py-16">
            <p class="text-gray-500 text-lg">Nie znaleziono artykułu</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProgramyUnijneComponent implements OnInit {
  item = signal<EuProgramArticle | null>(null);
  galleryImages = signal<GalleryImage[]>([]);
  currentImage = signal(0);
  loading = signal(true);
  youtubeEmbeds = signal<SafeResourceUrl[]>([]);
  pdfBlobUrl = signal<string | null>(null);
  pdfHref = signal<string>('');
  pdfName = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private fb: FirebaseService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.loading.set(true);
    try {
      const data = await this.fb.getEuProgramBySlug(slug);
      this.item.set(data);
      if (data?.album_id) {
        const images = await this.fb.listGalleryImages(data.album_id);
        this.galleryImages.set(images ?? []);
        this.currentImage.set(0);
      }
      this.youtubeEmbeds.set((data?.youtube_urls ?? [])
        .map(u => this.toEmbedUrl(u))
        .filter((u): u is string => !!u)
        .map(e => this.sanitizer.bypassSecurityTrustResourceUrl(e)));

      if (data?.pdf_name && !data.pdf_url) {
        const pdf = await this.fb.getEuProgramPdf(data.id);
        if (pdf?.data) {
          this.pdfName.set(pdf.name || data.pdf_name);
          this.pdfHref.set(dataUrlToBlobUrl(pdf.data));
          this.pdfBlobUrl.set(this.pdfHref());
        }
      } else if (data?.pdf_url) {
        this.pdfName.set(data.pdf_name || fileNameFromUrl(data.pdf_url, 'Dokument PDF'));
        this.pdfHref.set(data.pdf_url);
      }
    } finally {
      this.loading.set(false);
    }
  }

  pdfPreviewSrc(): SafeResourceUrl | null {
    const url = this.pdfBlobUrl() ?? this.pdfHref();
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private toEmbedUrl(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (watchMatch) {
      return 'https://www.youtube.com/embed/' + watchMatch[1];
    }
    return null;
  }

  prevImage() {
    this.currentImage.update(i => (i - 1 + this.galleryImages().length) % this.galleryImages().length);
  }

  nextImage() {
    this.currentImage.update(i => (i + 1) % this.galleryImages().length);
  }
}