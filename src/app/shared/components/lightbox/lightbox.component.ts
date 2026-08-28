import { Component, input, output } from '@angular/core';
import { GalleryImage } from '../../../core/models/database.types';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        (click)="close.emit()">
        <button
          class="absolute top-4 right-4 text-white p-2 rounded-full border-2 border-white/30 hover:bg-white/10 transition-colors z-10"
          (click)="close.emit()">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        @if (images().length > 1) {
          <button
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full border-2 border-white/30 hover:bg-white/10 transition-colors z-10"
            (click)="prev.emit(); $event.stopPropagation()">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full border-2 border-white/30 hover:bg-white/10 transition-colors z-10"
            (click)="next.emit(); $event.stopPropagation()">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        }

        <div class="max-w-5xl max-h-[85vh] relative" (click)="$event.stopPropagation()">
          @if (currentImage()) {
            <img
              [src]="currentImage()!.image_url"
              [alt]="currentImage()!.caption || ''"
              class="max-w-full max-h-[80vh] object-contain rounded-lg border-2 border-white/20" />
            @if (currentImage()!.caption) {
              <p class="text-white text-center mt-3 text-sm">{{ currentImage()!.caption }}</p>
            }
          }
          <p class="text-white/50 text-xs text-center mt-2">
            {{ currentIndex() + 1 }} / {{ images().length }}
          </p>
        </div>
      </div>
    }
  `,
})
export class LightboxComponent {
  isOpen = input(false);
  images = input<GalleryImage[]>([]);
  currentIndex = input(0);
  currentImage = input<GalleryImage | null>(null);
  close = output<void>();
  prev = output<void>();
  next = output<void>();
}
