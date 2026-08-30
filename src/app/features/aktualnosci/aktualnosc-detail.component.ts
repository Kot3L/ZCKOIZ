import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FirebaseService } from '../../core/services/firebase.service';
import { News, GalleryImage } from '../../core/models/database.types';

@Component({
  selector: 'app-aktualnosc-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (item()) {
      <article class="pt-10 pb-16 md:pt-14 md:pb-24">
        <div class="container-main max-w-4xl">
          <a routerLink="/aktualnosci" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-8 hover:gap-3 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Wróć do aktualności
          </a>

          <header class="mb-10">
            <p class="text-petrol font-heading font-semibold text-sm uppercase tracking-widest mb-3">Aktualności</p>
            <h1 class="font-heading text-3xl md:text-5xl text-ink leading-tight mb-5">
              {{ item()!.title }}
            </h1>
            @if (item()!.published_at) {
              <time class="text-gray-500 font-medium">{{ item()!.published_at | date:'dd MMMM yyyy' }}</time>
            }
          </header>

          @if (item()!.cover_image_url) {
            <figure class="mb-10">
              <img [src]="item()!.cover_image_url" [alt]="item()!.title" class="w-full max-h-[26rem] object-cover rounded-xl" />
            </figure>
          }

          <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {{ item()!.content }}
          </div>

          @if (item()!.content_images?.length) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              @for (imgUrl of item()!.content_images; track imgUrl) {
                <figure class="overflow-hidden rounded-xl">
                  <img [src]="imgUrl" [alt]="item()!.title" class="w-full max-h-[26rem] object-cover" loading="lazy" />
                </figure>
              }
            </div>
          }

          @if (galleryImages().length > 0) {
            <section class="mt-12">
              <h2 class="font-heading text-2xl text-ink mb-6">Galeria zdjęć</h2>
              <div class="relative overflow-hidden rounded-xl bg-cream-dark">
                <div class="relative h-72 md:h-[28rem]">
                  <img [src]="galleryImages()[currentImage()].image_url" [alt]="item()!.title" class="w-full h-full object-cover" />
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
                      <img [src]="img.image_url" class="w-full h-full object-cover" alt="Miniatura" />
                    </button>
                  }
                </div>
              }
            </section>
          }
        </div>
      </article>
    }
  `,
})
export class AktualnoscDetailComponent implements OnInit {
  item = signal<News | null>(null);
  galleryImages = signal<GalleryImage[]>([]);
  currentImage = signal(0);

  constructor(
    private route: ActivatedRoute,
    private fb: FirebaseService,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    const data = await this.fb.getNewsBySlug(slug);
    this.item.set(data);
    if (data?.album_id) {
      const images = await this.fb.listGalleryImages(data.album_id);
      this.galleryImages.set(images ?? []);
      this.currentImage.set(0);
    }
  }

  prevImage() {
    this.currentImage.update(i => (i - 1 + this.galleryImages().length) % this.galleryImages().length);
  }

  nextImage() {
    this.currentImage.update(i => (i + 1) % this.galleryImages().length);
  }
}
