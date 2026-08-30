import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { GalleryAlbum } from '../../core/models/database.types';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  template: `
    <app-page-header title="Galeria" subtitle="Zdjęcia z życia naszej szkoły" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (album of albums(); track album.id) {
            <a [routerLink]="['/galeria', album.slug]" class="comic-card overflow-hidden cursor-pointer group block">
              <h3 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">
                {{ album.title }}
              </h3>
              @if (album.description) {
                <p class="text-gray-600 text-sm">{{ album.description }}</p>
              }
              <span class="inline-flex items-center gap-1 text-petrol font-heading font-semibold text-sm mt-4 uppercase tracking-wide group-hover:gap-2 transition-all">
                Zobacz zdjęcia
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </a>
          } @empty {
            <div class="col-span-full text-center py-16">
              <p class="text-gray-500 text-lg">Brak albumów do wyświetlenia</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class GaleriaComponent implements OnInit {
  albums = signal<GalleryAlbum[]>([]);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    const data = await this.fb.listAlbums();
    this.albums.set(data.filter((a) => a.is_visible !== false));
  }
}