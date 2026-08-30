import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LightboxComponent } from '../../shared/components/lightbox/lightbox.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { GalleryAlbum, GalleryImage } from '../../core/models/database.types';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [PageHeaderComponent, LightboxComponent, RouterLink],
  template: `
    @if (album()) {
      <app-page-header [title]="album()!.title" [subtitle]="album()!.description ?? undefined" />

      <section class="py-12 md:py-16">
        <div class="container-main">
          <a routerLink="/galeria" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-10 hover:gap-3 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Wróć do galerii
          </a>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (img of images(); track img.id; let i = $index) {
              <button
                (click)="openImage(i)"
                class="comic-border-light overflow-hidden rounded-xl cursor-zoom-in group aspect-square p-0">
                <img
                  [src]="img.image_url"
                  [alt]="img.caption || album()!.title"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            } @empty {
              <div class="col-span-full text-center py-16">
                <p class="text-gray-500 text-lg">Ten album nie ma jeszcze zdjęć</p>
              </div>
            }
          </div>
        </div>
      </section>

      @if (lightboxOpen()) {
        <app-lightbox
          [isOpen]="true"
          [images]="images()"
          [currentIndex]="currentImageIndex()"
          [currentImage]="images()[currentImageIndex()] ?? null"
          (close)="closeLightbox()"
          (prev)="prevImage()"
          (next)="nextImage()" />
      }
    } @else {
      <app-page-header title="Galeria" />
      <section class="py-12">
        <div class="container-main text-center">
          <p class="text-gray-500 text-lg">Nie znaleziono albumu</p>
          <a routerLink="/galeria" class="comic-btn text-sm mt-6 bg-surface text-ink">Wróć do galerii</a>
        </div>
      </section>
    }
  `,
})
export class AlbumDetailComponent implements OnInit {
  album = signal<GalleryAlbum | null>(null);
  images = signal<GalleryImage[]>([]);
  lightboxOpen = signal(false);
  currentImageIndex = signal(0);

  constructor(
    private route: ActivatedRoute,
    private fb: FirebaseService,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    const data = await this.fb.getAlbumBySlug(slug);
    if (!data || data.is_visible === false) return;
    this.album.set(data);

    const imgs = await this.fb.listGalleryImages(data.id);
    this.images.set(imgs ?? []);
  }

  openImage(index: number) {
    this.currentImageIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  prevImage() {
    this.currentImageIndex.update(i => (i - 1 + this.images().length) % this.images().length);
  }

  nextImage() {
    this.currentImageIndex.update(i => (i + 1) % this.images().length);
  }
}