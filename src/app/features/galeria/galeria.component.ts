import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LightboxComponent } from '../../shared/components/lightbox/lightbox.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { GalleryAlbum, GalleryImage } from '../../core/models/database.types';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [PageHeaderComponent, LightboxComponent],
  template: `
    <app-page-header title="Galeria" subtitle="Zdjęcia z życia naszej szkoły" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (album of albums(); track album.id) {
            <div class="comic-card overflow-hidden cursor-pointer group" (click)="openAlbum(album.id)">
              @if (album.cover_image_url) {
                <div class="-mx-6 -mt-6 mb-4 border-b-2 border-ink overflow-hidden">
                  <img [src]="album.cover_image_url" [alt]="album.title" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              }
              <h3 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">
                {{ album.title }}
              </h3>
              @if (album.description) {
                <p class="text-gray-600 text-sm">{{ album.description }}</p>
              }
            </div>
          } @empty {
            <div class="col-span-full text-center py-16">
              <p class="text-gray-500 text-lg">Brak albumów do wyświetlenia</p>
            </div>
          }
        </div>
      </div>
    </section>

    @if (lightboxOpen()) {
      <app-lightbox
        [isOpen]="true"
        [images]="albumImages()"
        [currentIndex]="currentImageIndex()"
        [currentImage]="albumImages()[currentImageIndex()] ?? null"
        (close)="closeLightbox()"
        (prev)="prevImage()"
        (next)="nextImage()" />
    }
  `,
})
export class GaleriaComponent implements OnInit {
  albums = signal<GalleryAlbum[]>([]);
  albumImages = signal<GalleryImage[]>([]);
  lightboxOpen = signal(false);
  currentImageIndex = signal(0);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    const data = await this.fb.listAlbums();
    this.albums.set(data.filter((a) => a.is_visible !== false));
  }

  async openAlbum(albumId: string) {
    const data = await this.fb.listGalleryImages(albumId);
    const images = data ?? [];
    if (images.length === 0) return;
    this.albumImages.set(images);
    this.currentImageIndex.set(0);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  prevImage() {
    this.currentImageIndex.update(i => (i - 1 + this.albumImages().length) % this.albumImages().length);
  }

  nextImage() {
    this.currentImageIndex.update(i => (i + 1) % this.albumImages().length);
  }
}
