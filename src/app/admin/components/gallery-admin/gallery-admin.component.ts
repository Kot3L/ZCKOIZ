import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { GalleryAlbum, GalleryImage } from '../../../core/models/database.types';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Galeria</h1>
        </div>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      <div class="comic-card">
        <h2 class="font-heading text-xl text-orange-primary mb-4">Nowy album</h2>
        <form (submit)="createAlbum($event)" class="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
          <input [(ngModel)]="newAlbumTitle" name="albumTitle" required placeholder="Tytuł albumu" class="w-full md:w-auto md:flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
          <input [(ngModel)]="newAlbumDesc" name="albumDesc" placeholder="Opis" class="w-full md:w-auto md:flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
          <label class="flex items-center gap-2 shrink-0 text-sm text-ink font-semibold cursor-pointer">
            <input type="checkbox" [(ngModel)]="newAlbumVisible" name="albumVisible" id="albumVisible" class="w-4 h-4" />
            Pokaż w galerii
          </label>
          <button type="submit" class="comic-btn-primary text-xs !py-2 !px-4 shrink-0">Utwórz</button>
        </form>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-busy="true">
          @for (s of [1,2]; track s) {
            <div class="comic-card">
              <app-skeleton type="title" [style.width]="'50%'"/>
              <div class="flex flex-wrap gap-2 mt-4">
                @for (img of [1,2,3,4,5]; track img) {
                  <app-skeleton type="rect" [style]="{ width: '96px', height: '80px', 'aspect-ratio': 'auto' }" class="rounded-lg"/>
                }
              </div>
            </div>
          }
        </div>
      } @else {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (album of albums(); track album.id) {
          <div class="comic-card">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-heading text-lg text-ink">{{ album.title }}</h3>
                @if (album.description) {
                  <p class="text-sm text-gray-500">{{ album.description }}</p>
                }
                <label class="inline-flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" [checked]="album.is_visible !== false"
                    (change)="toggleVisibility(album, $event)" class="w-4 h-4" />
                  <span class="text-sm text-ink font-medium">Pokaż w galerii</span>
                </label>
              </div>
              <button (click)="deleteAlbum(album)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              @for (img of imagesByAlbum(album.id); track img.id) {
                <div class="relative group">
                  @if (!failedImages().has(img.id)) {
                    <img [src]="img.image_url" (error)="onImageError(img)" class="w-24 h-20 object-cover rounded border-2 border-ink" />
                  } @else {
                    <div class="w-24 h-20 rounded border-2 border-red-400 bg-cream-dark flex items-center justify-center p-1 text-[10px] leading-tight text-center text-gray-500 break-all">
                      Nie ładuje się — sprawdź URL
                    </div>
                  }
                  <button
                    (click)="deleteImage(img)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center border border-ink">×</button>
                </div>
              }
              @if (imagesByAlbum(album.id).length === 0) {
                <p class="text-gray-400 text-sm w-full">Brak zdjęć</p>
              }
            </div>

            <div class="flex items-center gap-2">
              <input #urlInput type="url" placeholder="Wklej URL zdjęcia (np. .jpg / .png)" class="flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
              <button (click)="addImageByUrl(album.id, urlInput)" class="comic-btn text-sm bg-surface text-ink">Dodaj</button>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input #imageFileInput type="file" accept="image/*" class="hidden" (change)="addImageFromFile(album.id, $event)" />
              <button type="button" (click)="imageFileInput.click()" class="comic-btn text-sm bg-surface text-ink">Dodaj z dysku</button>
              <span class="text-xs text-gray-500">JPG, PNG, WEBP</span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-16 comic-card">
            <p class="text-gray-500">Utwórz pierwszy album, aby dodać zdjęcia.</p>
          </div>
        }
      </div>
      }
    </div>
  `,
})
export class GalleryAdminComponent implements OnInit {
  albums = signal<GalleryAlbum[]>([]);
  images = signal<GalleryImage[]>([]);
  failedImages = signal<Set<string>>(new Set());
  newAlbumTitle = '';
  newAlbumDesc = '';
  newAlbumVisible = true;
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      await Promise.all([this.loadAlbums(), this.loadImages()]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadAlbums() {
    this.albums.set(await this.fb.listAlbums());
  }

  async loadImages() {
    this.images.set(await this.fb.listAllImages());
    this.failedImages.set(new Set());
  }

  onImageError(img: GalleryImage) {
    this.failedImages.update(s => new Set(s).add(img.id));
  }

  imagesByAlbum = (albumId: string) => this.images().filter(i => i.album_id === albumId);

  async createAlbum(event: Event) {
    event.preventDefault();
    if (!this.newAlbumTitle.trim()) return;
    const slug = this.newAlbumTitle.toLowerCase().replace(/[^a-z0-9ąęśćżźół]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    try {
      await this.fb.saveAlbum({
        title: this.newAlbumTitle,
        slug,
        description: this.newAlbumDesc || null,
        display_order: this.albums().length + 1,
        is_visible: this.newAlbumVisible,
      });
      this.newAlbumTitle = '';
      this.newAlbumDesc = '';
      this.newAlbumVisible = true;
      this.setMessage('Album utworzony.', 'success');
      await this.loadAlbums();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async toggleVisibility(album: GalleryAlbum, event: Event) {
    const visible = (event.target as HTMLInputElement).checked;
    try {
      await this.fb.saveAlbum({ is_visible: visible }, album.id);
      await this.loadAlbums();
      this.setMessage(visible ? 'Album widoczny w galerii.' : 'Album ukryty w galerii.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async deleteAlbum(album: GalleryAlbum) {
    if (!confirm(`Usunąć album "${album.title}" wraz ze zdjęciami?`)) return;
    try {
      for (const img of this.imagesByAlbum(album.id)) {
        await this.fb.deleteImage(img.id);
        await this.fb.deleteGalleryImageData(img.id);
      }
      await this.fb.deleteAlbum(album.id);
      this.setMessage('Usunięto.', 'success');
      await Promise.all([this.loadAlbums(), this.loadImages()]);
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async addImageByUrl(albumId: string, input: HTMLInputElement) {
    const url = input.value.trim();
    if (!url) return;
    try {
      await this.fb.saveImage({
        album_id: albumId,
        image_url: url,
        display_order: this.imagesByAlbum(albumId).length,
      });
      input.value = '';
      this.setMessage('Zdjęcie dodane.', 'success');
      await this.loadImages();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e?.message ?? e), 'error');
    }
  }

  async addImageFromFile(albumId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    try {
      const dataUrl = await this.readFile(file);
      const id = await this.fb.saveImage({
        album_id: albumId,
        image_url: '',
        display_order: this.imagesByAlbum(albumId).length,
      });
      if (!id) throw new Error('Nie udało się utworzyć zdjęcia.');
      await this.fb.saveGalleryImageData(id, dataUrl);
      await this.fb.saveImage({ image_url: `firestore:${id}` }, id);
      this.setMessage('Zdjęcie dodane.', 'success');
      await this.loadImages();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e?.message ?? e), 'error');
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Nie udało się odczytać zdjęcia.'));
      reader.onerror = () => reject(new Error('Nie udało się odczytać zdjęcia.'));
      reader.readAsDataURL(file);
    });
  }

  async deleteImage(img: GalleryImage) {
    try {
      await this.fb.deleteImage(img.id);
      await this.fb.deleteGalleryImageData(img.id);
      this.setMessage('Usunięto.', 'success');
      await this.loadImages();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}
